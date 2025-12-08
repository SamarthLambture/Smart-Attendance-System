import smtplib

try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login("lambture5522@gmail.com", "fuflnmhwrnlmmiam")
    print("LOGIN SUCCESS")
except Exception as e:
    print("ERROR:", e)
