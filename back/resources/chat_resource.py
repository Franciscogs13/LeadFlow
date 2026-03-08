import os

from dotenv import load_dotenv
import json
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, reqparse
from google import genai
from google.genai import types
from models.leads_model import LeadModel
from models.user_model import UserModel

# Carrega as variáveis do arquivo .env
load_dotenv()

# 2. INICIALIZAÇÃO DO CLIENTE
# (O SDK novo reconhece a variável GEMINI_API_KEY do seu .env automaticamente)
client = genai.Client()


class LiaChat(Resource):
    @jwt_required()
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("message", type=str, required=True)
        args = parser.parse_args()

        user_id = get_jwt_identity()
        user_logado = UserModel.find_user(user_id)

        # Filtro de dados baseado no RBAC (Admin vê tudo, Consultor vê o dele)
        if user_logado.role == "Admin":
            leads = LeadModel.query.all()
        else:
            leads = LeadModel.query.filter_by(usuario_id=user_id).all()

        dados_leads = [lead.json() for lead in leads]

        # SYSTEM PROMPT AVANÇADO: Engenharia de Saída Estruturada
        system_instructions = (
            "Você é a LIA, desenhada EXCLUSIVAMENTE para auxiliar nas análises e formatação dos Leads comerciais. "
            "\n--- REGRAS DE OURO ---\n"
            "1. Responda apenas sobre os dados de Leads CRM fornecidos abaixo.\n"
            "2. Se a pergunta for fora do contexto, o campo 'content' deve conter exatamente: "
            "'Desculpe, sou a LIA, desenhada apenas para auxiliar nas análises e formatação dos seus Leads comerciais. Como posso ajudar com seus clientes hoje?' e 'chart' deve ser null.\n"
            "3. VOCÊ DEVE RETORNAR APENAS UM JSON VÁLIDO. NENHUM TEXTO FORA DO JSON.\n"
            "\n--- ESTRUTURA DO JSON OBRIGATÓRIA ---\n"
            "{\n"
            '  "role": "assistant",\n'
            '  "content": "Sua resposta em texto ou Markdown aqui",\n'
            '  "chart": null // Mude para um objeto de gráfico APENAS se o usuário pedir uma análise visual/gráfico.\n'
            "}\n"
            "\n--- ESTRUTURA DO OBJETO CHART (Se solicitado gráfico) ---\n"
            "{\n"
            '  "type": "bar", // ou "pie", ou "line"\n'
            '  "data": [{"name": "Google Ads", "quantidade": 10}, {"name": "Meta", "quantidade": 5}],\n'
            '  "xAxisKey": "name",\n'
            '  "series": [{"dataKey": "quantidade", "name": "Total de Leads", "color": "#2563eb"}]\n'
            "}\n"
            f"\n--- CONTEXTO DE DADOS ATUAIS ---\n{dados_leads}"
        )

        try:
            # Configurando a API para FORÇAR o retorno em JSON puro
            response = client.models.generate_content(
                model='gemini-2.5-flash', 
                contents=args['message'],
                config=types.GenerateContentConfig(
                    system_instruction=system_instructions,
                    response_mime_type="application/json" # A MÁGICA ACONTECE AQUI
                )
            )

            # Como a resposta da IA agora é garantidamente um JSON (em formato string),
            # nós o convertemos para um dicionário Python antes de enviar para o React.
            resposta_estruturada = json.loads(response.text)

            return resposta_estruturada, 200
            
        except json.JSONDecodeError as je:
            print(f"🔴 ERRO DE PARSE JSON: {str(je)}")
            return {"message": "Erro ao formatar os dados de saída da LIA."}, 500
        except Exception as e:
            print(f"🔴 ERRO REAL DO NOVO GEMINI SDK: {str(e)}")
            return {"message": "Desculpe, sou a LIA e tive um erro técnico ao processar sua solicitação. Por favor, tente novamente mais tarde."}, 500