from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# 初始化扩展
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # 数据库配置
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:uts2025@localhost/course_system'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 初始化扩展
    db.init_app(app)

    # 注册蓝图
    from .routes import auth, courses
    app.register_blueprint(auth.bp)
    app.register_blueprint(courses.bp)

    # 创建数据库表
    with app.app_context():
        db.create_all()

    return app 