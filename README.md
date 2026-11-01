# FarmCrew · SeeRPG

Farmársky panel v slovenčine. [Verejný web](https://c0cain3.github.io/FarmaSEERPG/) beží na GitHub Pages.

## Stav databázy

Panel je pripojený k samostatnému Supabase projektu **FarmCrew** (`yonjpqthjjnkfuicrcpi`, Frankfurt). Databáza je nainštalovaná, bez ukážkových zákaziek a výplat. Registrácia aj prihlásenie sú iba cez **meno a priezvisko a heslo**, bez e-mailu. Prvý člen, ktorý sa zaregistruje, automaticky získa plné práva leadera. Ďalšie účty čakajú na schválenie leaderom a potom sa pridajú ako zamestnanci s kalendárom a vlastnými odmenami. Zabudnuté heslo nastaví členovi leader v časti Tím.

Aktuálne overenia a nastavenie prihlásenia sú v [database/deployment.md](database/deployment.md).

Presný postup aktivácie, schéma a bezpečnostný model sú v [database/README.md](database/README.md). Do verejného repozitára patrí iba Project URL a publishable kľúč. Heslá, tajné kľúče, osobné zálohy a e-mail vlastníka sem nepatria.

## Funkcie

- Zákazky s menom zákazníka, farmou 1–7, voľným poschodím, 40/80/120 políčkami a viacerými úkonmi: Okopávanie, Rylovanie, Polievanie, Sadenie.
- Kalendár s termínmi každých 20 minút a kontrolou kolízií pracovníkov.
- Automatické stopky Začať → Dokončiť. Skutočné trvanie sa zadávať vopred nemusí; nepovinný odhad slúži na rezerváciu termínu.
- Nacenenie z histórie podľa úkonov, políčok, počtu pracovníkov, času a predchádzajúcej ceny. Výsledok je orientačný.
- Individuálny podiel každého pracovníka z celej ceny, spolu najviac 100 %. Odmena vzniká po dokončení práce.
- Evidencia výplat v hernej mene, kontrola nároku a ochrana už vyplatených odmien. Aplikácia sama peniaze neposiela.
- V spoločnom režime: vlastné účty na meno a heslo, schvaľovanie nových členov, nastavenie hesla leaderom, roly, blokovanie členov, sanitizovaný kalendár a vlastné odmeny zamestnanca; leader spravuje obchodné údaje a výplaty.
- Aktualizácia spoločného panelu každých 20 sekúnd, ochrana súbežných zmien a serverový čas stopiek.
- CSV export a JSON zálohy; zachovanie pôvodnej lokálnej zálohy.
- Tmavý Discord štýl so zelenými akcentmi, svetlý režim, mobilné rozhranie a ovládanie klávesnicou.

## Vývoj a nasadenie

Node.js 24, npm, pripnuté balíky v `package-lock.json`:

```sh
npm ci
npm test
npm run build
```

Výstup je `_site/`. Build vloží Supabase klienta do lokálneho JavaScript bundle; netreba CDN. GitHub Actions spúšťa kontroly a publikuje pri zmene `main`. V Settings → Pages musí byť Source nastavený na GitHub Actions.

Testy overujú pôvodné stopky, PostgreSQL schému cez PGlite, prístupy a úniky údajov, odmeny, výplaty, revízie, idempotenciu, klienta a zlyhania formulárov. Nastavenia hostovaného Supabase projektu, SMTP a skutočné prihlásenie dvoch účtov treba overiť pri aktivácii projektu.

`FarmCrew.html` zostáva samostatné offline demo bez spoločnej databázy. Je generovaný z aktuálnych zdrojov pri builde. Jeho prepínanie profilov nemá slúžiť ako skutočné prihlasovanie.

## Ukladanie

Lokálne demo používa `farmcrew_data_v1`; staršie dáta sa zachovávajú a migrujú pri načítaní. Spoločný režim tento kľúč neprepisuje a zákazky drží v databáze. Prepínanie demo profilov je v spoločnom režime vypnuté. Prístup kontroluje každá databázová operácia.
