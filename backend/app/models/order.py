from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    razorpay_order_id = Column(String(100), unique=True, index=True, nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    amount = Column(Integer, nullable=False)  # in paise
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="created", nullable=False)  # created, paid, failed
    package_type = Column(String(50), nullable=False)  # explorer, professional, enterprise
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
