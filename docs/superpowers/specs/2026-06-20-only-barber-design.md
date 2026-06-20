# Only Barber — Especificação de Design do MVP

Data: 20 de junho de 2026  
Status: aprovado

## 1. Objetivo

Construir a primeira versão funcional do Only Barber, uma plataforma especializada em educação para barbearia, com experiências completas para alunos e instrutores. A aplicação deve funcionar em Android, iOS e Web/Desktop a partir de uma base compartilhada em Expo/React Native.

O MVP deve permitir descobrir, comprar e consumir cursos, além de criar, submeter e administrar cursos. Pagamentos serão integrados ao Stripe em modo sandbox. A estrutura deve estar preparada para implantação real, sem transformar o MVP em uma arquitetura de microsserviços prematura.

## 2. Direção visual

A interface seguirá a referência fornecida pelo usuário e a filosofia “Clean & Bold” do documento de conceito:

- fundo principal preto fosco (`#101110`);
- superfícies e cards em cinza quase preto (`#1A1B19`);
- amarelo dourado (`#F5C518`) para ações, progresso e destaques;
- títulos fortes e condensados, com fonte legível para textos longos;
- fotos de cortes e profissionais como elementos dominantes dos cards;
- botões grandes, cantos moderadamente arredondados e ícones simples;
- contraste e espaçamento superiores aos da referência quando necessários para acessibilidade.

No celular, a navegação principal ficará em uma barra inferior. No desktop, será adaptada para uma barra lateral, com áreas de conteúdo mais largas e grids responsivos. A versão desktop não será apenas uma interface mobile esticada.

## 3. Arquitetura

O projeto será um monorepo:

- `apps/mobile`: Expo, React Native e Expo Router para Android, iOS e Web;
- `apps/api`: Node.js e Express para autenticação, regras de negócio e integrações;
- `packages/shared`: schemas de validação, tipos e regras compartilháveis sem dependências de plataforma.

Serviços externos:

- Firebase Authentication para login por e-mail, Google e Apple;
- Supabase PostgreSQL para dados transacionais;
- Supabase Storage para capas, vídeos e materiais complementares;
- Stripe Sandbox para checkout, eventos de pagamento e reembolsos de teste.

O aplicativo nunca decidirá preços, comissões, permissões ou aprovação de conteúdo. Essas regras pertencem à API. Operações administrativas, financeiras e de publicação sempre passarão pelo backend.

## 4. Perfis e permissões

### 4.1 Aluno

O aluno poderá:

- concluir onboarding com nível, interesses e objetivo;
- explorar feed, categorias, destaques e instrutores;
- buscar e filtrar por técnica, nível, preço e avaliação;
- visualizar detalhes, preview, módulos e avaliações de um curso;
- comprar em checkout Stripe Sandbox;
- assistir aulas, salvar progresso, notas e aulas concluídas;
- acessar materiais complementares;
- favoritar e avaliar cursos comprados;
- publicar, curtir e comentar na comunidade;
- consultar compras, certificados e configurações.

### 4.2 Instrutor

O instrutor terá todas as funções de aluno e também poderá:

- solicitar habilitação de instrutor com experiência e portfólio;
- acompanhar o status da solicitação;
- visualizar métricas de alunos, vendas, receita e avaliações;
- criar um curso por etapas e salvá-lo como rascunho;
- organizar módulos e aulas;
- enviar capa, vídeos e materiais complementares;
- definir preço entre R$ 29,90 e R$ 999,00;
- enviar o curso para revisão;
- acompanhar estados de rascunho, revisão, publicação e rejeição;
- consultar perguntas de alunos, cupons e extrato derivado das vendas sandbox.

### 4.3 Administração mínima

O MVP terá endpoints e permissões administrativas para aprovar ou rejeitar solicitações de instrutor e cursos. Não será construído um painel administrativo visual completo nesta fase. As operações poderão ser exercitadas por rotas protegidas e dados de desenvolvimento.

## 5. Navegação e telas

### 5.1 Entrada

- Splash e boas-vindas;
- login e cadastro;
- recuperação de acesso pelo fluxo do Firebase;
- onboarding inicial.

### 5.2 Área do aluno

- Home;
- busca e filtros;
- detalhes do curso;
- checkout;
- biblioteca “Meus cursos”;
- player e conteúdo da aula;
- comunidade;
- perfil, favoritos, compras e certificados.

### 5.3 Studio do instrutor

- visão geral;
- meus cursos;
- editor de curso em etapas;
- editor de módulos e aulas;
- uploads;
- alunos e perguntas;
- vendas e extrato.

## 6. Modelo de dados principal

As entidades centrais serão:

- usuários e perfis;
- solicitações de instrutor;
- cursos, categorias e tags;
- módulos, aulas e materiais;
- matrículas e progresso por aula;
- pedidos, itens e eventos de pagamento;
- avaliações e favoritos;
- posts, comentários e curtidas;
- cupons;
- notificações essenciais;
- certificados.

Cada usuário será relacionado ao `uid` do Firebase. Valores monetários serão armazenados em centavos. Pedidos terão estados explícitos, e eventos de webhook terão identificadores únicos para impedir processamento duplicado.

Operações que alteram estado exigirão o cabeçalho `Idempotency-Key`. A API armazenará a chave, o usuário, a operação, o hash do payload e o resultado por uma janela definida. Repetições com a mesma chave e payload retornarão o resultado original; reutilização da chave com payload diferente será rejeitada. Restrições únicas no banco complementarão essa proteção nos fluxos financeiros.

## 7. Fluxos críticos

### 7.1 Autenticação

O Firebase autentica o usuário e emite um ID token. O aplicativo envia o token à API. O backend valida criptograficamente assinatura, emissor, audiência, expiração (`exp`) e revogação usando Firebase Admin, localiza ou cria o perfil correspondente e aplica autorização por função.

A autorização ocorrerá na entrada da API e será reforçada no serviço responsável pelo recurso. Toda operação por identificador também verificará propriedade: um instrutor nunca poderá consultar ou alterar curso, aula, arquivo ou dado financeiro pertencente a outro instrutor.

### 7.2 Upload

A API verifica permissão, propriedade, tipo e tamanho do arquivo antes de gerar uma URL assinada e temporária para o Supabase Storage. As URLs terão o menor tempo de vida compatível com o upload ou download e não serão reutilizáveis como autorização permanente. Após o envio, o aplicativo confirma o identificador do arquivo. O backend valida o objeto e o associa ao curso sem expor credenciais privilegiadas.

Os buckets terão RLS ativa e serão privados por padrão. Políticas limitarão acesso ao dono do conteúdo, alunos matriculados e administradores autorizados. Vazamento de uma URL expirada não concederá acesso ao bucket nem a outros objetos.

### 7.3 Compra

A API obtém o preço vigente do banco e cria uma sessão de checkout usando a `Idempotency-Key` também na chamada ao Stripe. A mesma intenção de compra não poderá criar duas cobranças. A matrícula não é liberada pelo retorno do navegador. Um webhook Stripe assinado confirma o pagamento, registra a venda de forma idempotente e libera o acesso.

Cada `event_id` do Stripe será persistido com restrição única antes da aplicação dos efeitos financeiros. Eventos repetidos retornarão sucesso sem executar novamente a venda, a matrícula ou a divisão de receita. O pedido e a sessão de checkout também terão restrições únicas que impeçam dupla liquidação.

### 7.4 Divisão de receita

O registro financeiro seguirá o documento de negócio:

- venda normal: 70% instrutor, 25% Only Barber e 5% processamento;
- venda afiliada: 60% instrutor, 25% Only Barber, 10% afiliado e 5% processamento.

No sandbox, esses valores serão lançamentos internos; não haverá repasses bancários reais.

### 7.5 Publicação

O instrutor salva rascunhos livremente. Para enviar à revisão, o curso precisa de título, descrição, categoria, capa, preço válido e ao menos um módulo com uma aula. O backend muda o status para revisão. Apenas administrador poderá publicar ou rejeitar, sempre com justificativa no caso de rejeição.

## 8. Erros e estados da interface

- mensagens em português, claras e sem expor detalhes internos;
- campos inválidos serão destacados junto à causa;
- formulários manterão conteúdo após falhas recuperáveis;
- uploads exibirão progresso, sucesso, falha e nova tentativa;
- telas terão estados de carregamento, vazio, erro e conteúdo;
- listas vazias terão mensagens contextuais, como “Nenhum curso encontrado”, com uma próxima ação útil;
- ações destrutivas pedirão confirmação;
- respostas da API usarão um formato de erro consistente com `error_code` estável, mensagem em português, identificador da requisição e detalhes seguros de validação;
- o aplicativo decidirá quando exibir nova tentativa, autenticar novamente ou corrigir campos a partir do `error_code`, sem interpretar textos livres;
- logs do servidor terão contexto e identificador de requisição, sem tokens ou segredos.

## 9. Segurança

- segredos apenas em variáveis de ambiente do servidor;
- validação de token Firebase em rotas protegidas;
- validação explícita de assinatura, emissor, audiência, expiração e revogação do token Firebase;
- autorização por propriedade e função na raiz da API e no serviço de domínio;
- validação compartilhada de payloads;
- preços e comissões recalculados no servidor;
- verificação da assinatura dos webhooks Stripe;
- `Idempotency-Key` obrigatória em toda ação que altera estado;
- idempotência em checkout, pedidos e webhooks, reforçada por restrições únicas no banco;
- URLs assinadas de curta duração para arquivos privados;
- RLS ativa nos buckets do Supabase Storage;
- limites de tamanho e tipo nos uploads;
- rate limiting combinado por usuário autenticado e por IP, com limites mais rígidos em checkout, uploads e comunidade;
- limites de emergência globais e resposta `429` com tempo seguro para nova tentativa;
- CORS restrito por ambiente;
- nenhuma senha ou informação de cartão armazenada pelo Only Barber.

## 9.1 Exclusão de conta e saldo pendente

O pedido de exclusão iniciará um período de carência de 42 horas, dentro da faixa solicitada de 24 a 42 horas. Durante esse período, a conta ficará marcada como `deletion_pending`, com `deleted_at` agendado, e o usuário poderá cancelar o pedido ou apresentar contestação. A sessão será revogada e operações sensíveis ficarão bloqueadas.

Ao fim do prazo, dados pessoais não sujeitos a obrigação de retenção serão anonimizados ou eliminados. Registros financeiros, antifraude, fiscais e de auditoria serão preservados apenas pelo prazo e finalidade legal aplicáveis, com acesso restrito. A exclusão lógica não será usada para manter dados pessoais indefinidamente.

Uma conta com saldo de instrutor, reembolso pendente, disputa, chargeback ou saque em processamento não será concluída silenciosamente. O saldo ficará segregado e o usuário receberá um fluxo para saque ou resolução. Valores não serão apropriados automaticamente pela Only Barber. Qualquer tratamento futuro de saldo abandonado dependerá de termos transparentes e revisão jurídica e contábil específica antes de entrar em produção.

## 10. Qualidade e testes

O desenvolvimento seguirá testes antes da implementação para regras novas. A validação da entrega incluirá:

- testes unitários de autorização, publicação, progresso e divisão de receita;
- testes de reutilização e conflito de `Idempotency-Key`;
- testes de integração da API com banco de teste;
- testes do webhook Stripe duplicado, fora de ordem, inválido e concorrente;
- testes de token expirado, assinatura inválida, audiência incorreta e token revogado;
- testes de isolamento entre instrutores e das políticas RLS do Storage;
- testes de rate limit por usuário e por IP;
- testes do período de exclusão, cancelamento e bloqueio por saldo pendente;
- testes de componentes e navegação dos fluxos críticos;
- verificação de tipos e lint;
- build da aplicação Web;
- inspeção visual em larguras de celular e desktop;
- verificação dos estados de carregamento, vazio e erro;
- execução completa dos testes antes da conclusão.

## 11. Fora do escopo deste MVP

- pagamentos e repasses reais;
- DRM e download offline de vídeo;
- streaming ao vivo;
- recomendação por aprendizado de máquina;
- moderação automática por IA;
- chat em tempo real com suporte humano;
- painel administrativo visual completo;
- publicação nas lojas App Store e Google Play;
- infraestrutura de produção paga criada em nome do usuário.

O feed inicial usará regras determinísticas baseadas em categorias, avaliações e popularidade. A arquitetura permitirá substituir essas regras por um serviço de recomendação futuro.

## 12. Critérios de aceite

A entrega será considerada pronta quando:

1. um usuário conseguir cadastrar-se, concluir onboarding e navegar pela plataforma;
2. um aluno conseguir buscar um curso, concluir checkout sandbox e receber acesso após webhook;
3. o progresso do curso persistir e puder ser retomado;
4. um instrutor aprovado conseguir criar, organizar e enviar um curso à revisão;
5. um curso puder ser aprovado ou rejeitado por uma operação administrativa protegida;
6. o Studio exibir métricas coerentes com pedidos e matrículas existentes;
7. os fluxos principais funcionarem em layout mobile e desktop;
8. nenhuma rota financeira ou administrativa confiar em valores ou permissões vindos do cliente;
9. uma compra repetida com a mesma chave não gerar cobrança, pedido, matrícula ou comissão duplicados;
10. URLs expiradas não concederem acesso e as políticas RLS isolarem arquivos por permissão;
11. rate limits por usuário e IP protegerem rotas críticas sem bloquear o uso normal;
12. exclusões respeitarem a carência de 42 horas e não confiscarem saldo pendente;
13. testes, tipos, lint e build Web concluírem sem erros.
