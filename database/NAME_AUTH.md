# Prihlásenie menom a heslom

Registrácia a prihlásenie majú iba meno, priezvisko a heslo. Nezadáva sa kontaktný e-mail a neposielajú sa potvrdzovacie správy. Po registrácii je účet ihneď prihlásený. Prvá dokončená registrácia získa leadera so všetkými ôsmimi oprávneniami; ďalšie účty zamestnanca.

Rovnaké meno a priezvisko možno použiť iba raz. Veľkosť písmen a nadbytočné medzery nemenia prihlasovaciu identitu. Prihlasovacie meno zostáva nemenné; leader upravuje rolu a blokovanie.

## Implementácia

`supabase/functions/name-auth` je serverová brána pre registráciu a prihlásenie. Vyžaduje verejný API kľúč projektu, kontroluje pôvod browser požiadavky, veľkosť vstupu a databázové limity pokusov. Novú identitu vytvorí cez serverové Supabase Auth Admin API bez odoslania e-mailu. Supabase Auth naďalej hashuje heslá a vydáva štandardné prístupové a obnovovacie tokeny. Heslá ani tokeny sa nezapisujú do vlastných tabuliek alebo logov.

Supabase používa interný technický identifikátor odvodený z mena, nie kontaktnú adresu používateľa. Jeho doména `.invalid` nie je doručovateľná. Označenie interného účtu v `app_metadata` vytvára iba server, používateľ si nemôže týmto spôsobom nastaviť rolu.

Privilegovaný kľúč zostáva v automatickom serverovom prostredí funkcie. V zdrojovom kóde a `public-config.json` je iba verejný publishable kľúč. Funkcia má `verify_jwt=false`, pretože prihlasujúci sa používateľ ešte nemá JWT; požiadavku overuje vlastný kód pomocou API kľúča a heslo následne overuje Supabase Auth. Databázové funkcie na vytvorenie členstva a limity pokusov sú volateľné iba rolou `service_role`, nie návštevníkom ani prihláseným zamestnancom.

`database/name-auth.sql` sa aplikuje po `schema.sql` a `registration.sql`. Uzavrie pôvodnú samoregistráciu cez `farmcrew_join`, pridá súkromnú mapu mien a limity pokusov, zachová existujúce roly a kontroluje prvého leadera pod zámkom pracovného priestoru. Bežné čítanie a zápisy používajú existujúce RPC a platnú Supabase reláciu.

Ak klient stratí odpoveď pri registrácii, opakovaný pokus musí preukázať rovnaké heslo. Heslo existujúceho účtu sa nikdy neprepíše. Dokončenie členstva je idempotentné. Zablokovaný účet sa opakovaným prihlásením neaktivuje.

Starší nepotvrdený pokus o e-mailovú registráciu bez členstva sa nemení ani nemaže. Nový účet s menom a priezviskom sa vytvorí cez nový formulár; nepotrebuje overenie predchádzajúcej adresy.

## Nasadenie a kontroly

1. Aplikovať databázovú migráciu a spustiť advisors.
2. Nasadiť Edge Function `name-auth` s pribalenými súbormi a `verify_jwt=false`.
3. Použiť Node.js 24: `npm test`, `npm run build`.
4. Overiť súbežné registrácie na PostgreSQL v GitHub Actions.
5. Na prázdnom členstve možno spustiť rollback test `tests/supabase-name-auth-smoke.sql`.
6. Overiť registráciu, chybné heslo, duplicitné meno a obnovenie relácie proti nasadenej bráne. Testovacie identity odstrániť podľa ich presných ID, reálne účty zachovať.

SMTP, potvrdzovacie šablóny ani návratové URL nie sú súčasťou tohto prihlasovania.
