"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, TokenBlockedList
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt



api = Blueprint('api', __name__)
app = Flask(__name__)
bcrypt = Bcrypt(app)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route("/signup", methods=["POST"])
def signup_user():
    body=request.get_json()
    if body["email"] is None:
        return jsonify({"error": "email is required"}), 400
    if body["password"] is None:
        return jsonify({"error": "password is required"}), 400
    user=User.query.filter_by(email=body["email"]).first()
    if user is not None:
        return jsonify({"error": "User already exists"}), 400
    body["password"] = bcrypt.generate_password_hash(body["password"]).decode("utf-8")
    user=User(email=body["email"], password=body["password"], is_active=True)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User created", "user":  user.serialize()})

@api.route("/login", methods=["POST"])
def user_login():
    body=request.get_json()
    if body["email"] is None:
        return  jsonify({"error": "email is required"}), 400
    if body["password"] is None:
        return jsonify({"error": "password is required"}), 400
    user=User.query.filter_by(email=body["email"]).first()
    if  user is None:
        return jsonify({"error": "User not found"}), 404
    valid_password=bcrypt.check_password_hash(user.password, body["password"])
    if not valid_password:
        return jsonify({"error": "Invalid password"}), 401
    token=create_access_token(identity=user.id)
    return jsonify({"token":token})

@api.route("/private", methods=["GET"])
@jwt_required()
def protected():
    # Accede a la identidad del usuario actual con get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user is None:
        return jsonify({"error": "User not founded"}), 404
    
    return jsonify(user.serialize()), 200

@api.route("/logout", methods=["POST"])
@jwt_required()
def user_logout():
   token_data=get_jwt()
   token_blocked=TokenBlockedList(jti=token_data["jti"])
   db.session.add(token_blocked)
   db.session.commit()
   return jsonify({"msg":"Session cerrada"})
