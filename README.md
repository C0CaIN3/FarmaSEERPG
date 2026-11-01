# FarmCrew – farmársky panel pre SeeRPG

## Zverejnenie na GitHub Pages

1. Vytvorte verejný repozitár `FarmaSEERPG` na svojom GitHub účte.
2. Nahrajte tento obsah do hlavnej vetvy `main`, vrátane `.github/workflows/pages.yml`.
3. Otvorte **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. V **Actions → Publish FarmCrew to GitHub Pages** spustite workflow cez **Run workflow**, prípadne urobte nový commit do `main`.
5. Po úspešnom nasadení sa odkaz zobrazí vo workflow a v **Settings → Pages**.

Adresa pre repozitár `C0CaIN3/FarmaSEERPG` bude `https://c0cain3.github.io/FarmaSEERPG/`. Táto adresa je plán nasadenia, nie potvrdenie, že stránka už funguje.

Po každej ďalšej zmene v `main` sa stránka automaticky aktualizuje. Vlastná doména, zostavovanie ani inštalácia balíkov nie sú potrebné.

**Stav tejto verzie:** ide o interaktívnu ukážku s lokálnym ukladaním. Verejný odkaz sprístupní rozhranie; zákazky a výplaty sa medzi zariadeniami nezdieľajú. Demo profily neposkytujú bezpečné prihlasovanie. Pre spoločné ostré používanie treba pripojiť databázu, overovanie identity a oprávnenia na serveri. Exporty údajov ani tajné kľúče nepatria do verejného repozitára.

## Kontroly

S Node.js 20 alebo novším:

```sh
node --check app.js
node tests/timers.cjs
```

Rovnaké kontroly spúšťa workflow pred publikovaním.


Profesionálny interaktívny prototyp v slovenčine s tmavosivým vizuálnym štýlom inšpirovaným Discordom a zelenými akcentmi, svetlou aj tmavou témou, priestorovou grafikou farmy a prepracovaným mobilným rozhraním. Bez zostavovania a bez závislostí: otvorte `FarmCrew.html` v prehliadači. Zdroj aplikácie je rozdelený v `index.html`, `styles.css` a `app.js`.

## Funkcie

- Evidencia zákaziek: meno, priezvisko, farma z výberu 1–7, voľne zadané poschodie, 40/80/120 políčok, viacero prác naraz, termín, čas HH:MM:SS, priradení pracovníci, cena, stav a poznámka.
- Pridanie a úprava zákazky, dokončenie, zrušenie, odstránenie, vyhľadávanie a filtrovanie.
- Kalendár s denným plánom po 20 minútach (00:00–23:40), založením zákazky priamo pri čase a kontrolou kolízií pracovníkov vrátane sekúnd a termínov cez polnoc.
- Kalkulácia ceny podľa podobných dokončených zákaziek rovnakého typu, políčok, počtu pracovníkov a času. Podporuje viacero úkonov (Okopávanie, Rylovanie, Polievanie, Sadenie), minulú cenu, zľavu alebo príplatok a tvorbu zákazky z ponuky. Trvanie sa zadáva v hodinách, minútach a sekundách.
- Transparentný výpočet ceny: historická sadzba za políčko po odpočítaní osobohodín, vážená podobnosťou veľkosti, presného času a tímu. Rovnaké kombinácie úkonov majú prednosť; sadzby iných prekrývajúcich sa kombinácií sa normalizujú podľa váh úkonov. Pri zadaní minulej ceny má nový odhad váhu 70 % a minulá cena 30 %. Rozpätie ±10 % je iba orientačné.
- Demo profily leadera a zamestnancov; nastaviteľná dostupnosť jednotlivých častí rozhrania podľa roly.
- Zamestnanec predvolene vidí kalendár bez zákazníckych údajov a cien, svoj zárobok a históriu svojich výplat.
- Tímové odmeny z dokončených zákaziek. Podiel si každá zákazka uchováva samostatne. Každému pracovníkovi sa nastavuje vlastné percento z celej ceny zákazky (napr. 30 % a 20 %). Súčet musí byť najviac 100 %, zvyšok zostáva firme. Tlačidlo „Rozdeliť rovnomerne“ rozdelí predvolený tímový rozpočet z nastavení.
- Evidencia odoslaných výplat, kontrola preplatku a ochrana pred úpravou zákazky, ktorá by znížila zárobok pod už vyplatenú sumu.
- Štatistiky, CSV export pre tabuľky a kompletná záloha v JSON.
- Vlastný názov partie, server, herná mena, sadzby a podiel pre pracovníkov.
- Responzívny dizajn, mobilná navigácia a ovládanie dialógov klávesnicou.
- Svetlý a tmavý režim s prepínačom vpravo hore aj na prihlasovacej obrazovke. Téma sa zapamätá v prehliadači; pred prvou manuálnou voľbou používa tmavý režim. Prepnutie zachová rozpracované formuláre.

## Demo a používanie

Prvé otvorenie obsahuje ukážkové dáta a aktívny profil leadera Martina Nováka. Kliknutím na profil vľavo dole je možné zmeniť demo profil alebo sa odhlásiť. V nastaveniach možno odstrániť ukážkové zákazky a výplaty.

Dáta sa ukladajú v `localStorage` konkrétneho prehliadača a pôvodu stránky. Lokálny HTML súbor a nasadená stránka majú oddelené úložiská. Export pravidelne zálohujte. Aplikácia sama neodosiela peniaze. JSON slúži na uloženie zálohy; používateľský import zatiaľ nie je implementovaný.

Táto HTML verzia **neobsahuje bezpečné prihlásenie, server ani spoločnú databázu**. Profily a oprávnenia sú funkčnou ukážkou rozhrania a nemožno ich považovať za ochranu dát. Používateľ s prístupom k prehliadaču môže meniť lokálne údaje. Pred viacpoužívateľským ostrým nasadením je potrebné doplniť serverové overenie identity, autorizáciu každej operácie, databázu a audit zmien. Súkromný hosting chráni prístup k samotnej stránke, nenahrádza zamestnanecké účty.

Samostatný HTML súbor obsahuje všetok JavaScript a CSS. Voliteľné webové písma sa načítavajú zo služby Google Fonts; pri ich nedostupnosti sa použijú systémové písma. Aplikácia inak nepotrebuje externé služby.

## Zachovanie starších údajov

Dátová schéma v3 automaticky prevezme uložené údaje v1 a v2. Pôvodné termíny, čísla fariem, počty políčok, popisy práce, ceny, odmeny a výplaty sa zachovajú. Starý rovnomerný podiel sa prevezme na jednotlivých pracovníkov bez zmeny sumy. Pri nedokončených zákazkách sa pôvodne vyplnené trvanie zachová ako odhad pre kalendár; spätne sa nevymyslí čas začiatku. Meranie takej zákazky sa spustí až kliknutím na „Začať zákazku“. Dokončené zákazky si zachovajú svoj skutočný uložený čas aj odmeny. Pri úprave staršieho záznamu s neplatnou novou voľbou je potrebné vybrať farmu 1–7, 40/80/120 políčok, nové úkony a čas po 20 minútach. Staré typy prác sa nevymýšľajú ani automaticky nepreklasifikujú a nevstupujú do nového cenového odhadu.

## Automatické meranie práce

1. Zákazku uložte bez zadávania skutočného trvania. Voliteľný odhad slúži len na rezerváciu času v kalendári; bez odhadu sa rezervuje 20 minút.
2. V detaile kliknite na **Začať zákazku**. Aplikácia uloží čas začiatku a zobrazí živé stopky vo formáte HH:MM:SS v detaile, zozname aj v hornej lište panelu.
3. Kliknite na **Dokončiť**. Uloží sa čas dokončenia a skutočné trvanie. Tento čas sa použije v štatistikách a pri ďalšom cenovom odhade; odmeny sa pripíšu podľa individuálnych percent.

Stopky sa počítajú z uloženého časového záznamu, takže pokračujú aj pri obnovení stránky, prepnutí profilu či zatvorení prehliadača. Čas počas zatvorenia sa započítava až do dokončenia. Úprava zákazky meranie neresetuje, opakovaný klik na začiatok ho nespustí nanovo a dokončenie sa vykoná iba raz. Rovnaký pracovník nemôže mať súčasne dve spustené zákazky. Zrušenie rozpracovanej zákazky meranie zastaví a zachová nameraný čas bez nároku na odmenu. Práce dokončené skôr než za jednu sekundu sa ukladajú ako 1 sekunda.

Táto HTML verzia uchováva údaje v konkrétnom prehliadači. Zachovanie stopiek po zatvorení predpokladá zachované lokálne úložisko a správny čas zariadenia; údaje sa medzi zariadeniami automaticky nezdieľajú.
