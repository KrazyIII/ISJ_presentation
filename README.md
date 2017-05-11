# Rozšírenie možností prezentácií v prostredí Jupyter Notebook

## Príprava dokumentov
Rozšírenie: jupyter_common_utils
* Grafická úprava kombinácie odkazu a kódu
* Nastavenie fontu pre kód: Roboto Mono
* Ikona: [fa-refresh](http://fontawesome.io/icon/refresh/)
  * Spustí markdown bunky
  * Spustí %%html bunky
  * Spustí bunky, ktoré sa začínajú z "# Run"
  * Vyčistí výstupy ostatných kódových buniek
* Ikona: [fa-eraser](http://fontawesome.io/icon/eraser/)
  * Vyčistí všetky výstupy buniek
* Ikona: [fa-share](http://fontawesome.io/icon/share/)
  * Dialógové okno s výberom typu snímky.
  * Typ snímky sa nastaví pre bunky, ktoré ho nemajú nastavené
* Ikona: [fa-copy](http://fontawesome.io/icon/copy/)
  * Označí všetky bunky

## Prezentácia dokumentu
Rozšírenie: rise_config
* Ikona: [fa-recycle](http://fontawesome.io/icon/recycle/)
  * Prepína Cell Toolbar medzi: Slideshow -> Slide transition -> Slide transition speed -> Hide in rise -> Slideshow
* Ikona: [fa-cog](http://fontawesome.io/icon/cog/)
  * Vloží bunku typu javascript "%%javascript" na nastavenie RISE
  * Údaje v bunke sú z nastavenia v dokumente
* Ikona: [fa-cogs](http://fontawesome.io/icon/cogs/)
  * Vloží bunku typu javascript "%%javascript" na nastavenie RISE
  * Údaje v bunke sú z nastavenia rozšírenia, ktoré sa dá zmeniť v Jupyter Nbextensions Configurator.
* Po návrate z RISE prejde na vybranú bunku namiesto začiatku dokumentu
* Cell Toolbar -> Slide transition: zmení prechod pre konkrétnu bunku
* Cell Toolbar -> Slide transition speed: zmení rýchlosť prechodu pre konkrétnu bunku
* Cell Toolbar -> Hide in rise: schová určitú časť pri prezentácií

## Vkladanie html a obrázkov do dokumentu
Rozšírenie: insert_html_img
* Ikona: [fa-file](http://fontawesome.io/icon/file/)
  * Vstup:
    * url k stránke
	* cesta k súboru
	* prázdny alebo "clipboard" pre vstup zo schránky clipboard
  * Definuje konvertor insert_html_img/convert.py
  * Získa izolačný reťazec xpath pre známe stránky z konfigurácie rozšírenia
  * Vytvorí bunku na spustenie konvertora
* Ikona: [fa-file-image-o](http://fontawesome.io/icon/file-image-o/)
  * Spustí dialógové okno na spravovanie obrázkov
  * Obrázky uložené v meta-dátach dokumentu v base64

## Konvertovanie dokumentu na LaTeX
* Nastavenia v dokumente (Rozšírenie: compare_code)
  * View -> Cell Toolbar -> Compare code
* Skript na konvertovanie (Skript: ipynb_to_latex.py)
  * Python3
  * python ipynb_to_latex.py file.ipynb

## Inštalácia
Kopírovanie rozšírení do: "Anaconda3\share\jupyter\nbextensions\" alebo "Anaconda3\envs\%enviroment%\share\jupyter\nbextensions\"