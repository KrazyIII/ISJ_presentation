Convert web page to ipython
===========================

Python skript
Converts [html page]{http://www.w3schools.com/html/} to [jupyter]{http://jupyter.org/} document.

Creates a new document with name taken from the title of the web page.

...

Config
------

Diffrent pages have different constructions. Where to look is determined in config file "web_page_to_ipython.py.config".
Config file is in json format. Contains domains with list of tags skript adds to the [jupyter]{http://jupyter.org/} document.
"stackoverflow.com" and "docs.python.org" are in the config by default.
Tags that are taken are in xpath format.

...

Usage
-----

python web_page_to_ipython www.url.com/some_page