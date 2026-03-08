import pandas as pd
import io
import re
from config.db import db
from flask import request
from flask_restful import Resource, reqparse
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import or_
from models.user_model import UserModel
from models.leads_model import LeadModel

# 1. PARSER PARA CRIAÇÃO (POST) - Mantém campos obrigatórios conforme o contrato
atributos_post = reqparse.RequestParser()
atributos_post.add_argument('nome', type=str, required=True, help="O campo 'nome' é obrigatório.")
atributos_post.add_argument('email', type=str, required=True, help="O campo 'email' é obrigatório")
atributos_post.add_argument('telefone', type=str)
atributos_post.add_argument('origem', type=str, required=True, help="O campo 'origem' é obrigatório")
atributos_post.add_argument('status', type=str, default='Novo')

# 2. PARSER PARA ATUALIZAÇÃO (PUT) - Campos opcionais para permitir mudar apenas o 'status'
atributos_put = reqparse.RequestParser()
atributos_put.add_argument('nome', type=str)
atributos_put.add_argument('email', type=str)
atributos_put.add_argument('telefone', type=str)
atributos_put.add_argument('origem', type=str)
atributos_put.add_argument('status', type=str)

class Leads(Resource):
    @jwt_required()
    def get(self):
        # Ajustado para aceitar 'search' conforme documentação
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, default=1, location='args')
        parser.add_argument('limit', type=int, default=10, location='args')
        parser.add_argument('search', type=str, location='args') # 'search' substitui 'nome'
        parser.add_argument('status', type=str, location='args')
        params = parser.parse_args()

        query = LeadModel.query

        # Aplicando filtros dinâmicos (AGORA BUSCANDO NOME OU EMAIL)
        if params['search']:
            termo = f"%{params['search']}%"
            query = query.filter(
                or_(
                    LeadModel.nome.ilike(termo),
                    LeadModel.email.ilike(termo)
                )
            )
            
        if params['status']:
            query = query.filter_by(status=params['status'])

        leads_paginados = query.paginate(page=params['page'], per_page=params['limit'], error_out=False)

        # RETORNO AJUSTADO PARA O CONTRATO REACT
        return {
            'data': [lead.json() for lead in leads_paginados.items], # De 'leads' para 'data'
            'total': leads_paginados.total,
            'page': leads_paginados.page,                          # De 'pagina_atual' para 'page'
            'limit': params['limit'],
            'totalPages': leads_paginados.pages                    # De 'pages' para 'totalPages'
        }, 200
    
    @jwt_required()
    def post(self):
        dados = atributos_post.parse_args()
        user_id = get_jwt_identity()

        
        novo_lead = LeadModel(**dados, usuario_id=user_id)

        try: 
            novo_lead.save_lead()
        except Exception as e:
            print(f"ERRO DE BANCO: {e}")
            return {"message": "Erro interno ao salvar o lead."}, 500
        
        return novo_lead.json(), 201

class Lead(Resource):
    @jwt_required()
    def put(self, lead_id):
        # Usando o parser de PUT que permite campos vazios
        dados = atributos_put.parse_args()
        lead_encontrado = LeadModel.find_lead(lead_id)

        if lead_encontrado:
            # Atualiza apenas o que foi enviado no JSON
            for chave, valor in dados.items():
                if valor is not None:
                    setattr(lead_encontrado, chave, valor)
            
            lead_encontrado.save_lead()
            return lead_encontrado.json(), 200
        
        return {'message': 'Lead não encontrado.'}, 404
    
    @jwt_required()
    def delete(self, lead_id):
        user_id = get_jwt_identity()
        user_logado = UserModel.find_user(user_id)

        if user_logado.role != 'Admin':
            return {'message': 'Acesso negado. Apenas administradores podem deletar leads.'}, 403
        
        lead = LeadModel.find_lead(lead_id)
        if lead:
            lead.delete_lead()
            return '', 204 # RETORNO AJUSTADO PARA 204 NO CONTENT
            
        return {'message': 'Lead não encontrado.'}, 404
    
class LeadsExport(Resource):
    @jwt_required()
    def get(self):
        # Filtros para exportação conforme documentação
        parser = reqparse.RequestParser()
        parser.add_argument('search', type=str, location='args')
        parser.add_argument('status', type=str, location='args')
        params = parser.parse_args()

        user_id = get_jwt_identity()
        user_logado = UserModel.find_user(user_id)

        query = LeadModel.query

        # Regra de Negócio: Consultores exportam apenas seus próprios leads
        if user_logado.role != 'Admin':
            query = query.filter_by(usuario_id=user_id)

        # Aplicando filtros de exportação
        if params['search']:
            query = query.filter(LeadModel.nome.ilike(f"%{params['search']}%"))
        if params['status']:
            query = query.filter_by(status=params['status'])

        leads = query.all()

        # Retorna apenas o array bruto, conforme solicitado no contrato CSV
        return [lead.json() for lead in leads], 200
    
class LeadsUpload(Resource):
    @jwt_required()
    def post(self):
        # Receber o arquivo 
        if 'file' not in request.files:
            return {'message': "Nenhum arquivo enviado na chave 'file"}, 400
        file = request.files['file']
        if file.filename == '':
            return {"message": "Nenhum arquivo selecionado."}, 400
        
        usuario_id = get_jwt_identity()

        # Leitura com Pandas
        try:
            # AJUSTE: Adicionado dtype=str para garantir que o Pandas não converta telefones em números/floats
            if file.filename.endswith('.csv'):
                # Lê o CSV. O Pandas tenta descobrir o separador automaticamente
                df = pd.read_csv(file, sep=None, engine='python', dtype=str)
            elif file.filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file, dtype=str)
            else:
                return {'message': 'Formato de arquivo não suportado. Envie apenas arquivos .csv, .xlsx ou .xls.'}, 400
        except Exception as e:
            return {"message": f"Erro estrutural ao ler o arquivo: O arquivo pode estar corrompido."}, 400
        
        # Validação de colunas (padronização para letras minúsculas)
        # AJUSTE: Adicionado replace('\ufeff', '') para remover caracteres invisíveis de arquivos Excel
        df.columns = [str(c).replace('\ufeff', '').strip().lower() for c in df.columns]
        colunas_obrigatorias = ['nome', 'email', 'telefone']

        for col in colunas_obrigatorias:
            if col not in df.columns:
                return {"message": f"A planilha enviada não contém a coluna obrigatória '{col}'."}, 400
            
        # Preparação para higienização
        status_permitidos = ["Novo", "Em Contato", "Convertido"]

        # puxa os e-mails já existentes do banco para evitar duplicidades 
        emails_existentes = {lead.email for lead in LeadModel.query.filter_by(usuario_id=usuario_id).all()}

        novos_leads = []

        # Higienização e tratamento linha a linha
        for index, row in df.iterrows():
            try:
                # Sanitização e checagem de duplicidade
                # AJUSTE: Corrigido o erro de digitação 'stirp()' para 'strip()'
                # Verificamos se a célula não é nula (pd.notna) antes de tratar
                email_raw = row['email']
                email = str(email_raw).strip().lower() if pd.notna(email_raw) else ""

                if email == 'nan' or not email:
                    return {"message": f"Erro na linha {index + 2}: O e-mail não pode estar vazio."}, 422
                
                if email in emails_existentes:
                    continue # Pula a linha se o lead já existir na base do usuário

                # nome: Capitalização
                nome_raw = row['nome']
                nome = str(nome_raw).strip().title() if pd.notna(nome_raw) else "Lead Sem Nome"

                # telefone: remover caracteres não numéricos com Regex
                # AJUSTE: O dtype=str garante que telefone_raw não venha como '1.19123e+10'
                telefone_raw = str(row['telefone']) if pd.notna(row['telefone']) else ""
                telefone_limpo = re.sub(r'\D', '', telefone_raw)
                if not telefone_limpo:
                    return {"message": f"Erro na linha {index + 2}: O telefone '{telefone_raw}' é inválido."}, 422
                
                # Origem e Status: valores Default se vazio ou inválido
                origem = str(row.get('origem', 'Outro')).strip()
                if origem.lower() == 'nan' or not origem:
                    origem = 'Outro'
                
                status = str(row.get('status', 'Novo')).strip().title()
                if status not in status_permitidos:
                    status = 'Novo'

                # instância do objeto
                novo_lead = LeadModel(
                    nome = nome,
                    email = email,
                    telefone = telefone_limpo,
                    origem = origem,
                    status = status,
                    usuario_id = usuario_id
                )

                novos_leads.append(novo_lead)

                # add o e-mail na lista de controle para evitar duplicados dentro da própria planilha
                emails_existentes.add(email)

            except Exception as e:
                # Log no terminal para facilitar o seu debug
                print(f"Erro técnico na linha {index + 2}: {str(e)}")
                return {"message": f"Erro inesperado na linha {index + 2} ao formatar os dados."}, 422
        
        # Salvamento no banco (Bulk Insert)
        if not novos_leads:
            return {"message": "A planilha foi processada, mas não havia leads novos para importar (todos já existiam)."}, 200
        
        try: 
            # usa add_all para gravar tudo em uma única transação no banco
            db.session.add_all(novos_leads)
            db.session.commit()

            # resposta conforme front
            return {"message": f"Upload processado com sucesso. {len(novos_leads)} leads foram importados."}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Ocorreu um erro interno no banco de dados durante a importação."}, 500