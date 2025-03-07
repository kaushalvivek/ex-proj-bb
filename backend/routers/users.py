from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.models.models import User
from backend.schemas.schemas import User as UserSchema, UserUpdate, FundAdd
from backend.utils.auth import get_current_active_user
from backend.database.database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user(
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Update user fields if they are provided
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/funds", response_model=UserSchema)
async def add_funds(
    funds: FundAdd,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    current_user.balance += funds.amount
    db.commit()
    db.refresh(current_user)
    return current_user 