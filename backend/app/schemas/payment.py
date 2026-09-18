from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class PackageResponse(BaseModel):
    id: str
    name: str
    price_inr: int
    price_paise: int
    popular: Optional[bool] = False
    features: List[str]
    limits: Dict[str, Any]

class CreateOrderRequest(BaseModel):
    package_id: str  # explorer, professional, enterprise

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    package_id: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    package_id: str

class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    payment_id: str
    subscription_tier: str

class OrderHistoryResponse(BaseModel):
    id: int
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    amount: int
    currency: str
    status: str
    package_type: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
