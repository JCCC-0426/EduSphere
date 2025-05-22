from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/course_system')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'teacher' or 'student'
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Course model
class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    max_students = db.Column(db.Integer, nullable=False)
    current_students = db.Column(db.Integer, default=0)
    category = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Enrollment model
class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    enroll_date = db.Column(db.DateTime, default=datetime.utcnow)

# Create all tables
with app.app_context():
    db.create_all()

# User registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        new_user = User(
            username=data['username'],
            password=data['password'],
            role=data['role'],
            email=data['email']
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# User login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.password == data['password']:
        return jsonify({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'email': user.email
        })
    return jsonify({'error': 'Invalid username or password'}), 401

# Get all courses
@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([{
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'teacher_id': course.teacher_id,
        'max_students': course.max_students,
        'current_students': course.current_students,
        'category': course.category,
        'status': course.status
    } for course in courses])

# Create new course
@app.route('/api/courses', methods=['POST'])
def create_course():
    data = request.json
    try:
        new_course = Course(
            title=data['title'],
            description=data['description'],
            teacher_id=data['teacher_id'],
            max_students=data['max_students'],
            category=data['category']
        )
        db.session.add(new_course)
        db.session.commit()
        return jsonify({'message': 'Course created successfully', 'id': new_course.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Enroll in a course
@app.route('/api/enroll', methods=['POST'])
def enroll_course():
    data = request.json
    try:
        course = Course.query.get(data['course_id'])
        if course.current_students >= course.max_students:
            return jsonify({'error': 'Course is full'}), 400
        
        new_enrollment = Enrollment(
            course_id=data['course_id'],
            student_id=data['student_id']
        )
        course.current_students += 1
        db.session.add(new_enrollment)
        db.session.commit()
        return jsonify({'message': 'Enrollment successful'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True) 