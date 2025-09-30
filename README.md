# Orienzoia - PDI Management System

Sistema de gestão de **PDI (Planos de Desenvolvimento Individual)** construído com Node.js, Express, TypeScript e Prisma.

## 📋 Funcionalidades

- Gestão de usuários com diferentes níveis de acesso (USER, MANAGER, ADMIN)
- Criação e acompanhamento de planos de desenvolvimento pessoal
- Definição de metas SMART dentro dos planos
- Itens de ação para atingir as metas
- Check-ins de progresso e sistema de feedback
- Autenticação JWT com middleware de autorização

## 🚀 Como executar

### Pré-requisitos

- Node.js 20+
- PostgreSQL
- npm ou yarn

### Desenvolvimento

1. **Clone o repositório**

   ```bash
   git clone https://github.com/pedropaulocg/orienzoia.git
   cd orienzoia
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure o ambiente**

   ```bash
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

4. **Configure o banco de dados**

   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Execute em modo de desenvolvimento**

   ```bash
   npm run dev
   ```

   O servidor estará disponível em `http://localhost:3000`

### Produção

1. **Build da aplicação**

   ```bash
   npm run build
   ```

2. **Execute em produção**
   ```bash
   npm start
   ```

### Scripts disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compilação TypeScript para produção
- `npm start` - Execução em modo produção
- `npm run prisma:generate` - Gera o cliente Prisma após mudanças no schema
- `npm run prisma:migrate` - Aplica migrações do banco de dados
- `npm run prisma:studio` - Interface visual para o banco de dados

## 📡 API Endpoints

### 🔐 Autenticação (`/auth`)

- `POST /auth/login` - Login com email/senha (público)
- `POST /auth/refresh` - Renovar access token (público)
- `POST /auth/logout` - Logout de um dispositivo (público)
- `POST /auth/logout-all` - Logout de todos os dispositivos (autenticado)

### Autorização

Todos os endpoints (exceto auth e criação de usuários) requerem autenticação via header:

```
Authorization: Bearer <access_token>
```

**Níveis de acesso:**

- **USER**: Acessa apenas próprios PDIs
- **MANAGER**: Acessa PDIs próprios + da equipe, pode dar feedback
- **ADMIN**: Acesso total ao sistema

### 👥 Usuários (`/users`)

- `POST /users` - Criar usuário (público)
- `GET /users` - Listar usuários (MANAGER: subordinados, ADMIN: todos)
- `GET /users/:id` - Buscar usuário (próprio perfil ou MANAGER+)
- `PATCH /users/:id/activate` - Ativar usuário (ADMIN)
- `PATCH /users/:id/deactivate` - Desativar usuário (ADMIN)

### 📊 Planos (`/plans`)

- `POST /plans` - Criar plano (próprio ou subordinado se MANAGER+)
- `GET /plans/:id` - Buscar plano (próprio, da equipe ou ADMIN)
- `PATCH /plans/:id/activate` - Ativar plano (mesmo controle de acesso)
- `POST /plans/:id/feedback` - Adicionar feedback (próprio plano ou equipe)

### Exemplo de requisições

**Login:**

```bash
POST /auth/login
{
  "email": "joao@example.com",
  "password": "senha123"
}
# Retorna: { "accessToken": "...", "refreshToken": "..." }
```

**Renovar token:**

```bash
POST /auth/refresh
{
  "refreshToken": "abc123..."
}
```

**Criar usuário:**

```bash
POST /users
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "role": "USER"
}
```

**Criar plano:**

```bash
POST /plans
Authorization: Bearer <access_token>
{
  "title": "Desenvolvimento Frontend",
  "description": "Aprimorar habilidades em React e TypeScript",
  "periodFrom": "2024-01-01T00:00:00Z",
  "periodTo": "2024-12-31T23:59:59Z",
  "userId": "uuid-do-usuario" // Opcional - se não informado, será do próprio usuário
}
```

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular baseada em funcionalidades:

```
src/
├── modules/           # Módulos por domínio
│   ├── users/         # Gestão de usuários
│   └── pdi/           # Planos de desenvolvimento
├── middlewares/       # Middlewares (auth, etc.)
├── helpers/           # Utilitários (crypto, logger, etc.)
├── core/              # Tipos e utilitários centrais
└── infra/             # Infraestrutura (prisma, etc.)
```

### Padrões utilizados

- **Repository Pattern**: Interface + implementação Prisma com injeção de dependência
- **Thin Controllers**: Rotas delegam imediatamente para services
- **Middleware de Autenticação**: JWT com suporte a roles
- **Paginação Padronizada**: `PageParams` e `PageResult<T>`

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, TypeScript
- **Banco de dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT com argon2 para hash de senhas
- **Segurança**: Helmet, CORS, Compression
- **Logs**: Pino com formatação pretty para desenvolvimento

## 🤝 Contribuição

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para guidelines de desenvolvimento, padrões de commit e processo de pull request.

## 📄 Licença

Este projeto está sob a licença ISC.
