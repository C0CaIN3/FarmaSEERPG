# FarmCrew: stav pripojenia

- Organizácia: C0CaIN3's Org.
- Projekt: FarmCrew, `yonjpqthjjnkfuicrcpi`, región `eu-central-1` (Frankfurt).
- API: `https://yonjpqthjjnkfuicrcpi.supabase.co`.
- Konfigurácia klienta: `config.js`, iba verejný publishable kľúč.
- Migrácie na projekte: `20261101205644 farmcrew_initial_database`, `20261101205808 farmcrew_explicit_private_policies`, `20261101211647 first_member_registration`.
- Po kontrole: 0 zákaziek, 0 výplat, 0 členov, 0 auditných udalostí.

## Overené na hostovanom projekte

- Email + Password je zapnutý a potvrdenie e-mailu je vyžadované.
- Anonymné REST volanie `farmcrew_snapshot` vracia HTTP 401 / 42501.
- Priamy prístup browser roly k súkromným tabuľkám je odobratý. RLS a explicitné zamietacie politiky sú zapnuté na všetkých piatich tabuľkách.
- Bezpečnostné advisors: bez nálezov po nastavení explicitných politík.
- Serverový smoke test prešiel: členstvo, vytvorenie zákazky, spustenie a dokončenie stopiek, odmena, výplata, sanitizovaný pohľad zamestnanca a odmietnutie pokusu zamestnanca pridať leadera.
- Test bežal v subtransakcii, ktorá sa celá vrátila späť. Nezanechal testovacie účty ani obchodné dáta. Opakovateľný test je v `tests/supabase-smoke.sql`.
- Lokálne automatické testy a zostavenie prešli.
- Test dvoch súbežných registrácií na PostgreSQL v GitHub Actions prešiel: presne jeden leader a jeden zamestnanec.
- Verzia migrácie v repozitári zodpovedá verzii aplikovanej na Supabase. Súbor bol vytvorený CLI (`supabase migration new`) a jeho verzia zosúladená s históriou MCP.
- Na hostovanom Supabase prešiel rollback test prvej registrácie, plných práv leadera, opakovaného vstupu a následnej zamestnaneckej roly. Po vrátení transakcie zostalo 0 členov, 0 účtov a `registration_bootstrapped=false`, takže prvé miesto leadera je voľné.

Výkonnostný advisor eviduje dva [zatiaľ nepoužité indexy](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index). Pri novej prázdnej databáze je to očakávané; indexy zostávajú pre budúce vyhľadávanie pracovníkov a výplat.

## Prvé prihlásenie

Registrácia je otvorená. Prvý overený člen, ktorý vstúpi do panelu, automaticky získa plné práva leadera. Ďalší sa pridajú ako zamestnanci. E-mail prvého leadera sa nemusí ručne zapisovať ani ukladať do repozitára. Pridelenie prebieha pod databázovým zámkom a jednorazový príznak zabraňuje opätovnému otvoreniu registrácie leadera.

Pred prvým prihlásením treba v Supabase Auth overiť návratové adresy na `https://c0cain3.github.io/FarmaSEERPG/` a doručovanie potvrdení. Doplnok neponúka úpravu Auth URL configuration; táto časť sa dokončuje v Supabase Dashboarde. Pre celú partiu je potrebné overiť SMTP a jeho limity podľa [postupu nasadenia](README.md).

Skutočné prihlásenie vlastníka, doručenie e-mailu a dve zariadenia zatiaľ nie sú overené. Databázové smoke testy túto kontrolu nenahrádzajú.
