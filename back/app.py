import os
from flask import Flask, jsonify
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from resources.chat_resource import LiaChat
from utils.blacklist import BLACKLIST
from resources.auth import RefreshToken, UserRegister, UserLogin, UserMe, UserLogout
from resources.users_routes import Usuarios, Usuario
from resources.leads_routes import Leads, Lead, LeadsExport, LeadsUpload

from config.db import db

load_dotenv()

app = Flask(__name__)
# CORS(app)
# Configuração rigorosa de CORS para Produção e Desenvolvimento
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://lead-flow-indol.vercel.app", # Sua URL da Vercel (Produção)
            "http://localhost:5173",              # Seu PC (Desenvolvimento)
            "http://127.0.0.1:5173"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# =========================================================================
#  PREPARAÇÃO PARA DEPLOY (NUVEM VS LOCAL)
# =========================================================================
# 1. Tenta pegar a URL do banco da nuvem (Neon/Render) no arquivo .env
# 2. Se não achar (porque você está no seu PC), usa o SQLite como Plano B
banco_url = os.getenv("DATABASE_URL", "sqlite:///leads.db")

# Correção clássica de nuvem: O SQLAlchemy moderno exige 'postgresql://', 
# mas alguns provedores enviam apenas 'postgres://'. Isso previne um erro fatal.
if banco_url.startswith("postgres://"):
    banco_url = banco_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = banco_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Puxando a chave secreta do arquivo .env
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

#==============================================================================

api = Api(app)
jwt = JWTManager(app)


# ==========================================================
#  CONFIGURAÇÃO DA BLACKLIST (LOGOUT)
# ==========================================================
# O Flask-JWT vai rodar essa função toda vez que alguém acessar uma rota @jwt_required
@jwt.token_in_blocklist_loader
def verifica_blacklist(jwt_header, jwt_payload):
    # Retorna True se o token estiver na lista negra (bloqueando o acesso)
    return jwt_payload['jti'] in BLACKLIST

# Mensagem de erro customizada caso o token esteja na Blacklist
@jwt.revoked_token_loader
def token_de_acesso_invalido(jwt_header, jwt_payload):
    return jsonify({'message':'VocÊ foi deslogado (Token revogado).'}), 401

@jwt.expired_token_loader
def token_expirado(jwt_header, jwt_payload):
    return jsonify({'message': 'Seu token expirou.', 'error': 'token_expired'}), 401

@jwt.invalid_token_loader
def token_invalido(error):
    return jsonify({'message': 'Token inválido.', 'error': 'invalid_token'}), 401

@jwt.unauthorized_loader
def token_sem_autorizacao(error):
    return jsonify({'message': 'Token de Acesso não encontrado','error':'unauthorized_token'})

#registro de rotas
api.add_resource(UserRegister, '/register')
api.add_resource(UserLogin, '/login')
api.add_resource(UserMe, '/me')
api.add_resource(UserLogout,'/logout')
api.add_resource(Usuarios, '/users') # GET (Listar todos - Admin)
api.add_resource(Usuario, '/users/<int:user_id>') # PUT (Editar) e DELETE (Excluir - Admin)
api.add_resource(RefreshToken, '/refresh')
api.add_resource(Leads, '/leads')
api.add_resource(Lead, '/leads/<int:lead_id>')
api.add_resource(LeadsExport, '/leads/export')
api.add_resource(LiaChat, '/chat')
api.add_resource(LeadsUpload, '/leads/upload')





# 1. Inicializa o banco FORA do if __main__, para o Gunicorn enxergar
db.init_app(app)

# 2. Cria as tabelas no Neon (se não existirem) usando o contexto da aplicação
with app.app_context():
    db.create_all()

# 3. Isso aqui só vai rodar quando você testar localmente no seu PC
if __name__ == '__main__':
    app.run(debug=True)


