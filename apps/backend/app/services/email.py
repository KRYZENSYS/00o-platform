"""Email service."""
from typing import Optional
from loguru import logger
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


TEMPLATES = {
    "verify_email": {
        "subject": "Emailni tasdiqlang - 00o.uz",
        "body": """
        <h1>Salom, {name}!</h1>
        <p>00o.uz ga xush kelibsiz. Emailingizni tasdiqlash uchun quyidagi havolani bosing:</p>
        <p><a href="{app_url}/auth/verify?token={token}">Emailni tasdiqlash</a></p>
        <p>Yoki kodni kiriting: <strong>{token}</strong></p>
        """
    },
    "reset_password": {
        "subject": "Parolni tiklash - 00o.uz",
        "body": """
        <h1>Salom, {name}!</h1>
        <p>Parolni tiklash uchun quyidagi havolani bosing:</p>
        <p><a href="{app_url}/auth/reset?token={token}">Parolni tiklash</a></p>
        <p>Havola 1 soat ichida amal qiladi.</p>
        """
    },
    "welcome": {
        "subject": "Xush kelibsiz - 00o.uz",
        "body": """
        <h1>Salom, {name}!</h1>
        <p>00o.uz oilasiga xush kelibsiz! 🎉</p>
        <p>Boshlash uchun: <a href="{app_url}/dashboard">Dashboard</a></p>
        """
    },
    "premium_activated": {
        "subject": "Premium faollashtirildi!",
        "body": "<h1>Tabriklaymiz, {name}!</h1><p>Premium tarifingiz faollashtirildi. Barcha imkoniyatlar ochildi!</p>"
    },
}


async def send_email(to: str, template: str, data: dict) -> bool:
    """Send email using template."""
    if template not in TEMPLATES:
        logger.error(f"Unknown email template: {template}")
        return False

    tpl = TEMPLATES[template]
    app_url = settings.APP_URL

    # Format subject and body
    try:
        subject = tpl["subject"]
        body = tpl["body"].format(app_url=app_url, **data)
    except KeyError as e:
        logger.error(f"Missing email template data: {e}")
        return False

    # If no SMTP configured, log only
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
        return True

    # Send via SMTP
    try:
        message = MIMEMultipart("alternative")
        message["From"] = settings.SMTP_FROM
        message["To"] = to
        message["Subject"] = subject
        html_part = MIMEText(body, "html")
        message.attach(html_part)

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True,
        )
        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


def send_email_sync(to: str, subject: str, body: str) -> bool:
    """Synchronous email for Celery tasks."""
    # TODO: use sync SMTP
    logger.info(f"[EMAIL SYNC] To: {to} | Subject: {subject}")
    return True
