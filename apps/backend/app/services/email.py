"""Email service for transactional emails."""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from loguru import logger

from app.core.config import settings


async def send_email(
    to: str,
    subject: str,
    body: str,
    html: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
) -> bool:
    """Send email via SMTP."""
    if not settings.SMTP_HOST:
        logger.warning("SMTP not configured, email not sent")
        return False

    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"00o.uz <{settings.FROM_EMAIL}>"
        message["To"] = to
        message["Subject"] = subject
        if cc:
            message["Cc"] = ", ".join(cc)

        if html:
            message.attach(MIMEText(body, "plain"))
            message.attach(MIMEText(html, "html"))
        else:
            message.attach(MIMEText(body, "plain"))

        recipients = [to]
        if cc:
            recipients.extend(cc)
        if bcc:
            recipients.extend(bcc)

        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True,
            recipients=recipients,
        )
        return True
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return False


def render_template(template: str, **kwargs) -> str:
    """Render simple template."""
    for key, value in kwargs.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    return template
