# Only Barber MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um MVP multiplataforma do Only Barber para alunos e instrutores, com API protegida, dados persistentes, uploads privados e checkout Stripe Sandbox idempotente.

**Architecture:** Monorepo npm workspaces com Expo Router em `apps/mobile`, Express em `apps/api` e contratos Zod em `packages/shared`. A API valida Firebase ID tokens, usa Prisma sobre PostgreSQL/Supabase e mantém toda regra financeira e de autorização no servidor. Supabase Storage fornece objetos privados por URLs curtas; Stripe confirma compras somente por webhook.

**Tech Stack:** TypeScript, Expo/React Native/Web, Expo Router, TanStack Query, Express, Zod, Prisma, PostgreSQL/Supabase, Firebase Auth/Admin, Stripe, Vitest, Supertest, React Native Testing Library.

---

## Estrutura de arquivos

```text
Onlybarber/
  apps/
    api/
      prisma/schema.prisma
      src/app.ts
      src/server.ts
      src/config/env.ts
      src/http/errors.ts
      src/middleware/auth.ts
      src/middleware/idempotency.ts
      src/middleware/rate-limit.ts
      src/modules/{users,courses,storage,checkout,learning,community}/
      src/test/{database.ts,factories.ts}
    mobile/
      app/_layout.tsx
      app/(auth)/
      app/(student)/
      app/(studio)/
      src/components/
      src/features/
      src/lib/{api.ts,auth.ts,query.ts}
      src/theme/{colors.ts,spacing.ts,typography.ts}
  packages/
    shared/src/{errors.ts,money.ts,schemas.ts,index.ts}
  docs/superpowers/
```

Cada módulo da API terá `*.routes.ts`, `*.service.ts`, `*.repository.ts` e `*.test.ts`. Rotas traduzem HTTP, serviços concentram regras, repositórios isolam Prisma. No app, telas apenas compõem componentes e hooks; chamadas e estados ficam em `src/features`.

## Plano de entrega

O escopo será executado como quatro incrementos testáveis: fundação segura, vertical do aluno, vertical do instrutor e endurecimento/QA. Cada tarefa termina com software executável e um commit pequeno.

### Task 1: Criar o monorepo executável

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/server.ts`
- Create: `apps/mobile/` via Create Expo App
- Create: `packages/shared/package.json`

- [ ] **Step 1: Criar o teste de sanidade que falha**

```ts
// apps/api/src/health.test.ts
import request from "supertest";
import { app } from "./app";

it("returns the API health state", async () => {
  const response = await request(app).get("/health");
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: "ok", service: "only-barber-api" });
});
```

- [ ] **Step 2: Instalar workspaces e confirmar RED**

Run: `npm install && npm test --workspace @onlybarber/api -- health.test.ts`

Expected: FAIL porque `src/app.ts` não existe.

- [ ] **Step 3: Implementar a aplicação mínima**

```ts
// apps/api/src/app.ts
import express from "express";

export const app = express();
app.use(express.json());
app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "only-barber-api" });
});
```

- [ ] **Step 4: Criar o app Expo e scripts raiz**

Run: `npx create-expo-app@latest apps/mobile --template tabs && npm install`

Expected: projeto Expo criado; `npm run typecheck` executa em todos os workspaces.

- [ ] **Step 5: Verificar e versionar**

Run: `npm test --workspace @onlybarber/api && npm run typecheck`

Expected: PASS, sem erros TypeScript.

Commit: `chore: scaffold Only Barber monorepo`

### Task 2: Definir contratos, dinheiro e erros estruturados

**Files:**
- Create: `packages/shared/src/errors.ts`
- Create: `packages/shared/src/money.ts`
- Create: `packages/shared/src/schemas.ts`
- Create: `packages/shared/src/money.test.ts`
- Create: `apps/api/src/http/errors.ts`

- [ ] **Step 1: Escrever testes RED da divisão de receita**

```ts
import { splitRevenue } from "./money";

it("splits a normal sale without losing cents", () => {
  expect(splitRevenue(19700, false)).toEqual({
    instructor: 13790,
    platform: 4925,
    processor: 985,
    affiliate: 0,
  });
});

it("splits an affiliate sale without losing cents", () => {
  expect(splitRevenue(19700, true)).toEqual({
    instructor: 11820,
    platform: 4925,
    processor: 985,
    affiliate: 1970,
  });
});
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/shared`

Expected: FAIL com `splitRevenue is not a function`.

- [ ] **Step 3: Implementar dinheiro inteiro e envelope de erro**

```ts
export type RevenueSplit = {
  instructor: number;
  platform: number;
  processor: number;
  affiliate: number;
};

export function splitRevenue(total: number, affiliateSale: boolean): RevenueSplit {
  if (!Number.isInteger(total) || total < 0) throw new Error("INVALID_AMOUNT");
  const platform = Math.floor(total * 0.25);
  const processor = Math.floor(total * 0.05);
  const affiliate = affiliateSale ? Math.floor(total * 0.1) : 0;
  const instructor = total - platform - processor - affiliate;
  return { instructor, platform, processor, affiliate };
}
```

```ts
export type ErrorCode =
  | "AUTH_REQUIRED"
  | "TOKEN_INVALID"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "IDEMPOTENCY_KEY_REQUIRED"
  | "IDEMPOTENCY_CONFLICT"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "BALANCE_PENDING"
  | "INTERNAL_ERROR";

export type ApiErrorBody = {
  error_code: ErrorCode;
  message: string;
  request_id: string;
  details?: Record<string, string[]>;
};
```

- [ ] **Step 4: Verificar e versionar**

Run: `npm test --workspace @onlybarber/shared && npm run typecheck`

Expected: PASS.

Commit: `feat: add shared contracts and revenue rules`

### Task 3: Modelar PostgreSQL e preparar RLS do Storage

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/0001_initial/migration.sql`
- Create: `apps/api/supabase/storage-policies.sql`
- Create: `apps/api/src/test/database.ts`
- Create: `apps/api/src/modules/users/users.repository.test.ts`

- [ ] **Step 1: Escrever teste RED de isolamento por usuário**

```ts
it("does not return another instructor course", async () => {
  const owner = await factory.user({ role: "INSTRUCTOR" });
  const stranger = await factory.user({ role: "INSTRUCTOR" });
  const course = await factory.course({ instructorId: owner.id });
  expect(await courses.findOwned(course.id, stranger.id)).toBeNull();
});
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/api -- users.repository.test.ts`

Expected: FAIL porque schema e repositório ainda não existem.

- [ ] **Step 3: Criar schema com restrições essenciais**

Modelar `User`, `InstructorApplication`, `Course`, `Module`, `Lesson`, `Asset`, `Enrollment`, `LessonProgress`, `Order`, `PaymentEvent`, `RevenueEntry`, `Review`, `Favorite`, `Post`, `Comment`, `Like`, `IdempotencyRecord` e `AccountDeletion`. Incluir:

```prisma
model PaymentEvent {
  id          String   @id @default(cuid())
  stripeEventId String @unique
  processedAt DateTime @default(now())
}

model IdempotencyRecord {
  id          String   @id @default(cuid())
  userId      String
  scope       String
  key         String
  requestHash String
  statusCode  Int
  response    Json
  expiresAt   DateTime
  @@unique([userId, scope, key])
}
```

- [ ] **Step 4: Criar políticas RLS privadas**

```sql
alter table storage.objects enable row level security;

create policy "owners insert course assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'course-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "owners read own course assets"
on storage.objects for select
to authenticated
using (
  bucket_id = 'course-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

O acesso do aluno matriculado será mediado por URL assinada emitida pela API após consulta da matrícula; não haverá policy pública.

- [ ] **Step 5: Migrar, testar e versionar**

Run: `npm run db:migrate --workspace @onlybarber/api && npm test --workspace @onlybarber/api`

Expected: migrations aplicadas e PASS.

Commit: `feat: add secure data model and storage policies`

### Task 4: Validar Firebase token e autorização na raiz

**Files:**
- Create: `apps/api/src/config/firebase.ts`
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/middleware/authorize.ts`
- Create: `apps/api/src/middleware/auth.test.ts`

- [ ] **Step 1: Escrever testes RED**

```ts
it.each([
  ["expired token", new Error("auth/id-token-expired")],
  ["invalid signature", new Error("auth/argument-error")],
  ["revoked token", new Error("auth/id-token-revoked")],
])("rejects %s", async (_name, error) => {
  tokenVerifier.verify.mockRejectedValueOnce(error);
  const response = await request(app).get("/me").set("Authorization", "Bearer fake");
  expect(response.status).toBe(401);
  expect(response.body.error_code).toBe("TOKEN_INVALID");
});
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/api -- auth.test.ts`

Expected: FAIL porque middleware não existe.

- [ ] **Step 3: Implementar verificação completa**

Usar `firebase-admin/auth.verifyIdToken(token, true)`. O SDK valida assinatura, `exp`, `aud` e `iss`; `checkRevoked=true` cobre revogação. Converter qualquer falha para `TOKEN_INVALID`, sem devolver detalhes do SDK.

- [ ] **Step 4: Implementar propriedade e função**

```ts
export function requireRole(...roles: Role[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      return next(new ApiError(403, "FORBIDDEN", "Você não tem permissão para esta ação."));
    }
    next();
  };
}
```

Todos os serviços com recurso por ID receberão `actorId` e consultarão `where: { id, instructorId: actorId }`.

- [ ] **Step 5: Verificar e versionar**

Run: `npm test --workspace @onlybarber/api -- auth.test.ts && npm run typecheck`

Expected: PASS.

Commit: `feat: enforce Firebase authentication and ownership`

### Task 5: Idempotência e rate limit por usuário e IP

**Files:**
- Create: `apps/api/src/middleware/idempotency.ts`
- Create: `apps/api/src/middleware/idempotency.test.ts`
- Create: `apps/api/src/middleware/rate-limit.ts`
- Create: `apps/api/src/middleware/rate-limit.test.ts`

- [ ] **Step 1: Escrever testes RED de idempotência**

```ts
it("replays the original response for the same key and payload", async () => {
  const first = await postMutation("course-key", { title: "Fade" });
  const second = await postMutation("course-key", { title: "Fade" });
  expect(first.status).toBe(201);
  expect(second.status).toBe(201);
  expect(second.body).toEqual(first.body);
  expect(await db.course.count()).toBe(1);
});

it("rejects the same key with a different payload", async () => {
  await postMutation("course-key", { title: "Fade" });
  const response = await postMutation("course-key", { title: "Barba" });
  expect(response.status).toBe(409);
  expect(response.body.error_code).toBe("IDEMPOTENCY_CONFLICT");
});
```

- [ ] **Step 2: Confirmar RED e implementar middleware transacional**

Run: `npm test --workspace @onlybarber/api -- idempotency.test.ts`

Expected: FAIL; depois implementar hash SHA-256 canônico de método, rota e body, chave única por usuário/escopo e replay do status/body persistidos.

- [ ] **Step 3: Escrever e implementar rate limit**

Testar 429 separadamente para o mesmo `uid` em IPs distintos e para o mesmo IP com usuários distintos. Implementar stores com chaves `user:<uid>:<route>` e `ip:<ip>:<route>`, cabeçalho `Retry-After` e limites configuráveis por ambiente.

- [ ] **Step 4: Verificar e versionar**

Run: `npm test --workspace @onlybarber/api -- idempotency.test.ts rate-limit.test.ts`

Expected: PASS.

Commit: `feat: protect mutations with idempotency and rate limits`

### Task 6: Cursos, publicação e uploads privados

**Files:**
- Create: `apps/api/src/modules/courses/courses.schemas.ts`
- Create: `apps/api/src/modules/courses/courses.service.ts`
- Create: `apps/api/src/modules/courses/courses.routes.ts`
- Create: `apps/api/src/modules/courses/courses.test.ts`
- Create: `apps/api/src/modules/storage/storage.service.ts`
- Create: `apps/api/src/modules/storage/storage.test.ts`

- [ ] **Step 1: Escrever testes RED do fluxo do instrutor**

Testar: aluno não cria curso; instrutor cria rascunho; instrutor não edita curso alheio; preço fora de R$ 29,90–999,00 falha; submissão sem capa/módulo/aula falha; admin publica; rejeição exige motivo.

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/api -- courses.test.ts`

Expected: FAIL com rotas ausentes.

- [ ] **Step 3: Implementar schemas e estados**

```ts
export const courseInput = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(40).max(5000),
  categoryId: z.string().cuid(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  priceCents: z.number().int().min(2990).max(99900),
});
```

Estados permitidos: `DRAFT -> IN_REVIEW -> PUBLISHED|REJECTED`; `REJECTED -> DRAFT` após edição.

- [ ] **Step 4: Implementar URLs de cinco minutos**

Gerar upload assinado após validar dono, MIME e tamanho. Gerar download assinado com TTL de 300 segundos apenas para dono, administrador ou aluno matriculado. Nunca retornar service role key ao app.

- [ ] **Step 5: Verificar e versionar**

Run: `npm test --workspace @onlybarber/api -- courses.test.ts storage.test.ts`

Expected: PASS.

Commit: `feat: add instructor course publishing workflow`

### Task 7: Checkout e webhook Stripe sem cobrança duplicada

**Files:**
- Create: `apps/api/src/modules/checkout/checkout.service.ts`
- Create: `apps/api/src/modules/checkout/checkout.routes.ts`
- Create: `apps/api/src/modules/checkout/checkout.test.ts`
- Create: `apps/api/src/modules/checkout/webhook.test.ts`

- [ ] **Step 1: Escrever testes RED**

Cobrir: preço vem do banco; chave segue para Stripe; repetição retorna a mesma sessão; `event_id` duplicado não duplica matrícula/receita; assinatura inválida retorna 400; eventos concorrentes geram uma única liquidação; evento fora de ordem não regride pedido pago.

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/api -- checkout.test.ts webhook.test.ts`

Expected: FAIL com módulo ausente.

- [ ] **Step 3: Implementar criação idempotente**

```ts
const session = await stripe.checkout.sessions.create(
  {
    mode: "payment",
    line_items: [{ price_data: serverPrice, quantity: 1 }],
    success_url: env.CHECKOUT_SUCCESS_URL,
    cancel_url: env.CHECKOUT_CANCEL_URL,
    metadata: { orderId: order.id, userId: actor.id, courseId: course.id },
  },
  { idempotencyKey },
);
```

- [ ] **Step 4: Implementar webhook transacional**

Verificar assinatura usando body bruto. Dentro de uma transação, inserir `PaymentEvent.stripeEventId`; se a restrição única conflitar, retornar 200. Travar/atualizar o pedido apenas de estado não pago para pago, criar matrícula única e lançamentos calculados por `splitRevenue`.

- [ ] **Step 5: Verificar e versionar**

Run: `npm test --workspace @onlybarber/api -- checkout.test.ts webhook.test.ts`

Expected: PASS, incluindo concorrência.

Commit: `feat: add idempotent Stripe sandbox checkout`

### Task 8: Aprendizado, comunidade e exclusão com carência

**Files:**
- Create: `apps/api/src/modules/learning/learning.service.ts`
- Create: `apps/api/src/modules/learning/learning.test.ts`
- Create: `apps/api/src/modules/community/community.service.ts`
- Create: `apps/api/src/modules/community/community.test.ts`
- Create: `apps/api/src/modules/users/deletion.service.ts`
- Create: `apps/api/src/modules/users/deletion.test.ts`

- [ ] **Step 1: Escrever testes RED**

Cobrir progresso monotônico e retomada, avaliação somente por matriculado, post/comentário com rate limit, pedido de exclusão com `deleteAfter = now + 42h`, cancelamento dentro do prazo, anonimização após o prazo e bloqueio por saldo/disputa/saque pendente.

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/api -- learning.test.ts community.test.ts deletion.test.ts`

Expected: FAIL com serviços ausentes.

- [ ] **Step 3: Implementar regras mínimas**

Progresso aceita posição entre zero e a duração da aula e usa `max(oldPosition, newPosition)` para conclusão. Exclusão marca `deletion_pending`, revoga sessões e agenda job; o job anonimiza perfil, preserva registros legalmente necessários e recusa finalização com `BALANCE_PENDING` quando houver valor ou disputa.

- [ ] **Step 4: Verificar e versionar**

Run: `npm test --workspace @onlybarber/api -- learning.test.ts community.test.ts deletion.test.ts`

Expected: PASS.

Commit: `feat: add learning community and account lifecycle`

### Task 9: Criar design system e shell responsivo Expo

**Files:**
- Create: `apps/mobile/src/theme/colors.ts`
- Create: `apps/mobile/src/theme/spacing.ts`
- Create: `apps/mobile/src/components/AppButton.tsx`
- Create: `apps/mobile/src/components/CourseCard.tsx`
- Create: `apps/mobile/src/components/ScreenState.tsx`
- Create: `apps/mobile/src/components/components.test.tsx`
- Modify: `apps/mobile/app/_layout.tsx`

- [ ] **Step 1: Escrever testes RED de estados e acessibilidade**

```tsx
it("renders a useful empty state", () => {
  render(<ScreenState state="empty" title="Nenhum curso encontrado" actionLabel="Limpar filtros" />);
  expect(screen.getByText("Nenhum curso encontrado")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Limpar filtros" })).toBeTruthy();
});
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/mobile -- components.test.tsx`

Expected: FAIL com componente ausente.

- [ ] **Step 3: Implementar tokens e componentes**

Usar `#101110`, `#1A1B19`, `#F5C518`, `#FFFFFF` e `#A7A7A2`; alvo de toque mínimo 44 px; foco visível na Web. `ScreenState` terá variantes `loading`, `empty`, `error` e `content`, com retry acessível.

- [ ] **Step 4: Implementar shell adaptativo**

Em largura menor que 768 px, tabs inferiores; a partir de 768 px, sidebar fixa de 240 px e conteúdo central limitado a 1280 px. Rotas Studio aparecem apenas para instrutores aprovados.

- [ ] **Step 5: Verificar e versionar**

Run: `npm test --workspace @onlybarber/mobile && npm run typecheck`

Expected: PASS.

Commit: `feat: add Only Barber responsive design system`

### Task 10: Implementar autenticação e experiência do aluno

**Files:**
- Create: `apps/mobile/src/lib/firebase.ts`
- Create: `apps/mobile/src/lib/api.ts`
- Create: `apps/mobile/src/features/auth/AuthProvider.tsx`
- Create: `apps/mobile/app/(auth)/index.tsx`
- Create: `apps/mobile/app/(auth)/onboarding.tsx`
- Create: `apps/mobile/app/(student)/index.tsx`
- Create: `apps/mobile/app/(student)/search.tsx`
- Create: `apps/mobile/app/(student)/courses/[id].tsx`
- Create: `apps/mobile/app/(student)/learn/[courseId].tsx`
- Create: `apps/mobile/app/(student)/community.tsx`
- Create: `apps/mobile/src/features/student/student-flow.test.tsx`

- [ ] **Step 1: Escrever teste RED do fluxo principal**

Testar login, onboarding, home com loading, busca vazia com “Nenhum curso encontrado”, detalhe, criação de checkout com uma chave estável durante retries e retomada do progresso.

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/mobile -- student-flow.test.tsx`

Expected: FAIL com rotas ausentes.

- [ ] **Step 3: Implementar cliente seguro**

`api.ts` obtém ID token fresco do Firebase, envia `Authorization: Bearer`, gera UUID para mutações novas, preserva a mesma `Idempotency-Key` em retries e trata `error_code`. Em `TOKEN_INVALID`, força reautenticação; em `RATE_LIMITED`, respeita `Retry-After`.

- [ ] **Step 4: Implementar telas e estados**

Construir telas conforme a referência: cards fotográficos escuros, CTA amarelo, tipografia forte e grids responsivos. Cada query apresenta loading, vazio, erro com retry e conteúdo. Checkout abre a URL Stripe e aguarda confirmação da API antes de exibir o curso na biblioteca.

- [ ] **Step 5: Verificar e versionar**

Run: `npm test --workspace @onlybarber/mobile -- student-flow.test.tsx && npm run web --workspace @onlybarber/mobile`

Expected: testes PASS e servidor Web inicia sem erro.

Commit: `feat: add student learning experience`

### Task 11: Implementar Studio do instrutor

**Files:**
- Create: `apps/mobile/app/(studio)/index.tsx`
- Create: `apps/mobile/app/(studio)/courses.tsx`
- Create: `apps/mobile/app/(studio)/courses/new.tsx`
- Create: `apps/mobile/app/(studio)/courses/[id].tsx`
- Create: `apps/mobile/app/(studio)/sales.tsx`
- Create: `apps/mobile/src/features/studio/CourseWizard.tsx`
- Create: `apps/mobile/src/features/studio/UploadField.tsx`
- Create: `apps/mobile/src/features/studio/studio-flow.test.tsx`

- [ ] **Step 1: Escrever teste RED do Studio**

Testar solicitação de instrutor, dashboard, rascunho preservado após erro, módulos/aulas, upload com progresso/retry, submissão e rejeição com motivo. Testar que usuário não aprovado não vê nem abre rotas Studio.

- [ ] **Step 2: Confirmar RED**

Run: `npm test --workspace @onlybarber/mobile -- studio-flow.test.tsx`

Expected: FAIL com telas ausentes.

- [ ] **Step 3: Implementar wizard e uploads**

Dividir em etapas Informações, Conteúdo, Mídia, Preço e Revisão. Persistir rascunho local até confirmação da API. `UploadField` solicita URL, envia diretamente ao Storage, confirma asset e renova URL expirada sem reutilizá-la.

- [ ] **Step 4: Implementar dashboard e permissões**

Métricas vêm exclusivamente da API. Entradas financeiras exibem valores inteiros formatados em BRL. Rotas verificam claims locais apenas para UX; a API continua sendo a autoridade.

- [ ] **Step 5: Verificar e versionar**

Run: `npm test --workspace @onlybarber/mobile -- studio-flow.test.tsx && npm run typecheck`

Expected: PASS.

Commit: `feat: add instructor Studio experience`

### Task 12: Endurecimento, documentação e verificação final

**Files:**
- Create: `README.md`
- Create: `apps/api/src/security/security.integration.test.ts`
- Create: `apps/mobile/e2e/critical-flows.spec.ts`
- Modify: `.env.example`
- Modify: `package.json`

- [ ] **Step 1: Criar teste de segurança integrado**

Testar token inválido, acesso cruzado entre instrutores, mutation sem chave, replay conflitante, dupla compra concorrente, webhook duplicado, URL expirada simulada, RLS, rate limit e exclusão com saldo.

- [ ] **Step 2: Executar toda a suíte**

Run: `npm test --workspaces --if-present`

Expected: todas as suítes PASS, sem testes ignorados nos fluxos críticos.

- [ ] **Step 3: Executar verificações estáticas e builds**

Run: `npm run lint && npm run typecheck && npm run build:web`

Expected: exit code 0 e sem warnings tratados como erro.

- [ ] **Step 4: Verificar visualmente**

Abrir a Web em 390×844, 768×1024 e 1440×900. Confirmar navegação inferior/side bar, ausência de overflow, foco visível, loading, vazio, erro/retry, checkout e Studio. Corrigir qualquer regressão e repetir os comandos do Step 3.

- [ ] **Step 5: Documentar setup sem segredos**

README deve listar Node compatível, criação dos projetos Firebase/Supabase/Stripe Sandbox, aplicação de migrations e policies, variáveis necessárias, comandos de teste e execução. `.env.example` conterá somente nomes e valores fictícios.

- [ ] **Step 6: Revisar segredos e versionar**

Run: `git grep -n -E "(sk_live_|sk_test_[A-Za-z0-9]{16,}|service_role|BEGIN PRIVATE KEY)" -- ':!docs/**' ':!.env.example'`

Expected: nenhuma ocorrência.

Commit: `test: verify Only Barber MVP security and builds`

## Dependências externas para execução real

Durante o desenvolvimento, adapters falsos serão usados nos testes. Para executar integrações reais serão necessários, sem compartilhamento de segredos no chat:

- projeto Firebase e configuração pública do app;
- credencial Firebase Admin no ambiente da API;
- projeto Supabase, URL PostgreSQL e service role apenas no servidor;
- bucket privado `course-assets` com policies aplicadas;
- conta Stripe em modo teste, chave secreta e webhook secret.

O app poderá ser construído e testado sem essas credenciais; login social, upload real e checkout real somente funcionarão após configuração local segura.

