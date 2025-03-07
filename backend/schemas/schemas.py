from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    pan_number: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    pan_number: Optional[str] = None
    phone: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    balance: float
    created_at: datetime
    
    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Stock schemas
class StockBase(BaseModel):
    symbol: str
    name: str
    exchange: str

class StockCreate(StockBase):
    current_price: float
    day_high: float
    day_low: float

class StockUpdate(BaseModel):
    current_price: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None

class Stock(StockBase):
    id: int
    current_price: float
    day_high: float
    day_low: float
    last_updated: Optional[datetime] = None
    
    class Config:
        orm_mode = True

# Holding schemas
class HoldingBase(BaseModel):
    stock_id: int
    quantity: int
    average_price: float

class HoldingCreate(HoldingBase):
    pass

class Holding(HoldingBase):
    id: int
    user_id: int
    stock: Stock
    
    class Config:
        orm_mode = True

# Transaction schemas
class TransactionBase(BaseModel):
    stock_id: int
    transaction_type: str
    quantity: int
    price: float

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    total_amount: float
    timestamp: datetime
    stock: Stock
    
    class Config:
        orm_mode = True

# Fund schemas
class FundAdd(BaseModel):
    amount: float = Field(..., gt=0)

class PortfolioSummary(BaseModel):
    invested_value: float
    current_value: float
    pnl: float
    holdings: List[Holding] 