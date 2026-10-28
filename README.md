# Dezi v2

A cica a képernyő alján sétál balról jobbra és vissza, közben ugrál. Külön panel, fül és bezárógomb nélkül jelenik meg, ugyanúgy, mint az első Dezi.

Helyi CSS-kiegészítést használ, mert ezt a VS Code API nem támogatja. A workbench.desktop.main.css eredetijéről .deziv2-backup másolat készül.
A módszer a VS Code belső működésére támaszkodik, ezért frissítések után a módosítás újbóli alkalmazására lehet szükség. A VS Code a módosított telepítés miatt figyelmeztetést jeleníthet meg.

A cica megjelenítése:

-Telepítsd a bővítményt.

-Nyisd meg a parancspalettát a Ctrl + Shift + P billentyűkombinációval.

-Futtasd a **Dezi v2: Cica megjelenítése** parancsot.

-Zárd be az összes VS Code-ablakot, majd indítsd újra az alkalmazást.

Eltávolítás:

-**Dezi v2: Cica eltávolítása**, majd teljes VS Code-újraindítás.
 Ezt a bővítmény eltávolítása előtt futtasd; a bővítmény letiltása nem távolítja el a CSS-t. A parancs csak a jelölt Dezi v2-blokkot veszi ki.

Az első Dezi mellett is működik; ha csak a sétáló cicát szeretnéd, az első Dezinél futtasd a **Dezi: Cica eltávolítása** parancsot.

Fejlesztés:

 `npm test`, `npm run package`. Csomag: `dist/deziv2-0.2.0.vsix`.
