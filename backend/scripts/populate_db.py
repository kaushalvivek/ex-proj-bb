import sys
import os
import random
from datetime import datetime, timedelta
import sqlite3
from passlib.context import CryptContext

# Add the parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.database import SessionLocal, engine
from backend.models.models import Base, User, Stock, Holding, Transaction
from sqlalchemy.orm import Session

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the database tables
Base.metadata.create_all(bind=engine)

# Get a database session
db = SessionLocal()

# Sample Indian stocks data with realistic prices
indian_stocks = [
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd.", "exchange": "NSE", "current_price": 2587.45, "day_high": 2610.75, "day_low": 2570.20},
    {"symbol": "TCS", "name": "Tata Consultancy Services Ltd.", "exchange": "NSE", "current_price": 3645.80, "day_high": 3680.25, "day_low": 3630.50},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd.", "exchange": "NSE", "current_price": 1678.20, "day_high": 1695.10, "day_low": 1665.75},
    {"symbol": "INFY", "name": "Infosys Ltd.", "exchange": "NSE", "current_price": 1524.65, "day_high": 1540.30, "day_low": 1511.80},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd.", "exchange": "NSE", "current_price": 872.35, "day_high": 885.90, "day_low": 868.15},
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever Ltd.", "exchange": "NSE", "current_price": 2385.60, "day_high": 2410.25, "day_low": 2375.50},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd.", "exchange": "NSE", "current_price": 865.75, "day_high": 872.40, "day_low": 858.20},
    {"symbol": "ITC", "name": "ITC Ltd.", "exchange": "NSE", "current_price": 423.85, "day_high": 428.40, "day_low": 420.60},
    {"symbol": "SBIN", "name": "State Bank of India", "exchange": "NSE", "current_price": 568.40, "day_high": 575.20, "day_low": 562.75},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd.", "exchange": "NSE", "current_price": 6983.25, "day_high": 7045.80, "day_low": 6950.40},
    {"symbol": "AXISBANK", "name": "Axis Bank Ltd.", "exchange": "NSE", "current_price": 943.60, "day_high": 955.30, "day_low": 938.75},
    {"symbol": "WIPRO", "name": "Wipro Ltd.", "exchange": "NSE", "current_price": 447.50, "day_high": 452.80, "day_low": 445.20},
    {"symbol": "HCLTECH", "name": "HCL Technologies Ltd.", "exchange": "NSE", "current_price": 1185.30, "day_high": 1198.65, "day_low": 1177.90},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Ltd.", "exchange": "NSE", "current_price": 1724.45, "day_high": 1740.80, "day_low": 1715.30},
    {"symbol": "LT", "name": "Larsen & Toubro Ltd.", "exchange": "NSE", "current_price": 2836.75, "day_high": 2865.20, "day_low": 2820.40},
    {"symbol": "TATASTEEL", "name": "Tata Steel Ltd.", "exchange": "NSE", "current_price": 143.25, "day_high": 145.80, "day_low": 141.60},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Ltd.", "exchange": "NSE", "current_price": 10458.90, "day_high": 10580.45, "day_low": 10390.75},
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical Industries Ltd.", "exchange": "NSE", "current_price": 1287.65, "day_high": 1305.30, "day_low": 1275.40},
    {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv Ltd.", "exchange": "NSE", "current_price": 1625.80, "day_high": 1645.25, "day_low": 1615.50},
    {"symbol": "ASIANPAINT", "name": "Asian Paints Ltd.", "exchange": "NSE", "current_price": 3142.55, "day_high": 3175.90, "day_low": 3125.30},
    {"symbol": "TITAN", "name": "Titan Company Ltd.", "exchange": "NSE", "current_price": 3278.40, "day_high": 3315.75, "day_low": 3260.15},
    {"symbol": "ADANIPORTS", "name": "Adani Ports and Special Economic Zone Ltd.", "exchange": "NSE", "current_price": 843.25, "day_high": 855.80, "day_low": 835.60},
    {"symbol": "ADANIENT", "name": "Adani Enterprises Ltd.", "exchange": "NSE", "current_price": 2476.35, "day_high": 2510.90, "day_low": 2455.80},
    {"symbol": "NTPC", "name": "NTPC Ltd.", "exchange": "NSE", "current_price": 293.75, "day_high": 297.40, "day_low": 291.25},
    {"symbol": "POWERGRID", "name": "Power Grid Corporation of India Ltd.", "exchange": "NSE", "current_price": 283.45, "day_high": 287.80, "day_low": 281.20},
    {"symbol": "ONGC", "name": "Oil and Natural Gas Corporation Ltd.", "exchange": "NSE", "current_price": 234.85, "day_high": 238.30, "day_low": 232.50},
    {"symbol": "BPCL", "name": "Bharat Petroleum Corporation Ltd.", "exchange": "NSE", "current_price": 583.20, "day_high": 590.75, "day_low": 578.40},
    {"symbol": "COALINDIA", "name": "Coal India Ltd.", "exchange": "NSE", "current_price": 392.65, "day_high": 398.30, "day_low": 389.20},
    {"symbol": "TATAMOTORS", "name": "Tata Motors Ltd.", "exchange": "NSE", "current_price": 932.40, "day_high": 945.85, "day_low": 925.10},
    {"symbol": "BRITANNIA", "name": "Britannia Industries Ltd.", "exchange": "NSE", "current_price": 4875.30, "day_high": 4925.80, "day_low": 4845.60},
]

# Sample BSE stocks
bse_stocks = [
    {"symbol": "RPOWER", "name": "Reliance Power Ltd.", "exchange": "BSE", "current_price": 22.35, "day_high": 22.95, "day_low": 22.10},
    {"symbol": "YESBANK", "name": "Yes Bank Ltd.", "exchange": "BSE", "current_price": 18.75, "day_high": 19.20, "day_low": 18.45},
    {"symbol": "SUZLON", "name": "Suzlon Energy Ltd.", "exchange": "BSE", "current_price": 35.40, "day_high": 36.10, "day_low": 35.05},
    {"symbol": "IDEA", "name": "Vodafone Idea Ltd.", "exchange": "BSE", "current_price": 12.85, "day_high": 13.20, "day_low": 12.65},
    {"symbol": "ZEEL", "name": "Zee Entertainment Enterprises Ltd.", "exchange": "BSE", "current_price": 282.60, "day_high": 287.40, "day_low": 280.15},
    {"symbol": "PNB", "name": "Punjab National Bank", "exchange": "BSE", "current_price": 82.75, "day_high": 84.30, "day_low": 81.90},
    {"symbol": "BANKBARODA", "name": "Bank of Baroda", "exchange": "BSE", "current_price": 217.45, "day_high": 220.80, "day_low": 215.30},
    {"symbol": "IRCTC", "name": "Indian Railway Catering and Tourism Corporation Ltd.", "exchange": "BSE", "current_price": 745.85, "day_high": 755.40, "day_low": 740.20},
    {"symbol": "INDIGO", "name": "InterGlobe Aviation Ltd.", "exchange": "BSE", "current_price": 3245.65, "day_high": 3285.30, "day_low": 3225.10},
    {"symbol": "HEROMOTOCO", "name": "Hero MotoCorp Ltd.", "exchange": "BSE", "current_price": 4372.80, "day_high": 4420.45, "day_low": 4350.30},
]

def populate_stocks():
    """Add sample stocks to the database"""
    print("Adding sample stocks...")
    
    # Check if stocks already exist
    existing_stocks = db.query(Stock).count()
    if existing_stocks > 0:
        print(f"Database already has {existing_stocks} stocks. Skipping stock creation.")
        return
    
    # Add NSE stocks
    for stock_data in indian_stocks:
        stock = Stock(**stock_data)
        db.add(stock)
    
    # Add BSE stocks
    for stock_data in bse_stocks:
        stock = Stock(**stock_data)
        db.add(stock)
    
    db.commit()
    print(f"Added {len(indian_stocks) + len(bse_stocks)} stocks")

def create_demo_user():
    """Create a demo user if it doesn't exist"""
    print("Creating demo user...")
    
    # Check if the demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@example.com").first()
    if demo_user:
        print("Demo user already exists. Skipping user creation.")
        return demo_user
    
    # Create a new demo user
    hashed_password = pwd_context.hash("password123")
    demo_user = User(
        name="Demo User",
        email="demo@example.com",
        hashed_password=hashed_password,
        pan_number="ABCDE1234F",
        phone="+919876543210",
        balance=1000000.0  # 10 Lakh initial balance
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    print("Created demo user with 10,00,000 INR balance")
    return demo_user

def create_transactions_and_holdings(user_id):
    """Create random transactions and holdings for the user"""
    print("Creating transactions and holdings...")
    
    # Check if transactions already exist for this user
    transaction_count = db.query(Transaction).filter(Transaction.user_id == user_id).count()
    if transaction_count > 0:
        print(f"User already has {transaction_count} transactions. Skipping transaction creation.")
        return
    
    # Get all stocks
    stocks = db.query(Stock).all()
    
    # Create transactions over the past 6 months
    now = datetime.now()
    start_date = now - timedelta(days=180)
    
    # Select 15 random stocks to build a portfolio
    portfolio_stocks = random.sample(stocks, 15)
    
    # For each stock in the portfolio, create 3-8 transactions
    for stock in portfolio_stocks:
        # Decide if this will be a profitable stock or not (70% chance of profit)
        is_profitable = random.random() < 0.7
        
        # Number of transactions for this stock
        num_transactions = random.randint(3, 8)
        
        # Create buy transactions first
        for i in range(num_transactions):
            # Random date within the past 6 months, keeping chronological order
            days_ago = random.randint(0, 180 - (i * 10))
            transaction_date = now - timedelta(days=days_ago)
            
            # Quantity between 1 and 50
            quantity = random.randint(1, 50)
            
            # For profitable stocks, buy at lower prices; for unprofitable, buy at higher prices
            if is_profitable:
                price_factor = random.uniform(0.8, 0.95)  # 80-95% of current price
            else:
                price_factor = random.uniform(1.05, 1.2)  # 105-120% of current price
            
            price = stock.current_price * price_factor
            
            # Calculate total amount
            total_amount = price * quantity
            
            # Create the transaction
            transaction = Transaction(
                user_id=user_id,
                stock_id=stock.id,
                transaction_type="BUY",
                quantity=quantity,
                price=price,
                total_amount=total_amount,
                timestamp=transaction_date
            )
            db.add(transaction)
    
    db.commit()
    
    # Now create holdings based on transactions
    update_holdings(user_id)
    print("Created transactions and updated holdings")

def update_holdings(user_id):
    """Update holdings based on transactions"""
    # Clear existing holdings for the user
    db.query(Holding).filter(Holding.user_id == user_id).delete()
    db.commit()
    
    # Get all user's transactions
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    
    # Group transactions by stock
    holdings_data = {}
    for transaction in transactions:
        stock_id = transaction.stock_id
        
        if stock_id not in holdings_data:
            holdings_data[stock_id] = {
                "quantity": 0,
                "total_cost": 0
            }
        
        if transaction.transaction_type == "BUY":
            holdings_data[stock_id]["quantity"] += transaction.quantity
            holdings_data[stock_id]["total_cost"] += transaction.total_amount
        else:
            holdings_data[stock_id]["quantity"] -= transaction.quantity
            holdings_data[stock_id]["total_cost"] -= transaction.total_amount
    
    # Create holdings for stocks with positive quantities
    for stock_id, data in holdings_data.items():
        if data["quantity"] > 0:
            average_price = data["total_cost"] / data["quantity"]
            
            holding = Holding(
                user_id=user_id,
                stock_id=stock_id,
                quantity=data["quantity"],
                average_price=average_price
            )
            db.add(holding)
    
    db.commit()

def main():
    """Main function to populate the database"""
    try:
        # Add stocks
        populate_stocks()
        
        # Create demo user
        demo_user = create_demo_user()
        
        # Create transactions and holdings for the demo user
        create_transactions_and_holdings(demo_user.id)
        
        print("Database successfully populated with dummy data!")
    except Exception as e:
        print(f"Error populating database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main() 