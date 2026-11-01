# Pripojenie Supabase

Projekt FarmCrew je vytvorený a `config.js` obsahuje jeho verejnú konfiguráciu. Schéma je nainštalovaná a overená na Supabase. Aktuálny stav prvého účtu a ďalších nastavení je v [deployment.md](deployment.md). Nasledujúci postup slúži aj na opätovné nasadenie do nového projektu.

## Aktivácia

1. Vyberte nový samostatný Supabase projekt pre FarmCrew. Existujúce dáta projektu najprv skontrolujte; `schema.sql` je prvotná transakčná inštalácia, pri opakovanom spustení bezpečne zlyhá bez prepísania dát.
2. Spustite `database/schema.sql` cez pripojenie správcu. Pred ostrou aktiváciou spustite bezpečnostné advisors v Supabase a overte výsledok aj na skutočnom projekte.
3. Spustite aj `database/registration.sql` (alebo zodpovedajúcu verzovanú migráciu). Registrácia vytvorí účet s menom, e-mailom a vlastným heslom. Po potvrdení e-mailu a prvom vstupe do panelu RPC `farmcrew_join` pridelí prvému členovi rolu **leader**, ostatným rolu **employee**. Leader má všetkých osem častí a plné oprávnenia. Ručné zadávanie e-mailu prvého leadera nie je potrebné.
4. V Auth povoľte Email + Password a **potvrdzovanie e-mailov**. Nastavte Site URL a povolené Redirect URLs na `https://c0cain3.github.io/FarmaSEERPG/`. Nepoužívajte široké wildcard adresy. Nastavte minimálnu dĺžku hesla aspoň 12 znakov a primerané limity pokusov.
5. Pre doručovanie potvrdení a obnovy hesiel členom mimo tímu vlastníka Supabase nastavte vlastné SMTP. Predvolený SMTP je obmedzený; overte aktuálne limity a doručenie dvom testovacím účtom. Aplikácia nevypína overenie e-mailu ako obchádzku doručovania.
6. Do `config.js` vložte iba HTTPS Project URL a **publishable** kľúč `sb_publishable_…`. Je určený pre verejného klienta. Žiadny database password, access token, `service_role` ani `sb_secret_…` nesmie byť v prehliadači alebo Gite.
7. Spustite `npm ci`, `npm test`, `npm run build`. Nasaďte cez GitHub Actions. Prvý člen na stránke vytvorí účet, potvrdí e-mail a prihlási sa ako leader. Ďalší členovia sa registrujú sami; leader im môže meniť rolu alebo zablokovať prístup.
8. Na skutočnom projekte overte anonymný prístup, cudzí účet, zamestnanca, leadera, skutočné doručenie e-mailu a otvorenie rovnakého panelu na dvoch zariadeniach. Až potom označte databázu za aktívnu.

## Oprávnenia a dáta

- Tabuľky sú v neexponovanej schéme `farmcrew_private`, majú zapnuté RLS s explicitnými zamietacími politikami a browser roly k nim nemajú priame práva. Predvolené práva `PUBLIC` na funkcie sú explicitne odobraté.
- Tri verejné `SECURITY INVOKER` RPC obálky volajú úzko vymedzené interné funkcie. Tie potrebujú `SECURITY DEFINER` na čítanie chránených tabuliek, majú prázdny `search_path`, plne kvalifikované názvy a pri každom volaní overujú `auth.uid()`, potvrdený e-mail a aktívne členstvo. Oprávnenia sa nečítajú z používateľom upraviteľných metadát.
- Zamestnanec predvolene dostane sanitizovaný kalendár, vlastné odmeny a vlastné výplaty. Zákaznícke mená, poznámky, cena a cudzie percentá sa mu vôbec neposielajú. Percento pri vlastnej odmene je v tomto pohľade skryté, aby z neho nebolo možné dopočítať cenu zákazky.
- Povolenie Prehľad, Zákazky, Kalkulačka alebo Štatistiky sprístupní obchodné údaje. Povolenie Zákazky umožní aj ich úpravy a stopky. Členov, roly, cenník a výplaty vždy mení iba leader.
- Zablokovanie člena sa overí pri každom ďalšom RPC aj s dosiaľ platným JWT. Už zobrazené údaje nemožno spätne vziať zo zariadenia; otvorený panel sa obnovuje každých 20 sekúnd.
- Zápisy sa serializujú zámkom pracovného priestoru a kontrolujú revíziu. Stará karta nedokáže potichu prepísať novšiu zmenu. Jeden request ID sa aplikuje najviac raz. Po nejasnom výsledku siete aplikácia vyžaduje obnovenie a kontrolu uloženého stavu, automaticky nevytvára druhú výplatu.
- Začatie a dokončenie práce používajú databázový čas. Klient nemôže dopísať vlastné dokončenie cez úpravu zákazky. Výplata nad nárok a zníženie už vyplateného zárobku zlyhajú s rollbackom celej operácie.
- RPC `farmcrew_join` vyžaduje overený e-mail z `auth.users` a rozhoduje o role pod zámkom pracovného priestoru. Meno z metadát slúži iba na zobrazenie; rola sa z metadát nikdy nepreberá. Jednorazový príznak `registration_bootstrapped` zabráni opätovnému prideľovaniu leadera aj po odstránení všetkých členov. Existujúce roly, pozvánky a blokovanie sa zachovajú.
- Server uchováva audit akcií s identitou, časom a revíziou. Žiadne heslá ani tokeny sa do auditu neukladajú.
- Schéma je určená pre jednu malú partiu. Používa jeden zámok na zápisy; pri zásadnom raste treba stránkovanie a jemnejšie zamykanie.

## Pôvodné lokálne údaje

Aktivácia nemení kľúč `farmcrew_data_v1`. Leader si v Nastaveniach stiahne pôvodnú lokálnu zálohu. Automatický import neprebieha: ukážkové osoby a zákazky sa nemajú považovať za skutočné účty ani výplaty. Import reálnych starších dát treba pripraviť samostatne s mapovaním členov na overené účty.

## Overenie

`npm test` spúšťa existujúce stopky, PostgreSQL testy cez PGlite, samoregistráciu, test klienta a zlyhaní rozhrania. Samostatný GitHub Actions job navyše skúša dve súbežné registrácie cez dve skutočné PostgreSQL spojenia. Testy databázy používajú skutočný PostgreSQL engine s minimálnym testovacím `auth.users`; nenahrádzajú kontrolu nastavení hostovaného Supabase Auth, PostgREST, SMTP alebo advisors. Všetky závislosti sú pripnuté a uložené v `package-lock.json`.

Oficiálne zdroje: [API keys](https://supabase.com/docs/guides/api/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Database functions](https://supabase.com/docs/guides/database/functions), [Password auth](https://supabase.com/docs/guides/auth/passwords), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
