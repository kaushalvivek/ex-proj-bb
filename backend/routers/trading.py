from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

from backend.models.models import User, Stock, Holding, Transaction
from backend.schemas.schemas import Stock as StockSchema, StockCreate, Transaction as TransactionSchema, TransactionCreate, Holding as HoldingSchema, PortfolioSummary
from backend.utils.auth import get_current_active_user
from backend.database.database import get_db

router = APIRouter(
    prefix="/trading",
    tags=["trading"],
)

@router.get("/stocks", response_model=List[StockSchema])
async def get_stocks(db: Session = Depends(get_db)):
    return db.query(Stock).all()

@router.get("/stocks/{stock_id}", response_model=StockSchema)
async def get_stock(stock_id: int, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock

@router.post("/stocks", response_model=StockSchema, status_code=status.HTTP_201_CREATED)
async def create_stock(
    stock: StockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if stock already exists by symbol
    existing_stock = db.query(Stock).filter(Stock.symbol == stock.symbol).first()
    if existing_stock:
        raise HTTPException(status_code=400, detail="Stock already exists")
    
    db_stock = Stock(**stock.dict())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock

@router.get("/portfolio", response_model=PortfolioSummary)
async def get_portfolio(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    holdings = db.query(Holding).filter(Holding.user_id == current_user.id).all()
    
    # Calculate portfolio summary
    invested_value = sum(holding.average_price * holding.quantity for holding in holdings)
    
    # Calculate current value based on current stock prices
    current_value = 0
    for holding in holdings:
        stock = db.query(Stock).filter(Stock.id == holding.stock_id).first()
        current_value += stock.current_price * holding.quantity
    
    return {
        "invested_value": invested_value,
        "current_value": current_value,
        "pnl": current_value - invested_value,
        "holdings": holdings
    }

@router.get("/holdings", response_model=List[HoldingSchema])
async def get_holdings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(Holding).filter(Holding.user_id == current_user.id).all()

@router.post("/buy", response_model=TransactionSchema)
async def buy_stock(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Validate transaction type
    if transaction.transaction_type != "BUY":
        raise HTTPException(status_code=400, detail="Transaction type must be BUY")
    
    # Get stock and validate
    stock = db.query(Stock).filter(Stock.id == transaction.stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    # Calculate total amount
    total_amount = transaction.price * transaction.quantity
    
    # Check if user has enough balance
    if current_user.balance < total_amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    # Update user balance
    current_user.balance -= total_amount
    
    # Create transaction
    db_transaction = Transaction(
        user_id=current_user.id,
        stock_id=transaction.stock_id,
        transaction_type="BUY",
        quantity=transaction.quantity,
        price=transaction.price,
        total_amount=total_amount
    )
    db.add(db_transaction)
    
    # Update or create holding
    holding = db.query(Holding).filter(
        Holding.user_id == current_user.id,
        Holding.stock_id == transaction.stock_id
    ).first()
    
    if holding:
        # Update existing holding with new average price
        total_shares = holding.quantity + transaction.quantity
        new_avg_price = ((holding.average_price * holding.quantity) + (transaction.price * transaction.quantity)) / total_shares
        holding.quantity = total_shares
        holding.average_price = new_avg_price
    else:
        # Create new holding
        db_holding = Holding(
            user_id=current_user.id,
            stock_id=transaction.stock_id,
            quantity=transaction.quantity,
            average_price=transaction.price
        )
        db.add(db_holding)
    
    db.commit()
    db.refresh(db_transaction)
    
    # Return transaction with stock details
    return db_transaction

@router.post("/sell", response_model=TransactionSchema)
async def sell_stock(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Validate transaction type
    if transaction.transaction_type != "SELL":
        raise HTTPException(status_code=400, detail="Transaction type must be SELL")
    
    # Get stock and validate
    stock = db.query(Stock).filter(Stock.id == transaction.stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    # Check if user has the holding
    holding = db.query(Holding).filter(
        Holding.user_id == current_user.id,
        Holding.stock_id == transaction.stock_id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=400, detail="You don't own this stock")
    
    if holding.quantity < transaction.quantity:
        raise HTTPException(status_code=400, detail="Insufficient shares to sell")
    
    # Calculate total amount
    total_amount = transaction.price * transaction.quantity
    
    # Update user balance
    current_user.balance += total_amount
    
    # Create transaction
    db_transaction = Transaction(
        user_id=current_user.id,
        stock_id=transaction.stock_id,
        transaction_type="SELL",
        quantity=transaction.quantity,
        price=transaction.price,
        total_amount=total_amount
    )
    db.add(db_transaction)
    
    # Update holding
    holding.quantity -= transaction.quantity
    
    # Remove holding if quantity is zero
    if holding.quantity == 0:
        db.delete(holding)
    
    db.commit()
    db.refresh(db_transaction)
    
    # Return transaction with stock details
    return db_transaction

@router.get("/transactions", response_model=List[TransactionSchema])
async def get_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(Transaction).filter(Transaction.user_id == current_user.id).all() 