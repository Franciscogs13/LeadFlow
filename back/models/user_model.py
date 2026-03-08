from config.db import db

class UserModel(db.Model):
    __tablename__ = "users"

    # Colunas mapeadas de acordo com o Front-end
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), default='Consultor') # -> admin ou consultor


#instanciação do objeto - a forma
    def __init__(self, nome, email, password, role="Consultor"):
        self.nome = nome
        self.email = email
        self.password = password
        self.role  = role

    def json(self):
        return{
        'id': self.id,
        'nome': self.nome,
        'email': self.email,
        'role': self.role
        #nunca retornar a senha no json por SEGURANÇA
        }

    @classmethod
    def find_user(cls, user_id):
        return cls.query.filter_by(id=user_id).first()

    @classmethod
    def find_by_email(cls, email):
        # Ele faz uma busca na tabela 'usuarios' filtrando pela coluna 'email'
        return cls.query.filter_by(email=email).first()

    def save_user(self):
        db.session.add(self)
        db.session.commit()

    def update_user(self, nome, email, password):
        self.nome = nome
        self.email = email

        if password:
            self.password = password

        db.session.commit()

    def delete_user(self):
        db.session.delete(self)
        db.session.commit()
