# 🚀 Documentação de Integração Front-end & Back-end
**Projeto:** API de Gestão de Leads (Foco em CRUD)

Esta documentação resume todas as funcionalidades implementadas no Front-end (React + TypeScript) e detalha o contrato (JSON) que o Back-end (sua API em Python) precisa fornecer para que tudo funcione perfeitamente.

---

## 1. Resumo das Funcionalidades do Front-end

O sistema atual foi projetado para gerenciar Leads comerciais através de um fluxo seguro e inteligente. Suas principais funcionalidades são:

*   **Autenticação JWT:** Login seguro com token e persistência de sessão.
*   **Controle de Acesso (RBAC):** Dois níveis de acesso - `Consultor` e `Admin`. 
    *   **Consultores:** Podem ver leads, filtrá-los, adicionar novos leads, alterar o status de um lead e atualizar seus próprios dados de perfil. Conversar com a IA.
    *   **Admins:** Possuem as mesmas permissões dos Consultores, mas **também podem excluir** leads e acessar o Painel Admin para visualizar e excluir outros usuários do sistema.
*   **Gestão de Perfis:** Tela dedicada para o usuário atualizar seu nome, e-mail e acessar/editar informações básicas.
*   **Tabela de Leads Paginada:** Exibição inteligente dos leads em páginas gerenciáveis para evitar gargalos de performance.
*   **Filtros Dinâmicos:** Barra de pesquisa por texto (nome/e-mail) e dropdown para filtrar por Status do lead (`Novo`, `Em Contato`, `Convertido`).
*   **Exportação CSV:** Um botão no dashboard permite que o consultor baixe na hora um relatório `.csv` contendo todos os leads que correspondam aos filtros pesquisados.
*   **LIA Assistant (Assistente IA):** Integrada ao Dashboard, uma IA que responde perguntas do usuário e é capaz de montar tabelas em Markdown e Gráficos Interativos automáticos baseados nos leads filtrados.

---

## 2. O Que Você Precisa Construir no Back-end (Contrato da API)

Para que a aplicação React funcione completamente, você precisa criar as rotas abaixo e garantir que os formatos JSON de Entrada (Request) e Saída (Response) sigam estes padrões.

> [!TIP]
> **Autenticação:** O Front-end envia um header `Authorization: Bearer <SEU_TOKEN>` em todas as requisições, exceto `/login` e `/register`.

### 2.1 Autenticação e Usuários

| Rota | Método | Função | Entrada (Body/Params) | Saída Esperada (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | `POST` | Autenticar usuário | `{"email": "...", "password": "..."}` | `{ "token": "xyz...", "user": { "id": 1, "nome": "...", "email": "...", "role": "Admin" ou "Consultor" } }` |
| `/register` | `POST` | Cadastrar usuário | `{"nome": "...", "email": "...", "password": "...", "role": "Consultor"}` | *Mesmo retorno do `/login`* |
| `/me` | `GET` | *(Opcional)* Checar sessão | N/A (Usa Token) | Objeto `user` (id, nome, email, role) |
| `/users` | `GET` | Listar todos os usuários (Apenas Admin) | N/A | `[ { "id": 1, "nome": "...", "email": "...", "role": "..." }, ... ]` |
| `/users/{id}`| `PUT` | Atualizar perfil do usuário | `{"nome": "...", "email": "...", "password": "..."}` *(senha opcional)* | Objeto `user` atualizado |
| `/users/{id}`| `DELETE` | Excluir um usuário (Apenas Admin) | N/A | `Status 204 No Content` |

### 2.2 Gestão de Leads (Paginada)

Aqui está a mudança principal: O front-end espera **paginação** no GET de leads.

| Rota | Método | Função | Entrada | Saída Esperada (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/leads` | `GET` | Listar leads paginados | **Params:** `?page=1&limit=10&search=João&status=Novo` *(search e status opcionais)* | `{ "data": [ leads ], "total": 150, "page": 1, "limit": 10, "totalPages": 15 }` |
| `/lead` | `POST` | Criar novo lead | `{"nome": "...", "email": "...", "telefone": "...", "origem": "...", "status": "Novo"}` | Objeto `lead` criado com `id` |
| `/lead/{id}`| `PUT` | Atualizar status | `{"status": "Convertido"}` | Objeto `lead` atualizado |
| `/lead/{id}`| `DELETE` | Excluir lead (Admin) | N/A | `Status 204 No Content` |

### 2.3 Rota de Exportação (CSV)

Para o relatório CSV, a rota deve retornar **todos** os leads correspondentes ao filtro, **sem paginação**.

| Rota | Método | Função | Entrada | Saída Esperada (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/leads/export` | `GET` | Buscar todos filtrados | **Params:** `?search=João&status=Novo&export=true` | `[ { "id": 1, "nome": "João", "status": "Novo"... }, ... ]` |

> *Nota: O Front-end pega esse array gigante em JSON e internamente o converte em um arquivo `.csv` automático para o usuário baixar.*

---

## 3. Integração com a Inteligência Artificial (LIA Assistant)

O Front-end possui um Chat Lateral (Sidebar) onde o usuário faz perguntas. O front-end envia a pergunta e os *Filtros Ativos do Usuário* em apenas uma requisição POST.

| Rota | Método | Função | Entrada | Saída Esperada (JSON) |
| :--- | :--- | :--- | :--- | :--- |
| `/chat` | `POST` | Processar prompt da IA | `{"message": "Faça um gráfico...", "context": {"status": "Novo"}}` | Ver formato abaixo |

> [!CAUTION]
> **RESTRITO APENAS A LEADS (REGRA DO BACK-END):** 
> No código Python onde você montar o *"System Prompt"* do seu LLM, você **deve** incluir instruções estritas para que ele atue *exclusivamente* como um analista de Leads CRM. Se o Consultor ou Admin enviar perguntas genéricas, de programação ou que fujam desse contexto, o LLM deve ser configurado (via Back-end) para retornar uma recusa gentil. Exemplo: *"Desculpe, sou a LIA, desenhada apenas para auxiliar nas análises e formatação dos seus Leads comerciais. Como posso ajudar com seus clientes hoje?"*

#### O Formato de Resposta do Back-end
Sua API Python (integrada a um LLM) deverá devolver a resposta estruturada para que o React saiba renderizar. O React suporta *Markdown* padrão e Gráficos Interativos (`recharts`).

**Exemplo 1: Retornando Texto com Tabela Markdown**
Se a IA formatar a tabela normal em Markdown, o sistema interpretará nativamente:
```json
{
  "role": "assistant",
  "content": "Aqui está sua análise:\n\n| Origem | Total de Leads |\n|--|--|\n| Site | 24 |\n| Insta | 15 |"
}
```

**Exemplo 2: Retornando um Gráfico Interativo**
Para forçar o Front-end a construir um **Gráfico Interativo**, você deve preencher o array `"chart"` no mesmo payload de resposta seguindo nossa tipagem combinada:

```json
{
  "role": "assistant",
  "content": "Aqui está a análise visual da quantidade de Leads separados por Origem:",
  "chart": {
    "type": "bar",
    "data": [
      {"name": "Site Oficial", "quantidade": 50},
      {"name": "Instagram", "quantidade": 30},
      {"name": "Indicação", "quantidade": 15}
    ],
    "xAxisKey": "name",
    "series": [
      { "dataKey": "quantidade", "name": "Total Registrado", "color": "#2563eb" }
    ]
  }
}
```

> **Gráficos Suportados no Front-end:**
> - `"bar"` (Gráfico de Barras)
> - `"pie"` (Gráfico de Pizza)
> - `"line"` (Gráfico de Linhas)
