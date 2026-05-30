# Ben Akiba – Upravljanje rezervacijama

## Setup

### 1. Supabase

1. Idi na [supabase.com](https://supabase.com) i kreiraj novi projekat
2. U SQL editoru pokreni sadržaj fajla `supabase-schema.sql`
3. U Project Settings → API prepiši `Project URL` i `anon public` ključ

### 2. Environment varijable

Popuni `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tvoja_lozinka
```

### 3. Pokretanje lokalno

```bash
npm install
npm run dev
```

Aplikacija: `http://localhost:3000`  
Admin panel: `http://localhost:3000/admin`

### 4. Deploy na Vercel

1. Push na GitHub
2. Na Vercelu importuj repo
3. Dodaj environment varijable u Vercel dashboard
4. Deploy!

## Stranice

| URL | Opis |
|-----|------|
| `/` | Javni repertoar |
| `/admin/login` | Admin prijava |
| `/admin` | Lista događaja sa statistikama |
| `/admin/events/new` | Novi događaj |
| `/admin/events/edit?id=...` | Editovanje događaja |
