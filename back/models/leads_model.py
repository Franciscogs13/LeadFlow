from config.db import db

class LeadModel(db.Model):
    __tablename__ = "leads"

    # Colunas mapeadas de acordo com a tabela de Leads do Front-end
    id = db.Column(db.Integer, primary_key = True)
    nome = db.Column(db.String(80), nullable = False)
    email = db.Column(db.String(80), nullable = False)
    telefone = db.Column(db.String(20))
    origem = db.Column(db.String(40), nullable = False)
    status = db.Column(db.String(40), default="Novo")

    #Chave estrangeira para associar o lead ao consultor
    usuario_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __init__(self, nome, email, telefone, origem, status="Novo", usuario_id=None):
        self.nome = nome
        self.email = email
        self.telefone = telefone
        self.origem = origem
        self.status = status
        self.usuario_id = usuario_id


    def json(self):
        return{
        'id': self.id,
        'nome': self.nome,
        'email': self.email,
        'telefone': self.telefone,
        'origem': self.origem,
        'status': self.status,
        'usuario_id': self.usuario_id
        }

    @classmethod
    def find_lead(cls, lead_id):
        return cls.query.filter_by(id=lead_id).first()

    def save_lead(self):
        db.session.add(self)
        db.session.commit()

    def update_lead(self, nome, email, telefone, origem, status):
        self.nome = nome
        self.email = email
        self.telefone = telefone
        self.origem = origem
        self.status = status

        db.session.commit()

    def delete_lead(self):
        db.session.delete(self)
        db.session.commit()

