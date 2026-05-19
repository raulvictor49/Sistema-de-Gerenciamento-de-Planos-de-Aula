# Sistema de Gerenciamento de Planos de Aula
Uma aplicação completa (Fullstack) para criação, organização e recomendação pedagógica de planos de aula, integrada com inteligência artificial.

## Tecnologias Utilizadas
- **Frontend:** React.js, TailwindCSS, Axios
- **Backend:** Node.js, Express, Zod (Validação)
- **Banco de Dados:** PostgreSQL (Persistência de dados)

## Como Executar o Projeto
### Pré-requisitos:
- Node.js instalado
- Instância do PostgreSQL rodando

### Passos
#### 1. Clonar o Repositório
- git clone https://github.com/raulvictor49/Sistema-de-Gerenciamento-de-Planos-de-Aula.git

#### 2. Acessar o arquivo
- cd Sistema-de-Gerenciamento-de-Planos-de-Aula

#### 3. Configurar as Variáveis de Ambiente
Navegue até a pasta do backend e crie um arquivo chamado .env preenchendo as suas credenciais locais.

#### 4. Instalar Dependências e Rodar o Backend
No seu terminal, execute os comandos abaixo para iniciar o servidor:
- cd backend
- npm install
- npm run dev

O servidor backend será iniciado na porta 3000.

### 5. Instalar Dependências e Rodar o Frontend
Abra uma nova janela no seu terminal, navegue até a pasta do frontend e inicie a interface:
- cd frontend
- npm install
- npm run dev
O servidor frontend será iniciado e o link de acesso local será exibido no terminal (geralmente http://localhost:5173).

## Item Bônus
**Endpoint de Health Check**

Disponibilização do endpoint /health no backend para monitoramento do estado da aplicação e verificação ativa da conectividade com o banco de dados PostgreSQL.

Para testar basta abrir uma nova aba no navegador e digitar o seguinte comando:

- http://localhost:3000/health
