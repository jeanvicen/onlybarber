# Handoff técnico — Only Barber

## Onde continuar

- Repositório de trabalho: `C:\Users\Deivdasys\Documents\Onlybarber\.worktrees\only-barber-mvp`
- Branch: `feature/only-barber-mvp`
- Stack: Expo/React Native/Web, Expo Router, Node/Express, Prisma/PostgreSQL.
- Serviços escolhidos: Firebase Auth, Supabase PostgreSQL/Storage e Stripe Connect/Sandbox.
- Especificação aprovada: `docs/superpowers/specs/2026-06-20-only-barber-design.md`.
- Plano original: `docs/superpowers/plans/2026-06-20-only-barber-mvp.md`.

## Estado atual verificável

- Web responsiva exportada em `apps/mobile/dist` com 17 rotas estáticas.
- Modo demonstração navegável: boas-vindas, login, Home, busca, biblioteca, comunidade, curso, player e Studio.
- Criação de curso salva localmente no navegador/app e reaparece no Studio como `EM REVISÃO`.
- API possui contratos/testes para autenticação, autorização, idempotência, rate limit, checkout, webhook, progresso, Storage e exclusão de conta.
- Última verificação: 65 testes aprovados, TypeScript sem erros e export web aprovado.

## Regras que não podem ser enfraquecidas

1. Toda mutação recebe `Idempotency-Key`; repetir compra não pode repetir cobrança.
2. Webhooks Stripe validam assinatura e persistem `event_id` único antes de aplicar efeitos.
3. Tokens Firebase devem validar assinatura, emissor, audiência, expiração e revogação quando exigida.
4. Preço, permissão, propriedade do curso e divisão de receita são decididos apenas pela API.
5. Rate limit combina usuário autenticado e IP.
6. Buckets Supabase são privados, com RLS e URLs assinadas de curta duração.
7. Cartão e senha nunca passam pela API Only Barber.
8. Exclusão é soft delete com janela de apelação de 42 horas. Saldo não pode ser confiscado; deve ser pago, devolvido ou mantido conforme obrigação legal.
9. Respostas de erro usam mensagem em português e `error_code` estável.
10. Nunca versionar `.env`, service accounts, chaves Stripe ou segredos Supabase/Firebase.

## Próximo plano de implementação

### Fase 1 — ambiente real e banco

1. Criar projetos de desenvolvimento no Firebase, Supabase e Stripe Sandbox.
2. Preencher `.env` local a partir de `.env.example`, sem enviar segredos ao Git.
3. Subir PostgreSQL, executar migrations Prisma e aplicar as policies SQL/RLS do repositório.
4. Implementar repositories Prisma reais para usuários, cursos, pedidos, eventos Stripe e idempotência.
5. Substituir stores em memória da API por persistência transacional.

Critério de saída: API reinicia sem perder idempotência, eventos ou pedidos; migrations sobem num banco limpo.

### Fase 2 — autenticação e catálogo

1. Configurar Firebase no Expo e conectar email/senha e provedores escolhidos.
2. Trocar o login demo por sessão real, mantendo demo apenas em desenvolvimento.
3. Ligar Home, busca, detalhe, biblioteca e Studio à API.
4. Adicionar estados de carregamento, vazio, erro com retry e sessão expirada.
5. Validar ownership e roles em testes de integração da API.

Critério de saída: aluno e instrutor reais enxergam apenas dados permitidos e não conseguem forjar role no cliente.

### Fase 3 — pagamentos e conteúdo

1. Conectar Stripe Checkout/Connect no backend e usar preço consultado do banco.
2. Persistir `Idempotency-Key` com hash do payload e resposta final.
3. Implementar webhook transacional e deduplicado por `event_id`.
4. Implementar uploads diretos ao Supabase por URL assinada curta e download autorizado.
5. Liberar curso somente após confirmação do webhook, nunca pelo retorno do navegador.

Critério de saída: repetir request/webhook não duplica pedido, cobrança, acesso ou repasse.

### Fase 4 — distribuição

1. Testar em Android real com Expo/EAS e corrigir responsividade/acessibilidade.
2. Gerar APK/AAB de homologação e, se houver macOS/conta Apple, build iOS TestFlight.
3. Publicar a web em HTTPS e configurar variáveis de ambiente do host.
4. Rodar testes end-to-end de cadastro, compra, webhook, consumo, criação de curso e exclusão.
5. Fazer revisão de segurança antes de produção.

## Prompt pronto para outro modelo

```text
Você continuará o projeto Only Barber no diretório:
C:\Users\Deivdasys\Documents\Onlybarber\.worktrees\only-barber-mvp

Leia primeiro README.md, docs/HANDOFF_DEEPSEEK.md, a especificação em
docs/superpowers/specs/2026-06-20-only-barber-design.md e o plano em
docs/superpowers/plans/2026-06-20-only-barber-mvp.md.

Antes de alterar arquivos, rode git status, npm run typecheck e os testes relevantes.
Não apague nem sobrescreva mudanças existentes do usuário. Trabalhe em incrementos
pequenos, com teste antes da implementação. Preserve todas as invariantes de segurança
do handoff. Não invente credenciais nem marque integrações externas como prontas sem
testá-las. Ao final de cada incremento, rode typecheck, testes e build:web e informe
arquivos alterados, evidências e pendências reais.

Próxima tarefa: iniciar a Fase 1, implementando primeiro a persistência Prisma real da
idempotência e dos eventos Stripe, com migrations e testes de reinício/deduplicação.
Se não houver DATABASE_URL válida, prepare código, migrations e testes unitários,
documente o bloqueio e não simule que o banco externo foi validado.
```

## Comandos de verificação

```powershell
npm install
npm run typecheck
npm test --workspaces --if-present
npm run test:preview
npm run build:web
```

Não aceite uma alteração como concluída se algum desses comandos falhar.
