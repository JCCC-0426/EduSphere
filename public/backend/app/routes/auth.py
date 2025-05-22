from flask import Blueprint, request, jsonify
from ..models.user import User
from .. import db
import traceback

bp = Blueprint('auth', __name__, url_prefix='/api')

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    try:
        print(f"注册数据: {data}")
        new_user = User(
            username=data['username'],
            password=data['password'],
            role=data['role'],
            email=data['email']
        )
        db.session.add(new_user)
        db.session.commit()
        print(f"用户注册成功: {new_user.username}")
        return jsonify({'message': '注册成功'}), 201
    except Exception as e:
        print(f"注册错误: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 400

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    print(f"登录数据: {data}")
    user = User.query.filter_by(username=data['username']).first()
    if user and user.password == data['password']:
        print(f"用户登录成功: {user.username}")
        return jsonify(user.to_dict())
    print(f"登录失败: 用户名或密码错误")
    return jsonify({'error': '用户名或密码错误'}), 401 