from flask_restful import Resource, reqparse
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

from models.user_model import UserModel

# Filtro para atualização (campos opcionais)
atributos = reqparse.RequestParser()
atributos.add_argument('nome', type=str)
atributos.add_argument('email', type=str)
atributos.add_argument('password', type=str)

class Usuarios(Resource):
    @jwt_required()
    def get(self):
        #apenas admin pode ter acesso a essa rota
        user_id= get_jwt_identity()
        user_logado = UserModel.find_user(user_id)

        if user_logado.role != 'Admin':
            return {'message': 'Acesso negado. Apenas administradores podem listar usuários.'}, 403
        return{'users': [user.json() for user in UserModel.query.all()]}, 200
    
class Usuario(Resource):
        @jwt_required()
        def put(self, user_id):
            dados = atributos.parse_args()
            user_logado_id= get_jwt_identity()

            # Um usuário só pode editar a SI MESMO (ou se for Admin)
            if str(user_logado_id) != str(user_id):
                return{'message': 'Você não tem permissão para editar este perfil.'}, 403
            
            usuario_encontrado = UserModel.find_user(user_id)
            if usuario_encontrado:
                #Se enviou uma nova senha, precisamos hashear!
                nova_senha = None
                if dados['password']:
                    nova_senha = generate_password_hash(dados['password'])
                
                usuario_encontrado.update_user(nome=dados['nome'] or usuario_encontrado.nome, email=dados['email'] or usuario_encontrado.email, password = nova_senha)
                usuario_encontrado.save_user()
                return usuario_encontrado.json(), 200
            
            return {'message': 'Usuário não encontrado.'}, 404
        
        @jwt_required()
        def delete(self, user_id):
            user_logado_id = get_jwt_identity()
            user_logado = UserModel.find_user(user_logado_id)

            # Apenas Admins podem deletar contas
            if user_logado.role != "Admin":
                return{'message': 'Apenas administradores podem deletar usuários.'}, 403
            
            usuario = UserModel.find_user(user_id)
            if usuario:
                try:
                    usuario.delete_user()
                    return {'message': 'Usuário removido com sucesso'}, 204
                except:
                    return{'message':'Usuário não encontrado'}, 404

