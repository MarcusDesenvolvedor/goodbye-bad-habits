# Goodbye Bad Habits

**Goodbye Bad Habits** é um aplicativo web para organizar tarefas em um **quadro estilo Kanban** (colunas como *A fazer*, *Em andamento*, *Concluído*), com caixa de entrada e lembretes. Você entra com uma conta, cria quadros e gerencia cartões no seu espaço de trabalho.

O projeto usa tecnologias web atuais (Next.js, React, banco PostgreSQL e [Clerk](https://clerk.com) para login). Você **não** precisa saber programar para rodar o app no seu computador—só instalar algumas ferramentas e preencher algumas configurações.

---

## O que você precisa no computador

| Requisito | O que é |
|-----------|---------|
| **Computador** | Windows, macOS ou Linux |
| **Internet** | Para baixar programas e criar contas gratuitas (banco + login) |
| **Cerca de 15–30 minutos** | Na primeira vez |

Você vai instalar ou usar:

1. **Node.js** (vem com o `npm`) — executa o aplicativo na sua máquina.  
2. **Um banco PostgreSQL** — guarda quadros e tarefas. Para quem está começando, o mais simples é um **banco gratuito na nuvem** (sem precisar instalar o PostgreSQL no PC).  
3. **Uma conta Clerk** — cuida do “Entrar / Criar conta” do app.

Opcional: **Git** — só se você for clonar o repositório do GitHub. Se você recebeu o projeto em um arquivo ZIP, pode ignorar o Git.

---

## Passo 1 — Instalar o Node.js

1. Abra [https://nodejs.org](https://nodejs.org).
2. Baixe a versão **LTS** (“Long Term Support”) para o seu sistema.
3. Execute o instalador e aceite as opções padrão (confira se a instalação do **npm** está marcada).
4. Feche e abra de novo o terminal.

**Conferir se deu certo**

- **Windows:** abra o **PowerShell** ou o **Prompt de Comando** e rode:

  ```bash
  node -v
  npm -v
  ```

  Deve aparecer números de versão (por exemplo `v22.x` e `10.x`), não mensagem de erro.

- **macOS / Linux:** abra o **Terminal** e use os mesmos comandos.

---

## Passo 2 — Colocar o projeto na sua máquina

**Opção A — Pasta ZIP**

1. Descompacte o projeto em uma pasta que você lembre, por exemplo `Documentos\goodbye-bad-habits`.

**Opção B — Git**

1. Instale o Git em [https://git-scm.com](https://git-scm.com), se ainda não tiver.
2. No terminal, vá até a pasta onde você guarda projetos e rode:

   ```bash
   git clone <URL_DESTE_REPOSITORIO>
   cd goodbye-bad-habits
   ```

Nos próximos passos, todos os comandos são executados **dentro da pasta do projeto** (onde está o arquivo `package.json`).

---

## Passo 3 — Instalar as dependências do projeto

Na pasta do projeto, rode:

```bash
npm install
```

Espere terminar. Isso baixa as bibliotecas que o app precisa.

---

## Passo 4 — Criar um banco PostgreSQL (nuvem gratuita)

O app precisa de uma URL de conexão chamada `DATABASE_URL`. Caminhos mais fáceis:

1. **[Neon](https://neon.tech)** ou **[Supabase](https://supabase.com)** — crie uma conta, crie um projeto, escolha **PostgreSQL** e copie a **string de conexão** (algo como `postgresql://usuario:senha@host/banco?...`).
2. Guarde em um lugar seguro; você vai colar no próximo passo.

> **Dica:** Em geral a string aparece como “Connection string”, “Database URL” ou “URI”. Se pedirem SSL (`sslmode=require` ou similar), mantenha isso na URL quando a documentação do serviço indicar.

---

## Passo 5 — Criar um aplicativo no Clerk (login)

1. Acesse [https://dashboard.clerk.com](https://dashboard.clerk.com) e crie uma conta gratuita.
2. Crie um novo **aplicativo** (application).
3. Abra **API Keys** (ou **Configure → API Keys**).
4. Copie:
   - **Publishable key** — começa com `pk_`
   - **Secret key** — começa com `sk_`

**Permitir localhost**

No painel do Clerk, em **Domains** / **Allowed origins** / configurações de **Development**, confira se **`http://localhost:3000`** está liberado para desenvolvimento local (muitas vezes já vem assim; se o login falhar no navegador, verifique isso primeiro).

---

## Passo 6 — Arquivo de ambiente (`.env.local`)

1. Na pasta do projeto, localize o arquivo **`.env.example`**.
2. **Copie** esse arquivo e renomeie a cópia para **`.env.local`** (na mesma pasta do `package.json`).
3. Abra o **`.env.local`** em um editor de texto (Bloco de Notas, VS Code, etc.) e preencha:

   | Variável | O que colocar |
   |----------|----------------|
   | `DATABASE_URL` | A string de conexão PostgreSQL do Passo 4 |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Chave pública do Clerk (`pk_...`) |
   | `CLERK_SECRET_KEY` | Chave secreta do Clerk (`sk_...`) |

4. Salve o arquivo.

> **Segurança:** Não envie o `.env.local` para o GitHub nem compartilhe suas chaves secretas. Esse arquivo fica só na sua máquina.

---

## Passo 7 — Criar as tabelas no banco

Com o `DATABASE_URL` definido no `.env.local`, rode:

```bash
npx prisma migrate deploy
```

Isso aplica a estrutura já definida no projeto (quadros, listas, cartões, etc.). Se aparecer erro, leia a mensagem: em geral é URL do banco errada ou banco inacessível.

---

## Passo 8 — Subir o aplicativo

```bash
npm run dev
```

Quando aparecer algo como “Ready on http://localhost:3000”, abra o navegador em:

**[http://localhost:3000](http://localhost:3000)**

Crie uma conta ou entre com o Clerk e use **Meus quadros** e as páginas de quadro normalmente.

Para parar o servidor, volte ao terminal e pressione **Ctrl+C**.

---

## Problemas comuns

| Problema | O que tentar |
|----------|----------------|
| `node` ou `npm` não encontrado | Reinstale o Node.js LTS e abra um terminal **novo**. |
| Erros do Clerk no navegador | Confira as chaves no `.env.local`, reinicie o `npm run dev`, veja no Clerk se `http://localhost:3000` está permitido. |
| Erros de banco / Prisma | Revise o `DATABASE_URL` (senha, host, `sslmode` se o provedor pedir). |
| Porta 3000 em uso | Feche outro programa que use a porta 3000, ou rode `npx next dev -p 3001` e abra `http://localhost:3001` (pode ser preciso liberar essa URL no Clerk). |

---

## Comandos úteis (referência)

| Comando | Função |
|---------|--------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera versão de “produção” |
| `npm run start` | Roda a build de produção (depois do `build`) |
| `npm run lint` | Verificações de código |
| `npm run db:migrate` | Migrações Prisma em modo dev (pode pedir confirmação) |
| `npm run db:push` | Atualiza o schema sem migrações (uso mais avançado) |

Opcional: a variável `STITCH_API_KEY` no `.env.local` serve só para baixar assets de referência de design (`npm run stitch:board-assets`); **não** é necessária para rodar o app.

---

## Stack técnica (resumo)

- **Next.js** e **React** — interface e rotas  
- **Prisma** e **PostgreSQL** — dados  
- **Clerk** — autenticação  
- **Tailwind CSS** — estilos  

---

## Licença

O projeto está marcado como privado (`"private": true` no `package.json`). Ajuste a licença se publicar o repositório.

---

*English version: [README.md](./README.md)*
