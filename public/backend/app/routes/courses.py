from flask import Blueprint, request, jsonify
from ..models.course import Course
from ..models.enrollment import Enrollment
from .. import db

bp = Blueprint('courses', __name__, url_prefix='/api')

@bp.route('/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([course.to_dict() for course in courses])

@bp.route('/courses', methods=['POST'])
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
        return jsonify({'message': '课程创建成功', 'id': new_course.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/enroll', methods=['POST'])
def enroll_course():
    data = request.json
    try:
        course = Course.query.get(data['course_id'])
        if course.current_students >= course.max_students:
            return jsonify({'error': '课程已满'}), 400
        
        new_enrollment = Enrollment(
            course_id=data['course_id'],
            student_id=data['student_id']
        )
        course.current_students += 1
        db.session.add(new_enrollment)
        db.session.commit()
        return jsonify({'message': '报名成功'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400 