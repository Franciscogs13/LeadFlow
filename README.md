# LeadFlow - Sistema de Gestão de Leads

![LIA CRM Banner](https://via.placeholder.com/1200x400?text=LIA+CRM+-+Gestão+de+Leads+Powered+by+AI)

Um projeto simples de Gestão de Leads criado com o objetivo principal de **aprender, testar novas tecnologias e aprimorar conhecimentos** em desenvolvimento Full-Stack. Após um tempo pausado, este projeto foi finalizado em um intenso final de semana de imersão nos estudos. 😊

Feedbacks e sugestões sobre a estrutura do código e funcionalidades são extremamente bem-vindos!

## 🌟 O que foi implementado

Foi um ambiente de laboratório para testar diversas funcionalidades interessantes, dentre elas:

- **Controle de Acesso Baseado em Perfis (RBAC):**
  - **Administrador:** Acesso total, gerenciamento de usuários, permissão para exclusões.
  - **Consultor:** Visualização, filtros, cadastro e atualização de status de Leads.
- **Autenticação Segura:** Testando JWT (JSON Web Tokens), proteção de rotas no back-end e persistência de sessão.
- **Tabela Paginada:** Praticando a delegação da paginação de volta para o back-end para melhorar o carregamento.
- **Filtros e Exportação:** Pesquisas dinâmicas e geração de arquivos `.csv` criados on the fly a partir da API.
- **Integração com Inteligência Artificial:** Uma funcionalidade exploratória onde o assistente pode retornar respostas não só em Markdown, mas com componentes de **Gráficos Interativos Dinâmicos** injetados diretamente na interface.
- **UI/UX Moderna:** Construindo a interface através do Tailwind CSS e melhorando a experiência com SweetAlert2 e Toasters.

---

## 💻 Stack Tecnológica Escolhida

### Front-end
- **React.js (Vite)** e **TypeScript**
- **Tailwind CSS**
- **Lucas/Lucide Icons**, **Recharts** (P/ Inteligência Artificial) e **React Markdown**.

### Back-end
- **Python** com **Flask** & **Flask-RESTful**.
- **SQLAlchemy** (ORM).
- **Flask-JWT-Extended** para gerenciamento dos tokens.

---

## 🚀 Como Rodar o Projeto Localmente

Se você quiser clonar para estudar o código ou sugerir melhorias, basta seguir os passos:

### 1. Clonando o repositório
```bash
git clone https://github.com/SeuUsuario/LIA-CRM.git
cd LIA-CRM
```

### 2. Configurando o Back-end (API Python)
```bash
cd back
# Crie seu ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor
python app.py
```

### 3. Configurando o Front-end (React/Vite)
```bash
cd ../front

# Instale os pacotes e dependências
npm install

# Inicie a aplicação no navegador
npm run dev
```

---

## 👨‍💻 Sobre o Autor

Este projeto fez parte de uma jornada de desenvolvimento contínuo. Fique à vontade para checar o código-fonte, testar e me contatar!

**Francisco Gomes**
- [LinkedIn](https://www.linkedin.com/in/francisco-dev/)
- [GitHub](https://github.com/Franciscogs13)
