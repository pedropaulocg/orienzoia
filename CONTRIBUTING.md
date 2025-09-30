# Guia de Contribuição

Obrigado pelo interesse em contribuir com o Orienzoia! Este documento fornece diretrizes para desenvolvimento e contribuição.

## 🔧 Configuração do Ambiente de Desenvolvimento

1. **Fork e clone o repositório**

   ```bash
   git clone https://github.com/SEU_USUARIO/orienzoia.git
   cd orienzoia
   ```

2. **Configure o ambiente**

   ```bash
   npm install
   cp .env.example .env
   # Configure suas variáveis de ambiente
   ```

3. **Configure o banco de dados**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

## 📝 Padrões de Commit

Utilizamos **Conventional Commits** para padronizar as mensagens de commit:

### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos permitidos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta funcionalidade)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de build, configurações, etc.

### Exemplos

```
feat(users): adicionar endpoint de ativação de usuário
fix(auth): corrigir validação de token JWT
docs: atualizar README com novos endpoints
refactor(repositories): extrair interface comum de paginação
chore(deps): atualizar dependências do prisma
```

## 🏗️ Padrões de Código

### Estrutura de Módulos

Siga o padrão estabelecido em `src/modules/`:

```
modules/[dominio]/
├── http/                    # Controllers (rotas)
├── repositories/            # Camada de dados
│   ├── [entidade].repository.ts       # Interface
│   └── prisma-[entidade].repository.ts # Implementação
├── services/               # Lógica de negócio
└── types.ts               # Tipos específicos do domínio
```

### Convenções de Código

#### 1. **Repositories**

- Sempre crie interface + implementação Prisma
- Use `userSafeSelect` para excluir campos sensíveis
- Implemente paginação com `PageParams` e `PageResult<T>`

```typescript
// ✅ Bom
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  list(params?: PageParams): Promise<PageResult<UserPublic>>;
}

export class PrismaUserRepository implements IUserRepository {
  // implementação...
}
```

#### 2. **Services**

- Recebem repositories via injeção de dependência
- Contêm a lógica de negócio
- Validam entrada e delegam para repositories

```typescript
// ✅ Bom
export class UserService {
  constructor(private readonly users: IUserRepository) {}

  async create(input: CreateUserInput) {
    const passwordHash = await Crypto.hashPassword(input.password);
    return this.users.create({ ...input, passwordHash });
  }
}
```

#### 3. **Controllers (Routes)**

- Controllers "magros" - delegam para services
- Padrões HTTP consistentes:
  - `POST /` → 201 (Created)
  - `GET /:id` → 200 (OK) ou 404 (Not Found)
  - `PATCH /:id/action` → 204 (No Content)

```typescript
// ✅ Bom
router.post('/', async (req, res) => {
  const created = await service.create(req.body);
  res.status(201).json(created);
});
```

#### 4. **Autenticação**

- Use `AuthMiddleware` para proteger rotas
- Estenda `AuthRequest` para adicionar `req.user`
- Aplique controle de acesso com `AuthMiddleware.onlyRoles()`

```typescript
// ✅ Bom
router.get(
  '/',
  auth.handle,
  AuthMiddleware.onlyRoles(['ADMIN']),
  async (req, res) => {
    // lógica protegida
  }
);
```

### Banco de Dados

#### Migrações

- Use sempre `npm run prisma:migrate` para mudanças no schema
- Nomear migrações de forma descritiva
- Testar migrações em ambiente local antes do PR

#### Schema Patterns

- Use `@db.Citext` para emails (case-insensitive)
- Adicione índices em foreign keys e campos consultados frequentemente
- Use `onDelete: Cascade` para relacionamentos pai-filho
- Soft deletes com `deletedAt?: DateTime`

## 🔀 Workflow de Pull Request

### 1. **Antes de criar o PR**

- [ ] Código segue os padrões estabelecidos
- [ ] Commits seguem conventional commits
- [ ] Testes locais passando
- [ ] Migrações aplicadas e testadas
- [ ] Documentação atualizada (se necessário)

### 2. **Criação do PR**

- Use o template de PR (será preenchido automaticamente)
- Título deve seguir conventional commits
- Descrever mudanças e contexto
- Referenciar issues relacionadas

### 3. **Review Process**

- PRs requerem pelo menos 1 aprovação
- Endereçar comentários do review
- Manter histórico limpo (squash se necessário)

## 🧪 Testes

### Estratégia de Testes

- **Unitários**: Services e repositories
- **Integração**: Endpoints completos
- **E2E**: Fluxos críticos de usuário

### Convenções

```typescript
// Nomenclatura de testes
describe('UserService', () => {
  describe('create', () => {
    it('should create user with hashed password', () => {
      // teste...
    });

    it('should throw error when email already exists', () => {
      // teste...
    });
  });
});
```

## 🐛 Reportando Bugs

Ao reportar bugs, inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Ambiente (OS, Node version, etc.)
- Logs relevantes

## 💡 Sugerindo Funcionalidades

Para novas funcionalidades:

- Descreva o problema que resolve
- Proponha a solução
- Considere impacto na arquitetura existente
- Discuta na issue antes de implementar

## 📞 Dúvidas

- Abra uma issue com a label `question`
- Consulte a documentação existente
- Revise PRs anteriores para entender padrões

---

**Obrigado por contribuir! 🚀**
