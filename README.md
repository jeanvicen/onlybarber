# Only Barber

Aplicação Expo/React Native para Web, Android e iOS, com API Node/Express e domínio preparado para Firebase Auth, Supabase PostgreSQL/Storage e Stripe Sandbox.

## Abrir a build utilizável no Windows

Após clonar o repositório, clique duas vezes em `INICIAR_ONLY_BARBER.cmd`. No primeiro uso, o inicializador instala as dependências, gera a build e abre `http://127.0.0.1:4173`. Os próximos usos reaproveitam a build existente.

Ou, pelo PowerShell:

```powershell
npm install
npm run build:web
npm run preview:web
```

Na tela inicial, selecione **Começar agora** e depois **Explorar demonstração**. A demonstração inclui Home, busca, biblioteca, comunidade, detalhe do curso, player, Studio e criação de curso.

## Desenvolvimento

```powershell
npm run web --workspace @onlybarber/mobile
npm run dev --workspace @onlybarber/api
```

## Verificação

```powershell
npm test --workspaces --if-present
npm run test:preview
npm run typecheck
npm run build:web
```

## Serviços externos

Copie `.env.example` para um arquivo local `.env` e preencha as credenciais. Nunca versione chaves. Sem credenciais, use o modo demonstração; login social, uploads reais e checkout Stripe permanecem desativados.

As regras sensíveis ficam na API: preço, permissões, divisão de receita, idempotência, webhook, URLs assinadas e exclusão de conta.
