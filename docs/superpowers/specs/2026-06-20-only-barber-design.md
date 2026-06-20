# Only Barber — Especificação de Design do MVP

Data: 20 de junho de 2026  
Status: aprovado em conversa, aguardando revisão do documento escrito

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

## 7. Fluxos críticos

### 7.1 Autenticação

O Firebase autentica o usuário e emite um ID token. O aplicativo envia o token à API. O backend valida assinatura, emissor e validade usando Firebase Admin, localiza ou cria o perfil correspondente e aplica autorização por função.

### 7.2 Upload

A API verifica a permissão e gera uma URL temporária para upload no Supabase Storage. Após o envio, o aplicativo confirma o identificador do arquivo. O backend associa o arquivo ao curso sem expor credenciais privilegiadas.

### 7.3 Compra

A API obtém o preço vigente do banco e cria uma sessão de checkout. A matrícula não é liberada pelo retorno do navegador. Um webhook Stripe assinado confirma o pagamento, registra a venda de forma idempotente e libera o acesso.

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
- ações destrutivas pedirão confirmação;
- respostas da API usarão um formato de erro consistente;
- logs do servidor terão contexto e identificador de requisição, sem tokens ou segredos.

## 9. Segurança

- segredos apenas em variáveis de ambiente do servidor;
- validação de token Firebase em rotas protegidas;
- autorização por propriedade e função em cada operação;
- validação compartilhada de payloads;
- preços e comissões recalculados no servidor;
- verificação da assinatura dos webhooks Stripe;
- idempotência em pagamentos;
- URLs temporárias para arquivos privados;
- limites de tamanho e tipo nos uploads;
- rate limiting nas rotas de autenticação indireta, comunidade e checkout;
- CORS restrito por ambiente;
- nenhuma senha ou informação de cartão armazenada pelo Only Barber.

## 10. Qualidade e testes

O desenvolvimento seguirá testes antes da implementação para regras novas. A validação da entrega incluirá:

- testes unitários de autorização, publicação, progresso e divisão de receita;
- testes de integração da API com banco de teste;
- teste do webhook Stripe duplicado e inválido;
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
9. testes, tipos, lint e build Web concluírem sem erros.

