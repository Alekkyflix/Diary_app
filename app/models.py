from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app.extensions import db, login
from sqlalchemy.dialects.sqlite import JSON

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    # JSON column for preferences (Theme, Layout, etc.)
    preferences = db.Column(JSON, default=lambda: {"theme": "premium", "layout": "floating"})
    
    entries = db.relationship('Entry', backref='author', lazy='dynamic')
    daily_logs = db.relationship('DailyLog', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

tags_entries = db.Table('tags_entries',
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True),
    db.Column('entry_id', db.Integer, db.ForeignKey('entry.id'), primary_key=True)
)

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(140))
    content = db.Column(db.Text) # Rich text HTML content
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    tags = db.relationship('Tag', secondary=tags_entries, lazy='subquery',
        backref=db.backref('entries', lazy=True))
    media_items = db.relationship('Media', backref='entry', lazy='dynamic')

class DailyLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Mood & Wellness
    mood_score = db.Column(db.Integer) # 1-10
    sleep_hours = db.Column(db.Float)
    water_intake = db.Column(db.Integer) # ml
    notes = db.Column(db.String(500))
    
    # Flexible field for future expansion
    meta_data = db.Column(JSON, default={})

class Media(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255))
    file_type = db.Column(db.String(50)) # 'image', 'video', 'audio'
    entry_id = db.Column(db.Integer, db.ForeignKey('entry.id'))
