# Rozšírenie možností prezentácií v prostredí Jupyter Notebook

## Príprava dokumentou
* Grafická úprava kombinácie odkazu a kódu
* Nastavenie fontu pre kód: Roboto Mono
* <i class="fa-refresh fa"></i>
  * Spustí markdown bunky
  * Spustí %%html bunky
  * Spustí bunky, ktoré sa začínajú z "# Run"
  * Vyčistí výstupy ostatných kódových buniek
* <i class="fa-eraser fa"></i>
  * Vyčistí všetky výstupy buniek
* <i class="fa-share fa"></i>
  * Nastavý typ snímky na "sub-slide" pre bunky, ktoré ho nemajú nastavené

## Prezentácia dokumentu
* <i class="fa-recycle fa"></i>
  * Prepína Cell Toolbar medzi: Slideshow -> Slide transition -> Slide transition speed -> Hide in rise -> Slideshow
* <i class="fa-cog fa"></i>
  * Vloží bunku typu javascript "%%javascript" na nastavenie RISE
  * Údaje v bunke sú z nastavenia v dokumente
* <i class="fa-cogs fa"></i>
  * Vloží bunku typu javascript "%%javascript" na nastavenie RISE
  * Údaje v bunke sú z nastavenia rozšírenia, ktoré sa dá zmeniť v Jupyter Nbextensions Configurator.
* Po návrate z RISE prejde na vybranú bunku namiesto začiatku dokumentu
* Cell Toolbar -> Slide transition: zmení prechod pre konkrétnu bunku
* Cell Toolbar -> Slide transition speed: zmení rýchlosť prechodu pre konkrétnu bunku
* Cell Toolbar -> Hide in rise: schová určitú časť pri prezentácií

## Vkladanie html do dokumentu
* <i class="fa-file fa"></i>
  * Vstup:
    * url k stránke
	* cesta k súboru
	* prázdny alebo "clipboard" pre vstup zo schránky clipboard
  * Definuje konvertor insert_html/convert.py
  * Získa izolačný reťazec xpath pre známe stránky z konfigurácie rozšírenia
  * Vytvorí bunku na spustenie konvertora

## Konvertovanie dokumentu na LaTeX
* Nastavenia v dokumente (Rozšírenie: compare_code)
  * View -> Cell Toolbar -> Compare code
* Skript na konvertovanie (Skript: ipynb_to_latex.py)
  * Python3
  * python ipynb_to_latex.py file.ipynb

## Obrázky v dokumente
* <i class="fa-file-image-o fa"></i>
  * Spustí dialógové okno na spravovanie obrázkov
  * Obrázky uložené v meta-dátach dokumentu v base64

## Inštalácia
Kopírovanie rozšírení do: "Anaconda3\share\jupyter\nbextensions\" alebo "Anaconda3\envs\%enviroment%\share\jupyter\nbextensions\"