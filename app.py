# ============================================
# AURÉNE Photography — Backend (Flask)
# app.py — Main Application File
# ============================================

from flask import Flask, request, jsonify, render_template_string
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS (allows frontend to talk to backend)
CORS(app)

# Database config — SQLite (simple file-based database)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///aurene.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'aurene-secret-key-2026'

# Initialize database
db = SQLAlchemy(app)


# ============================================
# DATABASE MODELS
# ============================================

class Contact(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    package = db.Column(db.String(100))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'package': self.package,
            'message': self.message,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }


class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    package = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    preferred_date = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'package': self.package,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'preferred_date': self.preferred_date,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }


class Newsletter(db.Model):
    __tablename__ = 'newsletters'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M')
        }


# ============================================
# CREATE DATABASE TABLES
# ============================================

with app.app_context():
    db.create_all()
    print("Database created successfully!")


# ============================================
# API ROUTES
# ============================================

@app.route('/')
def home():
    return jsonify({
        'message': 'AURÉNE Photography API is running',
        'status': 'online',
        'endpoints': [
            'POST /api/contact',
            'POST /api/booking',
            'POST /api/newsletter',
            'GET  /api/admin/dashboard'
        ]
    })


# Health check
@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})


# Contact Form Submission
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('email') or not data.get('message'):
            return jsonify({'success': False, 'error': 'Name, email, and message are required'}), 400
        
        new_contact = Contact(
            name=data['name'],
            email=data['email'],
            package=data.get('package', ''),
            message=data['message']
        )
        
        db.session.add(new_contact)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Thank you! Your message has been received.',
            'data': new_contact.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# Booking Form Submission
@app.route('/api/booking', methods=['POST'])
def submit_booking():
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('email') or not data.get('package'):
            return jsonify({'success': False, 'error': 'Name, email, and package are required'}), 400
        
        new_booking = Booking(
            package=data['package'],
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', ''),
            preferred_date=data.get('preferred_date', '')
        )
        
        db.session.add(new_booking)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Booking request submitted successfully!',
            'data': new_booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# Newsletter Subscription
@app.route('/api/newsletter', methods=['POST'])
def subscribe_newsletter():
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({'success': False, 'error': 'Email is required'}), 400
        
        # Check if email already exists
        existing = Newsletter.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'success': False, 'error': 'You are already subscribed!'}), 409
        
        new_sub = Newsletter(email=data['email'])
        db.session.add(new_sub)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Successfully subscribed to the newsletter!',
            'data': new_sub.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# ADMIN DASHBOARD (View all submissions)
# ============================================

ADMIN_PASSWORD = 'aurene2026'  # Change this in production!

@app.route('/api/admin/dashboard')
def admin_dashboard():
    password = request.args.get('password')
    if password != ADMIN_PASSWORD:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    contacts = Contact.query.order_by(Contact.created_at.desc()).all()
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    subscribers = Newsletter.query.order_by(Newsletter.created_at.desc()).all()
    
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AURÉNE Admin Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 2rem; }
            h1 { color: #10b981; margin-bottom: 0.5rem; }
            .subtitle { color: #737373; margin-bottom: 2rem; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 3rem; }
            .stat-card { background: #141414; border: 1px solid #262626; border-radius: 0.75rem; padding: 1.5rem; }
            .stat-card h3 { font-size: 2rem; color: #10b981; margin-bottom: 0.25rem; }
            .stat-card p { color: #a3a3a3; font-size: 0.9rem; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 3rem; }
            th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #262626; }
            th { color: #10b981; font-weight: 500; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; }
            td { color: #a3a3a3; font-size: 0.9rem; }
            tr:hover td { color: #f5f5f5; }
            .section-title { font-size: 1.5rem; margin: 2rem 0 1rem; color: #f5f5f5; }
            .empty { color: #737373; font-style: italic; padding: 1rem; }
        </style>
    </head>
    <body>
        <h1>AURÉNE Admin Dashboard</h1>
        <p class="subtitle">View all contact submissions, bookings, and newsletter subscribers</p>
        
        <div class="stats">
            <div class="stat-card"><h3>{{ contacts|length }}</h3><p>Contact Messages</p></div>
            <div class="stat-card"><h3>{{ bookings|length }}</h3><p>Booking Requests</p></div>
            <div class="stat-card"><h3>{{ subscribers|length }}</h3><p>Newsletter Subscribers</p></div>
        </div>
        
        <h2 class="section-title">Contact Messages</h2>
        {% if contacts %}
        <table>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Package</th><th>Message</th><th>Date</th></tr>
            {% for c in contacts %}
            <tr><td>{{ c.id }}</td><td>{{ c.name }}</td><td>{{ c.email }}</td><td>{{ c.package or '-' }}</td><td>{{ c.message[:50] }}...</td><td>{{ c.created_at.strftime('%Y-%m-%d %H:%M') }}</td></tr>
            {% endfor %}
        </table>
        {% else %}<p class="empty">No contact messages yet.</p>{% endif %}
        
        <h2 class="section-title">Booking Requests</h2>
        {% if bookings %}
        <table>
            <tr><th>ID</th><th>Package</th><th>Name</th><th>Email</th><th>Phone</th><th>Date</th><th>Submitted</th></tr>
            {% for b in bookings %}
            <tr><td>{{ b.id }}</td><td>{{ b.package }}</td><td>{{ b.name }}</td><td>{{ b.email }}</td><td>{{ b.phone or '-' }}</td><td>{{ b.preferred_date or '-' }}</td><td>{{ b.created_at.strftime('%Y-%m-%d %H:%M') }}</td></tr>
            {% endfor %}
        </table>
        {% else %}<p class="empty">No booking requests yet.</p>{% endif %}
        
        <h2 class="section-title">Newsletter Subscribers</h2>
        {% if subscribers %}
        <table>
            <tr><th>ID</th><th>Email</th><th>Subscribed At</th></tr>
            {% for s in subscribers %}
            <tr><td>{{ s.id }}</td><td>{{ s.email }}</td><td>{{ s.created_at.strftime('%Y-%m-%d %H:%M') }}</td></tr>
            {% endfor %}
        </table>
        {% else %}<p class="empty">No subscribers yet.</p>{% endif %}
    </body>
    </html>
    """
    
    return render_template_string(html_template, 
                                  contacts=contacts, 
                                  bookings=bookings, 
                                  subscribers=subscribers)


# ============================================
# RUN THE SERVER
# ============================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)