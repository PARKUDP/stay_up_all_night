from models import db, User
from app import app
import app_secrets

# または
from app_secrets import secret_key

with app.app_context():
    db.drop_all()  
    db.create_all()  
