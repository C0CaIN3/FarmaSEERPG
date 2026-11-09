# Merania rastu a vody (SeeRPG)

Pásiky v hre majú pri plnom stave šírku **246 px** (pásik „Állapot“ je plný). Percento = počet farebných pixelov / 246.
Čas sa meria od zasadenia a prvého poliatia, ktoré boli spravené naraz.

## Vodný melón (Görögdinnye)

| Čas | Vlhkosť (Nedvesség) | Rast (Növekedés) | Poznámka | Fotka |
|---|---|---|---|---|
| 18 h 24 min | 119 px = 48,4 % | 103 px = 41,9 % | bez ďalšieho poliatia | `gorogdinnye-18h24m.png` |
| 23 h 39 min | 212 px = 86,2 % | 129 px = 52,4 % | **vyradené**, niekto medzitým polial | – |

Používa sa v appke: rast lineárne ~44 h do zberu, vyschnutie z plného poliatia ~35 h 40 min.

## Tekvica (Sütőtök)

| Čas | Vlhkosť (Nedvesség) | Rast (Növekedés) | Poznámka | Fotka |
|---|---|---|---|---|
| 0 h 44 min | 242 px = 98,4 % | 2 px = 0,8 % | prvé meranie, 9. 11. 2026 v noci | `sutotok-0h44m.png` |
| 16 h 58 min | 128 px = 52,0 % | 94 px = 38,2 % | bez ďalšieho poliatia, 9. 11. 2026 | `sutotok-16h58m.png` |
| 19 h 40 min | 108 px = 43,9 % | 109 px = 44,3 % | bez ďalšieho poliatia, 9. 11. 2026 | `sutotok-19h40m.png` |

Všetky tri merania ležia na priamke od zasadenia (rast aj vysychanie sú rovnomerné). Preložením priamky cez tri body:
- rast 5,54 px/h → 100 % asi za **44 h** (44 h 25 min);
- vysychanie 6,99 px/h → zo 100 % na nulu asi za **35 h 12 min**. Pod 25 % klesne asi 26 h 24 min po poliatí.

Používa sa v appke aj v notifikáciách od 9. 11. 2026.


## Nastavené v appke (9. 11. 2026)

Vodný melón aj tekvica: **zber 44 h** po zasadení, **voda zo 100 % na nulu za 35 h 12 min** (pod 25 % po 26 h 24 min). Voda ubúda presne 1,25× rýchlejšie, než rastie úroda, čo vyzerá ako nastavenie skriptu. Melónová fotka sedí na tieto časy do 2 px. Časy sú pevne v `app.js` (`CROP_TIMES`) a v notifikačnej funkcii.
