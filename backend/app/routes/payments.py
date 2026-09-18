import json
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.order import Order
from app.models.payment import Payment
from app.schemas.payment import (
    PackageResponse, CreateOrderRequest, CreateOrderResponse,
    VerifyPaymentRequest, VerifyPaymentResponse, OrderHistoryResponse
)
from app.services.auth_service import get_current_user
from app.services.razorpay_service import (
    create_order, verify_signature, verify_webhook_signature,
    get_package_info, PACKAGE_PRICES
)
from app.config import settings

logger = logging.getLogger("darukaa.payments")
router = APIRouter(prefix="/payments", tags=["Payments & Subscriptions"])

PACKAGES_DATA = [
    {
        "id": "explorer",
        "name": "Explorer",
        "price_inr": 0,
        "price_paise": 0,
        "popular": False,
        "features": [
            "Project Dashboard & Overview",
            "Interactive Mapbox GIS Explorer",
            "Basic Site Polygon Visualization",
            "Basic Site Metric Cards"
        ],
        "limits": {"max_projects": 3, "max_sites": 5, "ai_insights": False, "pdf_reports": False}
    },
    {
        "id": "professional",
        "name": "Professional",
        "price_inr": 499,
        "price_paise": 49900,
        "popular": True,
        "features": [
            "Everything in Explorer",
            "AI Site Summaries (Gemini Grounded)",
            "Environmental Anomaly Detection",
            "Cross-Variable Recommendation Engine",
            "12-Month Trend Analytics & Charting",
            "PDF Report Generation & Download",
            "Automated Environmental Alerts"
        ],
        "limits": {"max_projects": 15, "max_sites": 50, "ai_insights": True, "pdf_reports": True}
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "price_inr": 1499,
        "price_paise": 149900,
        "popular": False,
        "features": [
            "Everything in Professional",
            "Unlimited Projects & Geographical Sites",
            "AI Project Executive Summaries",
            "Natural Language 'Ask Darukaa AI'",
            "Multi-Site Comparative Analytics",
            "Priority PostGIS Spatial Data Export",
            "Dedicated Support & Audit Logging"
        ],
        "limits": {"max_projects": -1, "max_sites": -1, "ai_insights": True, "pdf_reports": True}
    }
]

@router.get("/packages", response_model=List[PackageResponse])
def get_packages():
    return PACKAGES_DATA

@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        pkg = get_package_info(req.package_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    order_res = create_order(req.package_id, current_user.id)

    new_order = Order(
        user_id=current_user.id,
        razorpay_order_id=order_res["id"],
        amount=order_res["amount"],
        currency=order_res.get("currency", "INR"),
        status="created" if order_res["amount"] > 0 else "paid",
        package_type=req.package_id.lower()
    )
    db.add(new_order)

    # If free explorer tier, upgrade immediately
    if order_res["amount"] == 0:
        current_user.subscription_tier = "FREE"

    db.commit()
    db.refresh(new_order)

    return CreateOrderResponse(
        order_id=order_res["id"],
        amount=order_res["amount"],
        currency=order_res.get("currency", "INR"),
        key_id=settings.RAZORPAY_KEY_ID,
        package_id=req.package_id
    )

@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment(
    req: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    is_valid = verify_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    order = db.query(Order).filter(Order.razorpay_order_id == req.razorpay_order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "paid"
    order.razorpay_payment_id = req.razorpay_payment_id

    # Add Payment record
    payment = Payment(
        order_id=order.id,
        razorpay_payment_id=req.razorpay_payment_id,
        signature=req.razorpay_signature,
        status="captured"
    )
    db.add(payment)

    # Activate Premium Tier on User
    pkg = PACKAGE_PRICES.get(req.package_id.lower(), {})
    target_tier = pkg.get("tier", "PROFESSIONAL")
    current_user.subscription_tier = target_tier

    db.commit()

    return VerifyPaymentResponse(
        success=True,
        message=f"Payment verified successfully. Upgraded to {target_tier} plan!",
        payment_id=req.razorpay_payment_id,
        subscription_tier=target_tier
    )

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    body = await request.body()
    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing webhook signature")

    # In production verify webhook signature:
    # if not verify_webhook_signature(body, x_razorpay_signature):
    #     raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        event = json.loads(body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = event.get("event")
    logger.info(f"Received Razorpay Webhook Event: {event_type}")

    if event_type in ["payment.captured", "order.paid"]:
        payment_entity = event.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        if order_id:
            order = db.query(Order).filter(Order.razorpay_order_id == order_id).first()
            if order and order.status != "paid":
                order.status = "paid"
                order.razorpay_payment_id = payment_id
                pkg = PACKAGE_PRICES.get(order.package_type, {})
                tier = pkg.get("tier", "PROFESSIONAL")
                if order.user:
                    order.user.subscription_tier = tier
                db.commit()

    return {"status": "ok"}

@router.get("/orders", response_model=List[OrderHistoryResponse])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders
