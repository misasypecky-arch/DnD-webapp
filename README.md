# DnD Tavern 

DnD Tavern je odlehčená webová aplikace pro hráče stolních RPG her. Nabízí tvorbu a správu hrdinů (deník postavy) a virtuální herní místnosti s živým chatem a integrovanými hody kostkou (d20).

##  Požadavky k běhu aplikace
Klokálnímu spuštění serveru je potřeba mít nainstalované prostředí **Node.js**. 

### Jak nainstalovat Node.js:
**A) Klasicky (Nejjednodušší způsob pro Windows/macOS):**
1. Jděte na oficiální stránky [nodejs.org](https://nodejs.org/).
2. Stáhněte si verzi označenou jako **LTS** (Long Term Support).
3. Spusťte stažený instalátor a proklikejte se jím (můžete nechat vše ve výchozím nastavení).

**B) Přes konzoli (Pro pokročilejší uživatele):**
* **Windows (pomocí Winget):** Otevřete Příkazový řádek (cmd) jako správce a napište: `winget install OpenJS.NodeJS.LTS`
* **macOS (pomocí Homebrew):** Otevřete Terminál a napište: `brew install node`
* **Linux (Ubuntu/Debian):** V terminálu spusťte: `sudo apt update && sudo apt install nodejs npm`

---

##  Jak aplikaci stáhnout a spustit

1. **Stažení repozitáře:**
   Stáhněte si tento repozitář jako .zip soubor a rozbalte ho, nebo použijte Git příkaz v konzoli:
   `git clone [VLOŽ_SVŮJ_ODKAZ_NA_GIT]`

2. **Instalace závislostí:**
   Otevřete konzoli (příkazový řádek) ve složce s projektem (tam, kde je soubor `server.js`) a spusťte příkaz:
   `npm install`
   *(Tento příkaz stáhne potřebné knihovny Express a Cors a vytvoří složku node_modules).*

3. **Spuštění serveru:**
   Ve stejné konzoli zadejte příkaz pro zapnutí serveru:
   `node server.js`

4. **Otevření aplikace:**
   Otevřete svůj webový prohlížeč a do adresního řádku zadejte:
   `http://localhost:3000` *(Případně jiný port, pokud je v konzoli vypsán).*
