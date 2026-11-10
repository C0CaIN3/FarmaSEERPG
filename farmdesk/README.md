# FarmDesk · spoločná evidencia fariem SeeRPG

Adresa: <https://c0cain3.github.io/FarmaSEERPG/farmdesk/>

FarmDesk je samostatná appka vedľa FarmCrew. Má vlastný Supabase projekt **FarmDesk** (`twkswwabwhpmxqtiidxx`, Frankfurt) a vlastné účty. S databázou FarmCrew nezdieľa nič.

## Ako to funguje

- Každý hráč sa prihlasuje **menom a heslom** (bez e-mailu). Meno sa prevedie na adresu `meno@farmdesk.invalid`, na ktorú sa nikdy nič neposiela. Diakritika a veľkosť písmen sa ignorujú.
- **Prvý registrovaný hráč je leader.** Každý ďalší čaká na schválenie a dovtedy nevidí žiadne údaje. Leader v Nastaveniach schvaľuje, blokuje a nastavuje zabudnuté heslá.
- Farmy, pohyby na účte, denník prác, prebiehajúce práce, telefóny pracovníkov a časy pestovania sú spoločné pre všetkých schválených hráčov. Zmeny sa ukazujú živo.
- **Server** zapisuje pri každom zázname, kto ho vytvoril a kto ho naposledy zmenil. Prehliadač to nedokáže sfalšovať. Ekonomika z toho počíta, kto koľko investoval a zarobil.
- **Vyúčtovanie farmy** (za jeden nájom) delí tržby podľa vkladu. Vklad tvoria peniaze, ktoré hráč zapísal, a vlastná práca: keď prácu spravia hráči sami, má cenu podľa *Nastavenia → Cena vlastnej práce* (za 40 políčok, väčšia farma 2× / 3×) a delí sa rovným dielom medzi hráčov, ktorí na nej robili.
- **Notifikácie do telefónu** (Web Push): každý hráč si ich zapne v *Nastavenia → Upozornenia* pre každé zariadenie a zvolí kategórie (polievanie, zber, nájmy, práce, predaje, noví hráči). Supabase funkcia `farmdesk-notify` (`functions/farmdesk-notify/index.ts`) beží každú minútu cez `pg_cron`. Vodu, zber a termíny počíta rovnako ako appka, pridá udalosti z fronty (triggery na záznamoch a hráčoch) a o každej veci pošle správu len raz. VAPID kľúče si funkcia vygenerovala sama a spolu s tajomstvom pre cron sú v tabuľke `notify_config`, ktorú vidí iba server. Na iPhone fungujú len v appke pridanej na plochu (iOS 16.4+).
- **Ochrana pred prepisom:** každý zápis nesie verziu záznamu, ktorú prehliadač naposledy videl (`farmdesk_upsert`). Ak ten istý záznam medzitým uložil iný hráč, server zmenu odmietne, appka načíta jeho verziu a povie, kto ju zmenil.
- **História zmien** (`record_history`): trigger zapisuje každé pridanie, zmenu aj odstránenie záznamu s autorom a starými/novými údajmi. Uchováva sa 120 dní. Zobrazuje sa v *Nastavenia → História zmien* a na stránke farmy.
- **Úroda:** pri Zbere sa dá zadať počet kusov. *Ekonomika → Úroda · čo sa najviac oplatí* ukazuje pre každú plodinu a veľkosť farmy počet cyklov, priemerné kusy, náklad na cyklus (osivo + mzdy + pomer nájmu), priemernú tržbu a zisk za hodinu. Cena za kus sa nesleduje, lebo v hre sa cena zjednáva.
- **Rozpis polievania** (stránka Polievanie): kedy ktorá zasadená farma klesne pod 25 % a na 0 % v najbližších 12/24/48 h. Tlačidlo *Beriem ja* uloží `waterClaim` na farmu; platí, kým sa farma nepoleje, najviac 6 h. Ostatným príde notifikácia (kategória polievanie).
- **Odstránenie farmy** (iba leader) zmaže farmu aj jej pohyby, práce a prebiehajúce práce. Uzavreté vyúčtovania sa ukazujú na stránke farmy ako *Staršie vyúčtovania*.
- **Dohoda o podieloch** (`farm.shareDeal`): pri vyúčtovaní sa z tržby najprv vrátia náklady (voliteľne aj hodnota vlastnej práce) tomu, kto ich zaplatil, zvyšok sa delí podľa dohodnutých percent. **Prevod medzi hráčmi** (`farm.buyIns`): peniaze, ktoré hráč poslal inému za časť farmy, presunú investíciu od príjemcu k odosielateľovi.
- Zvuk a odoslané pripomienky pri otvorenej appke sú osobné nastavenia prehliadača.
- FarmDesk sa dá **nainštalovať ako appka** (PWA): na Androide v Chrome cez *Inštalovať aplikáciu*, na iPhone v Safari cez *Zdieľať → Pridať na plochu*. `sw.js` načítava súbory vždy najprv zo siete a uloženú kópiu použije, len keď spojenie chýba. K databáze nesiaha.
- Farmy rozrobené pred appkou: pri **Pridať farmu** sa zadá *Začiatok nájmu* v minulosti a pri **Zapísať prácu** sa dá rozbaliť *Práca bola spravená skôr?* s časom v minulosti.

## Súbory

- `index.html`, `app.js`, `art.js`, `style.css`: appka. Bez `config.js` beží v pôvodnom režime s údajmi len v prehliadači.
- `cloud.mjs`: prihlásenie a synchronizácia cez supabase-js; build ho zabalí do `cloud.js`.
- `config.js`: iba Project URL a verejný **publishable** kľúč. Tajné kľúče sem nepatria.
- `database/`: SQL schéma (`schema.sql`, `02-invoker-wrappers.sql`, `03-push-notifications.sql`, `04-history-and-conflicts.sql`), už aplikovaná na projekt FarmDesk.
- `functions/farmdesk-notify/`: zdroj Edge funkcie pre notifikácie (nasadená s `verify_jwt: false`, overuje sa sama).

## Nastavenie v Supabase Dashboarde

Authentication → Sign In / Providers → Email: Email zapnutý, **Confirm email vypnutý**, minimálna dĺžka hesla 8. Bez vypnutého potvrdzovania registrácia zlyhá, lebo na adresu `…@farmdesk.invalid` nemôže prísť potvrdenie.
