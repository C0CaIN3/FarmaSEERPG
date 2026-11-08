# FarmDesk · spoločná evidencia fariem SeeRPG

Adresa: <https://c0cain3.github.io/FarmaSEERPG/farmdesk/>

FarmDesk je samostatná appka vedľa FarmCrew. Má vlastný Supabase projekt **FarmDesk** (`twkswwabwhpmxqtiidxx`, Frankfurt) a vlastné účty. S databázou FarmCrew nezdieľa nič.

## Ako to funguje

- Každý hráč sa prihlasuje **menom a heslom** (bez e-mailu). Meno sa prevedie na adresu `meno@farmdesk.invalid`, na ktorú sa nikdy nič neposiela. Diakritika a veľkosť písmen sa ignorujú.
- **Prvý registrovaný hráč je leader.** Každý ďalší čaká na schválenie a dovtedy nevidí žiadne údaje. Leader v Nastaveniach schvaľuje, blokuje a nastavuje zabudnuté heslá.
- Farmy, pohyby na účte, denník prác, prebiehajúce práce, telefóny pracovníkov a časy pestovania sú spoločné pre všetkých schválených hráčov. Zmeny sa ukazujú živo.
- **Server** zapisuje pri každom zázname, kto ho vytvoril a kto ho naposledy zmenil. Prehliadač to nedokáže sfalšovať. Ekonomika z toho počíta, kto koľko investoval a zarobil.
- **Vyúčtovanie farmy** (za jeden nájom) delí tržby podľa vkladu. Vklad tvoria peniaze, ktoré hráč zapísal, a vlastná práca: keď prácu spravia hráči sami, má cenu podľa *Nastavenia → Cena vlastnej práce* (za 40 políčok, väčšia farma 2× / 3×) a delí sa rovným dielom medzi hráčov, ktorí na nej robili.
- Zvuk, oznámenia a odoslané pripomienky sú osobné nastavenia prehliadača.
- FarmDesk sa dá **nainštalovať ako appka** (PWA): na Androide v Chrome cez *Inštalovať aplikáciu*, na iPhone v Safari cez *Zdieľať → Pridať na plochu*. `sw.js` načítava súbory vždy najprv zo siete a uloženú kópiu použije, len keď spojenie chýba. K databáze nesiaha.
- Farmy rozrobené pred appkou: pri **Pridať farmu** sa zadá *Začiatok nájmu* v minulosti a pri **Zapísať prácu** sa dá rozbaliť *Práca bola spravená skôr?* s časom v minulosti.

## Súbory

- `index.html`, `app.js`, `art.js`, `style.css`: appka. Bez `config.js` beží v pôvodnom režime s údajmi len v prehliadači.
- `cloud.mjs`: prihlásenie a synchronizácia cez supabase-js; build ho zabalí do `cloud.js`.
- `config.js`: iba Project URL a verejný **publishable** kľúč. Tajné kľúče sem nepatria.
- `database/`: SQL schéma (`schema.sql`, `02-invoker-wrappers.sql`), už aplikovaná na projekt FarmDesk.

## Nastavenie v Supabase Dashboarde

Authentication → Sign In / Providers → Email: Email zapnutý, **Confirm email vypnutý**, minimálna dĺžka hesla 8. Bez vypnutého potvrdzovania registrácia zlyhá, lebo na adresu `…@farmdesk.invalid` nemôže prísť potvrdenie.
