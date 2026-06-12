# Stroke Shop — Ecommerce / Vetrina

Sito ecommerce per **Stroke Shop**, negozio streetwear a Salò (BS) sul Lago di Garda, attivo dal 2002.

Pensato attorno a come lavora davvero il negozio:

- **Un pezzo per taglia** — il catalogo riflette lo stock reale, le taglie esaurite si vedono subito.
- **Ordine = prenotazione** — il cliente ordina, il negozio verifica che il capo sia ancora appeso e conferma entro 24/48h. Con Stripe attivo la carta viene solo *autorizzata*: si incassa alla conferma, si rilascia all'annullamento. Mai rimborsi a sorpresa.
- **Import del file Excel di magazzino** — si carica il file così com'è (brand, tipologia, nome articolo, prezzi, IVA, quantità, anno, stagione), il sito mostra un'anteprima delle differenze e applica solo ciò che approvi. I nuovi articoli nascono come bozza: vanno online solo dopo che hai aggiunto foto e taglie.
- **Bilingue IT/EN** — per i clienti locali e per i turisti del lago.

## Avvio rapido

```bash
cp .env.example .env        # poi modifica SESSION_SECRET e ADMIN_PASSWORD
npm install
npx prisma migrate dev      # crea il database SQLite
npm run db:seed             # 18 prodotti demo + 1 ordine di prova
npm run dev                 # http://localhost:3000
```

- Sito pubblico: `http://localhost:3000` (redirect su `/it`, inglese su `/en`)
- Area admin: `http://localhost:3000/admin` — credenziali da `.env` (`ADMIN_USER` / `ADMIN_PASSWORD`)

## Come si usa (per il negozio)

1. **Aggiornare il catalogo**: Admin → *Import Excel* → carica il file `.xlsx` del magazzino → controlla l'anteprima (nuovi / aggiornati / assenti dal file) → applica. L'import **non tocca mai** foto, stato di pubblicazione o stock delle taglie: quelli li gestisci tu, perché sono più affidabili di un Excel vecchio di 3 giorni.
2. **Mettere un capo online**: Admin → *Prodotti* → apri la bozza → carica le foto (vengono ridimensionate e convertite in automatico) → aggiungi le taglie disponibili → *Pubblica online*.
3. **Gestire una prenotazione**: Admin → *Ordini* → apri l'ordine → controlla che i capi siano in negozio → **Conferma** (incassa il pagamento se Stripe è attivo) o **Annulla** (ripristina lo stock e rilascia l'autorizzazione). La dashboard segnala gli ordini vicini alla scadenza dell'autorizzazione (~7 giorni).

## Configurazione (`.env`)

| Variabile | Descrizione |
|---|---|
| `DATABASE_URL` | SQLite di default (`file:./dev.db`), nessun account esterno necessario |
| `SESSION_SECRET` | Min 32 caratteri casuali, protegge la sessione admin |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Login dell'area admin |
| `NEXT_PUBLIC_SITE_URL` | URL pubblico (per sitemap, OG, redirect Stripe) |
| `STRIPE_ENABLED` | `false` (default): ordini senza pagamento online, il negozio contatta il cliente. `true`: carta autorizzata al checkout, incasso manuale alla conferma |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Richiesti solo con Stripe attivo |
| `EMAIL_ENABLED` + `RESEND_API_KEY` | Email automatiche di prenotazione/conferma/annullo (opzionale, via [Resend](https://resend.com)) |
| `SHOP_NOTIFICATION_EMAIL` | Dove ricevere l'avviso di nuovo ordine |

### Attivare Stripe (quando il negozio avrà l'account)

1. Crea l'account su [stripe.com](https://stripe.com), copia la chiave segreta in `STRIPE_SECRET_KEY`.
2. Crea un webhook verso `https://TUO-DOMINIO/api/stripe/webhook` con gli eventi `checkout.session.completed` e `checkout.session.expired`; copia il signing secret in `STRIPE_WEBHOOK_SECRET`.
3. `STRIPE_ENABLED="true"` e riavvia.

In locale: `stripe listen --forward-to localhost:3000/api/stripe/webhook` e carta di test `4242 4242 4242 4242`.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite · next-intl (IT/EN) · Motion · ExcelJS · Stripe (manual capture) · iron-session · sharp.

## Deploy in produzione

Il progetto usa SQLite + upload foto su filesystem: la via più semplice è un host con **disco persistente** (VPS, [Fly.io](https://fly.io), [Railway](https://railway.app), Hetzner): `npm run build && npm start` dietro un reverse proxy.

In alternativa su Vercel: sposta il database su [Turso](https://turso.tech) (driver libSQL per Prisma) e le foto su Vercel Blob — lo schema non cambia.

Dominio: `strokeshop.it` (o `.com`) da registrare e puntare all'host scelto.

## Script utili

```bash
npm run dev          # sviluppo
npm run build        # build di produzione
npm run db:migrate   # migrazioni Prisma
npm run db:seed      # ripopola i dati demo (ATTENZIONE: svuota le tabelle)
npm run db:studio    # interfaccia visuale sul database
npm run lint         # ESLint
```
