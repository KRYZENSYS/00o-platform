"""Payments, Subscriptions, Tokens, Referrals endpoints."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.payment import Payment, Subscription
from app.models.token import TokenTransaction, Referral

router = APIRouter()


class SubscribeRequest(BaseModel):
    plan: str  # pro, business
    provider: str = "stripe"
    autoRenew: bool = True


class BuyTokensRequest(BaseModel):
    amount: int
    provider: str = "stripe"


class PaymentIntentRequest(BaseModel):
    type: str
    amount: float
    planId: Optional[str] = None


PLANS = {
    "pro": {"name": "Pro", "price": 99000, "duration_days": 30, "tokens": 500, "ai_daily": 100, "features": ["Unlimited projects", "Priority support", "Advanced AI"]},
    "business": {"name": "Business", "price": 299000, "duration_days": 30, "tokens": 2000, "ai_daily": 1000, "features": ["Everything in Pro", "Team management", "API access", "Custom integrations"]},
    "enterprise": {"name": "Enterprise", "price": 999000, "duration_days": 30, "tokens": 10000, "ai_daily": -1, "features": ["Custom", "SLA", "Dedicated support"]},
}


@router.post("/intent")
async def create_payment_intent(data: PaymentIntentRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Create payment intent."""
    payment = Payment(
        user_id=user.id,
        type=data.type,
        amount=data.amount,
        currency="UZS",
        provider="stripe",
        status="pending",
        transaction_id=f"pi_{uuid.uuid4().hex[:24]}",
    )
    db.add(payment)
    await db.flush()
    return {
        "success": True,
        "data": {
            "paymentId": payment.id,
            "clientSecret": f"{payment.transaction_id}_secret_{uuid.uuid4().hex[:16]}",
            "amount": data.amount,
            "currency": "UZS",
        }
    }


@router.post("/stripe/webhook")
async def stripe_webhook(data: dict, db: AsyncSession = Depends(get_db)):
    """Stripe webhook handler."""
    event_type = data.get("type")
    obj = data.get("data", {}).get("object", {})

    if event_type == "payment_intent.succeeded":
        tx_id = obj.get("id")
        result = await db.execute(select(Payment).where(Payment.transaction_id == tx_id))
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = "completed"
            payment.paid_at = datetime.utcnow()
            # Process the payment
            await process_payment_success(payment, db)
    elif event_type == "payment_intent.payment_failed":
        tx_id = obj.get("id")
        result = await db.execute(select(Payment).where(Payment.transaction_id == tx_id))
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = "failed"

    return {"success": True, "data": {"received": True}}


@router.post("/payme")
async def payme_callback(data: dict, db: AsyncSession = Depends(get_db)):
    """Payme.uz callback."""
    # TODO: verify signature with PAYME_SECRET_KEY
    method = data.get("method")
    params = data.get("params", {})

    if method == "transactions.performTransaction":
        tx_id = params.get("id")
        result = await db.execute(select(Payment).where(Payment.transaction_id == tx_id))
        payment = result.scalar_one_or_none()
        if payment and payment.status == "pending":
            payment.status = "completed"
            payment.paid_at = datetime.utcnow()
            await process_payment_success(payment, db)
            return {"result": {"transaction": tx_id, "state": 2}}
    return {"result": {"state": 1}}


@router.post("/click")
async def click_callback(data: dict, db: AsyncSession = Depends(get_db)):
    """Click.uz callback."""
    # TODO: verify signature with CLICK_SECRET_KEY
    action = data.get("action")
    tx_id = data.get("merchant_trans_id")

    if action == 1:  # prepare
        return {"error": 0, "error_note": "Success", "click_trans_id": data.get("click_trans_id")}
    elif action == 0:  # complete
        result = await db.execute(select(Payment).where(Payment.transaction_id == tx_id))
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = "completed"
            payment.paid_at = datetime.utcnow()
            await process_payment_success(payment, db)
        return {"error": 0, "error_note": "Success", "click_trans_id": data.get("click_trans_id")}
    return {"error": -1, "error_note": "Failed"}


async def process_payment_success(payment: Payment, db: AsyncSession):
    """Process successful payment."""
    user = await db.execute(select(User).where(User.id == payment.user_id))
    user = user.scalar_one_or_none()
    if not user:
        return

    if payment.type == "subscription":
        # Activate subscription
        plan = PLANS.get(payment.metadata_json.get("plan", "pro"), PLANS["pro"])
        expires = datetime.utcnow() + timedelta(days=plan["duration_days"])
        sub = Subscription(
            user_id=user.id,
            plan=payment.metadata_json.get("plan", "pro"),
            status="active",
            expires_at=expires,
            payment_id=payment.id,
        )
        db.add(sub)
        user.is_premium = True
        user.tokens = (user.tokens or 0) + plan["tokens"]

    elif payment.type == "tokens":
        # Add tokens
        amount = payment.metadata_json.get("amount", 0)
        user.tokens = (user.tokens or 0) + amount
        tx = TokenTransaction(
            user_id=user.id,
            type="buy",
            amount=amount,
            balance_after=user.tokens,
            reason=f"Purchased {amount} tokens",
        )
        db.add(tx)

    elif payment.type == "order":
        # Activate order
        pass


@router.get("/history")
async def payment_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at.desc()).limit(50)
    )
    return {"success": True, "data": [p.to_dict() for p in result.scalars().all()]}


# ===== SUBSCRIPTIONS =====

@router.get("/plans")
async def get_plans():
    """Get subscription plans."""
    plans = []
    for plan_id, plan in PLANS.items():
        plans.append({
            "id": plan_id,
            "name": plan["name"],
            "price": plan["price"],
            "currency": "UZS",
            "durationDays": plan["duration_days"],
            "tokens": plan["tokens"],
            "aiDailyLimit": plan["ai_daily"],
            "features": plan["features"],
        })
    return {"success": True, "data": plans}


@router.get("/current")
async def current_subscription(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == user.id, Subscription.status == "active")
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    sub = result.scalar_one_or_none()
    return {"success": True, "data": sub.to_dict() if sub else None}


@router.post("/subscribe")
async def subscribe(data: SubscribeRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if data.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    plan = PLANS[data.plan]
    # Create payment
    payment = Payment(
        user_id=user.id,
        type="subscription",
        amount=plan["price"],
        currency="UZS",
        provider=data.provider,
        status="pending",
        transaction_id=f"sub_{uuid.uuid4().hex[:24]}",
        metadata_json={"plan": data.plan},
    )
    db.add(payment)
    await db.flush()
    return {"success": True, "data": {"paymentId": payment.id, "plan": data.plan, "amount": plan["price"]}}


@router.post("/cancel")
async def cancel_subscription(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == user.id, Subscription.status == "active")
    )
    subs = result.scalars().all()
    for sub in subs:
        sub.status = "cancelled"
        sub.cancelled_at = datetime.utcnow()
        sub.auto_renew = False
    user.is_premium = False
    return {"success": True, "data": {"cancelled": True}}


@router.get("/invoices")
async def invoices(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == user.id, Payment.type == "subscription", Payment.status == "completed")
        .order_by(Payment.created_at.desc())
    )
    return {"success": True, "data": [p.to_dict() for p in result.scalars().all()]}


# ===== TOKENS =====

@router.get("/balance")
async def get_balance(user: User = Depends(get_current_user)):
    return {"success": True, "data": {"tokens": user.tokens, "xp": user.xp, "level": user.level}}


@router.post("/buy")
async def buy_tokens(data: BuyTokensRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if data.amount < 10:
        raise HTTPException(status_code=400, detail="Minimum 10 tokens")
    payment = Payment(
        user_id=user.id,
        type="tokens",
        amount=data.amount * settings.TOKEN_PRICE,
        currency="UZS",
        provider=data.provider,
        status="pending",
        transaction_id=f"tok_{uuid.uuid4().hex[:24]}",
        metadata_json={"amount": data.amount},
    )
    db.add(payment)
    await db.flush()
    return {"success": True, "data": {"paymentId": payment.id, "amount": data.amount, "price": data.amount * settings.TOKEN_PRICE}}


@router.post("/spend")
async def spend_tokens(data: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    amount = data.get("amount", 0)
    if user.tokens < amount:
        raise HTTPException(status_code=400, detail="Insufficient tokens")
    user.tokens -= amount
    tx = TokenTransaction(
        user_id=user.id,
        type="spend",
        amount=-amount,
        balance_after=user.tokens,
        reason=data.get("reason", "Spend"),
    )
    db.add(tx)
    return {"success": True, "data": {"tokens": user.tokens}}


@router.get("/history")
async def token_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TokenTransaction).where(TokenTransaction.user_id == user.id).order_by(TokenTransaction.created_at.desc()).limit(50)
    )
    return {"success": True, "data": [t.to_dict() for t in result.scalars().all()]}


# ===== REFERRALS =====

@router.get("/code")
async def my_referral_code(user: User = Depends(get_current_user)):
    return {"success": True, "data": {"code": f"ref_{user.id}", "link": f"https://00o.uz/auth/register?ref={user.id}"}}


@router.get("/stats")
async def referral_stats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(Referral.id), func.coalesce(func.sum(Referral.bonus_referrer), 0))
        .where(Referral.referrer_id == user.id)
    )
    count, total_bonus = result.one()
    return {"success": True, "data": {"count": count or 0, "totalBonus": total_bonus or 0}}


@router.post("/process")
async def process_referral(data: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    code = data.get("code", "")
    referrer_id = code.replace("ref_", "")
    if referrer_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")
    result = await db.execute(select(User).where(User.id == referrer_id))
    referrer = result.scalar_one_or_none()
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    if user.referred_by:
        raise HTTPException(status_code=400, detail="Already used referral")

    user.referred_by = referrer.id
    referrer.referral_count = (referrer.referral_count or 0) + 1
    user.tokens += settings.REFERRAL_BONUS
    referrer.tokens += settings.REFERRAL_BONUS

    referral = Referral(
        referrer_id=referrer.id,
        referred_id=user.id,
        code=code,
        bonus_referrer=settings.REFERRAL_BONUS,
        bonus_referred=settings.REFERRAL_BONUS,
    )
    db.add(referral)
    return {"success": True, "data": {"bonus": settings.REFERRAL_BONUS}}


@router.get("/list")
async def referral_list(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Referral).where(Referral.referrer_id == user.id).order_by(Referral.created_at.desc())
    )
    return {"success": True, "data": [r.to_dict() for r in result.scalars().all()]}
