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

#Error message helper
def create_error_message(message, status_code=400):
    return jsonify({"error": message}), status_code

#Validate the email and password 
def validate_signup_login(body):
    if not body or "email" not in body or body["email"] is None:
        return create_error_message("Email is required", 400)
    if "password" not in body or body["password"] is None:
        return create_error_message("Password is required", 400)
    return None


@api.route("/signup", methods=["POST"])
def signup_user():
    body=request.get_json()
    validation_error = validate_signup_login(body)
    if validation_error:
        return validation_error
    
    #Check if the user already exists
    user=User.query.filter_by(email=body["email"]).first()
    if user is not None:
        return jsonify({"error": "User already exists"}), 400
    
    try:
    #Hash password and create user
        body["password"] = bcrypt.generate_password_hash(body["password"]).decode("utf-8")
        user=User(email=body["email"], password=body["password"], is_active=True)

        db.session.add(user)
        db.session.commit()

        return jsonify({"msg": "User created", "user":  user.serialize()})
    except Exception as e:
        return jsonify({'error':'User could not be created'}), 500

@api.route("/login", methods=["POST"])
def user_login():
    body=request.get_json()
    validation_error = validate_signup_login(body)
    if validation_error:
        return validation_error
    
    #Check if user exists
    user=User.query.filter_by(email=body["email"]).first()
    if  user is None:
        return jsonify({"error": "User not found"}), 404
    
    #Check password
    valid_password=bcrypt.check_password_hash(user.password, body["password"])
    if not valid_password:
        return jsonify({"error": "Invalid password"}), 401
    
    token=create_access_token(identity=user.id)
    return jsonify({"message": "Login was successful", "token":token}), 200

@api.route("/private", methods=["GET"])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.serialize()), 200

@api.route("/logout", methods=["POST"])
@jwt_required()
def user_logout():
   token_data=get_jwt()

   #Verificar si el token esta bloqueado
   if TokenBlockedList.query.filter_by(jti=token_data["jti"]).first():
       return create_error_message("Token already blocked", 400)
   
   token_blocked=TokenBlockedList(jti=token_data["jti"])
   db.session.add(token_blocked)
   db.session.commit()
   
   return jsonify({"msg":"Session logout"})
