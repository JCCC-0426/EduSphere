import pymysql
from pymysql.cursors import DictCursor
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def init_database():
    # 获取数据库连接信息
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')  # 默认为空密码
    db_host = os.getenv('DB_HOST', 'localhost')
    db_name = os.getenv('DB_NAME', 'course_system')
    
    # 连接MySQL
    connection = pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        charset='utf8mb4',
        cursorclass=DictCursor
    )

    try:
        with connection.cursor() as cursor:
            # 创建数据库
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            cursor.execute(f"USE {db_name}")

            # 创建用户表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(80) UNIQUE NOT NULL,
                    password VARCHAR(120) NOT NULL,
                    role VARCHAR(20) NOT NULL,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 创建课程表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS course (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    teacher_id INT NOT NULL,
                    max_students INT NOT NULL,
                    current_students INT DEFAULT 0,
                    category VARCHAR(50) NOT NULL,
                    status VARCHAR(20) DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (teacher_id) REFERENCES user(id)
                )
            """)

            # 创建报名记录表
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS enrollment (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    course_id INT NOT NULL,
                    student_id INT NOT NULL,
                    enroll_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (course_id) REFERENCES course(id),
                    FOREIGN KEY (student_id) REFERENCES user(id)
                )
            """)

            # 添加测试数据
            # 添加测试用户
            cursor.execute("""
                INSERT INTO user (username, password, role, email)
                VALUES 
                    ('teacher1', '123456', 'teacher', 'teacher1@example.com'),
                    ('student1', '123456', 'student', 'student1@example.com')
                ON DUPLICATE KEY UPDATE id=id
            """)

            # 添加测试课程
            cursor.execute("""
                INSERT INTO course (title, description, teacher_id, max_students, category)
                VALUES 
                    ('Python基础课程', '适合初学者的Python编程入门课程', 1, 20, '电脑课程'),
                    ('Web开发实战', '使用HTML, CSS和JavaScript进行Web开发', 1, 15, '电脑课程'),
                    ('素描基础', '学习素描的基本技巧和原理', 1, 12, '艺术类'),
                    ('水彩绘画', '掌握水彩绘画的基本技法', 1, 10, '艺术类'),
                    ('英语口语训练', '提高英语口语表达能力和听力理解', 1, 15, '语言类')
                ON DUPLICATE KEY UPDATE id=id
            """)

            connection.commit()
            print("数据库初始化成功！")

    except Exception as e:
        print(f"初始化数据库时出错: {e}")
        connection.rollback()
    finally:
        connection.close()

if __name__ == '__main__':
    init_database() 