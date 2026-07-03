"""
Quick SMTP connectivity test.
Reads credentials from your .env via app.config so nothing is hardcoded here.

IMPORTANT: the previous version of this file had a real Gmail app password
committed in plain text. If that password is still active, revoke it now in
Google Account -> Security -> App Passwords, and generate a fresh one to put
in your .env as MAIL_PASSWORD.
"""

import smtplib
from app.config import settings

try:
    server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
    server.starttls()
    server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
    print("LOGIN SUCCESS")
    server.quit()
except Exception as e:
    print("ERROR:", e)