from flask_jwt_extended import (
    create_access_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from flask_restful import Resource, reqparse
from models.user_model import UserModel
from utils.blacklist import BLACKLIST
from werkzeug.security import check_password_hash, generate_password_hash

# filtro para cadastro
user_parser = reqparse.RequestParser()
user_parser.add_argument(
    "nome", type=str, required=True, help="Nome do usuário é obrigatório"
)
user_parser.add_argument(
    "email", type=str, required=True, help="Email do usuário é obrigatório"
)
user_parser.add_argument(
    "password", type=str, required=True, help="Senha do usuário é obrigatória"
)
user_parser.add_argument("role", type=str, default="Consultor")


# filtro para login
login_parser = reqparse.RequestParser()
login_parser.add_argument(
    "email", type=str, required=True, help="E-mail do usuário é obrigatório."
)
login_parser.add_argument(
    "password", type=str, required=True, help="Senha do usuário é obrigatória."
)



class UserRegister(Resource):
    def post(self):
        dados = user_parser.parse_args()

        if UserModel.find_by_email(dados["email"]):
            # Adicionado o status 400 para que o Front-end saiba que foi um erro de usuário
            return {"message": f"O e-mail {dados['email']} já está cadastrado."}, 400

        # Criptografa a senha recebida do Front-end
        senha_cript = generate_password_hash(dados["password"])
        
        # Mapeamento EXPLÍCITO para evitar erros de desempacotamento (**kwargs)
        user = UserModel(
            nome=dados["nome"],
            email=dados["email"],
            password=senha_cript, 
            role=dados.get("role", "Consultor")
        )
        
        try:
            user.save_user()
            token_de_acesso = create_access_token(identity=str(user.id))
            return {"token": token_de_acesso, "user": user.json()}, 201
        except Exception as e:
            # Capturar o erro real ajuda muito no debug!
            print(f"Erro ao salvar usuário: {e}") 
            return {"message": "Ocorreu um erro interno ao criar o usuário."}, 500


class UserLogin(Resource):
    def post(self):
        dados = login_parser.parse_args()
        user = UserModel.find_by_email(dados["email"])

        if user and check_password_hash(user.password, dados["password"]):
            token_de_acesso = create_access_token(identity=str(user.id))
            return {"token": token_de_acesso, "user": user.json()}, 200

        return {"message": "E-mail ou senha incorretos."}, 401


# Rota para checar a sessão do usuário
class UserMe(Resource):
    @jwt_required()
    def get(self):
        # get_jwt_identity() pega o ID que nós guardado dentro do token no momento do login
        user_id = get_jwt_identity()
        user = UserModel.find_user(user_id)
        if user:
            return user.json(), 200

        return {"message": "Usuário não encontrado."}, 404


class UserLogout(Resource):
    @jwt_required()
    def post(self):
        # Pega o 'jti' (JWT ID), que é o identificador único desta pulseira
        jwt_id = get_jwt()["jti"]
        # Adiciona o ID na nossa lista negra
        BLACKLIST.add(jwt_id)
        return {"message": "Logout realizado com sucesso."}, 200
    

class RefreshToken(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_user_id = get_jwt_identity()
        new_token = create_access_token(identity=str(current_user_id))
        return{'Token': new_token}

