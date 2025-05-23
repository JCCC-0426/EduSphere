# Course Reservation System

This is a course reservation system backend based on Flask and MySQL.

## Requirements

- Python 3.8+
- MySQL 5.7+
- pip (Python package manager)

## Installation Steps

1. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure database:
- Create database in MySQL:
```sql
CREATE DATABASE course_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Configure environment variables:
- Copy `.env.example` file to `.env`
- Modify database connection information

5. Run the application:
```bash
flask run
```

## API Endpoints

### User Related
- POST /api/register - User registration
- POST /api/login - User login

### Course Related
- GET /api/courses - Get all courses
- POST /api/courses - Create new course
- POST /api/enroll - Enroll in a course

## Database Models

### User
- id: Primary key
- username: Username
- password: Password
- role: Role (teacher/student)
- email: Email
- created_at: Creation time

### Course
- id: Primary key
- title: Course title
- description: Course description
- teacher_id: Teacher ID
- max_students: Maximum number of students
- current_students: Current number of students
- category: Course category
- status: Course status
- created_at: Creation time

### Enrollment
- id: Primary key
- course_id: Course ID
- student_id: Student ID
- enroll_date: Enrollment date #   E d u S p h e r e  
 