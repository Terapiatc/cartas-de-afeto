# Cartas de Afeto

Crie uma aplicação web responsiva, simples e acolhedora chamada "Cartas Motivacionais", voltada para um projeto social de envio de mensagens de apoio e carinho.



### 🎨 DESIGN E ESTILO VISUAL

- **Atmosfera:** Simples, acolhedora, leve e afetiva.

- **Lista/Grade de Cartas:** 

  - Exibir cada carta como um envelope fechado com um adesivo amarelo redondo lacrando a abertura.

  - Exibir delicadamente a numeração da carta no envelope (ex: "Carta nº 01" no envelope ou "01" no centro do adesivo).

- **Visualização da Carta Aberta:**

  - A carta deve ter o fundo simulando uma folha de papel sulfite amarela (tom pastel suave).

  - O texto deve ser no formato **digitado** (fonte legível de documento impresso).

  - O título da carta é sempre CENTRALIZADO, em CAIXA ALTA e em NEGRITO.

  - O corpo do texto suporta formatações ricas (negrito, itálico, sublinhado, alinhamentos).

  - O sistema deve substituir dinamicamente a tag `{name}` pelo nome informado pelo visitante.



---



### 👤 FLUXO DO VISITANTE (DESTINATÁRIO)

1. **Entrada:**

   - O visitante digita seu primeiro nome ao acessar.

   - **Identificação da Origem no topo da tela:**

     - Se veio por link de voluntário: Exibir "Voluntário: [NOME] | [MATRÍCULA]".

     - Se veio por link compartilhado: Exibir "Remetente: [NOME/APELIDO]" ou "Remetente: ANÔNIMO".

2. **Seleção de Carta:**

   - Pode escolher uma carta na grade de envelopes ou clicar em "Sortear Carta Aleatória".

   - No modo sorteio, cartas já lidas na mesma sessão são removidas do sorteio.

   - O visitante pode navegar e reler cartas que já abriu.

3. **Avaliação (após ler a carta):**

   - Avaliar a Carta: Seleção de 1 a 5 estrelas + campo de texto para comentário.

   - Avaliar o Voluntário: Seleção de 1 a 5 estrelas + campo de texto para comentário. (Avaliação de voluntário disponível só pra link de voluntários)

4. **Compartilhamento:**

   - Ao clicar em "Compartilhar Carta", abre um modal com opções:

     - [ ] Enviar como Anônimo

     - [ ] Identificar-me (abre campo de texto para digitar Nome ou Apelido)

   - Gera um link único de compartilhamento configurado com a opção escolhida.



---



### 🤝 FLUXO DO VOLUNTÁRIO

- **Login:** Acessa via link "Acesso Restrito" no rodapé informando Matrícula e Senha.

- **Dashboard:**

  - Exibe seu link exclusivo de compartilhamento.

  - Exibe o contador total de destinatários alcançados pelo seu link.



---



### 🛠️ FLUXO DO ADMINISTRADOR (ADMIN)

- **Login:** Acessa via "Acesso Restrito" com credenciais administrativas.

- **Gestão de Cadastros (CRUD):**

  - Cadastrar, editar e excluir Cartas (com numeração e suporte a edições em rico/HTML com a tag `{name}`).

  - Cadastrar Voluntários (Nome, E-mail, Matrícula e Senha provisória).

- **Configurações do Rodapé:**

  - Editar a URL externa do botão "Ouvidoria".

  - Editar o texto institucional do rodapé.

  - Adicionar/Editar/Remover botões e links das Redes Sociais do rodapé.

- **Relatórios e Avaliações (com filtros por data/voluntário):**

  - Visualizar avaliações de cartas e de voluntários (notas em estrelas e comentários).

  - Desempenho dos voluntários: Número de destinatários (próprios e compartilhados), cartas abertas e total de compartilhamentos.

  - Logs de Acesso: Lista com Nome do Destinatário, Nome do Voluntário, cartas abertas, acesso às avaliações vinculadas ao log e contagem de destinatários derivados caso tenha sido compartilhado.



---



### 📌 RODAPÉ FIXO (TODAS AS TELAS)

- **Texto Institucional:** Editável pelo Admin.

- **Ícones/Botões de Redes Sociais:** Links configurados pelo Admin.

- **Ouvidoria:** Botão que abre o link externo configurado pelo Admin.

- **Acesso Restrito:** Botão/modal de login para Voluntários e Admins (pede Matrícula e Senha).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/898cf889-0372-494b-b3b3-1f49239581d8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
