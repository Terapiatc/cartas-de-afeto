# Publicar na Vercel

1. Suba o projeto para um repositório Git e importe-o na Vercel.
2. Em **Settings → Environment Variables**, adicione (Production + Preview):

| Nome | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | mesmo valor do arquivo `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | mesmo valor do arquivo `.env` |
| `VITE_SUPABASE_PROJECT_ID` | mesmo valor do arquivo `.env` |
| `SUPABASE_URL` | mesmo valor do arquivo `.env` |
| `SUPABASE_PUBLISHABLE_KEY` | mesmo valor do arquivo `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | chave de serviço do backend (necessária para cadastrar voluntários) |
| `VITE_SITE_URL` | endereço final do site, ex.: `https://cartas.vercel.app` (sem barra no fim) |

3. Build: `npm run build` (já definido em `vercel.json`). A saída usa o preset Vercel
   automaticamente — não é preciso configurar diretório de saída.
4. Depois do primeiro deploy, se o endereço mudar (domínio próprio), atualize
   `VITE_SITE_URL` e refaça o deploy para a prévia social continuar correta.

## Prévia social

A imagem compartilhada é `public/og-cartas.jpg` (1200×630), uma captura da página
com os envelopes. Para atualizá-la, basta substituir esse arquivo.
