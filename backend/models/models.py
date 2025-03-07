from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    pan_number = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # User can have multiple holdings
    holdings = relationship("Holding", back_populates="user")
    
    # User can have multiple transactions
    transactions = relationship("Transaction", back_populates="user")
    
    # User account balance
    balance = Column(Float, default=0.0)

class Stock(Base):
    __tablename__ = "stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    current_price = Column(Float)
    day_high = Column(Float)
    day_low = Column(Float)
    exchange = Column(String)
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Stock can be in multiple holdings
    holdings = relationship("Holding", back_populates="stock")
    
    # Stock can have multiple transactions
    transactions = relationship("Transaction", back_populates="stock")

class Holding(Base):
    __tablename__ = "holdings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    stock_id = Column(Integer, ForeignKey("stocks.id"))
    quantity = Column(Integer)
    average_price = Column(Float)
    
    user = relationship("User", back_populates="holdings")
    stock = relationship("Stock", back_populates="holdings")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    stock_id = Column(Integer, ForeignKey("stocks.id"))
    transaction_type = Column(String)  # "BUY" or "SELL"
    quantity = Column(Integer)
    price = Column(Float)
    total_amount = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="transactions")
    stock = relationship("Stock", back_populates="transactions") 