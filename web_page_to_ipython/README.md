Convert web page to ipython
===========================

Python skript
Converts [html page](http://www.w3schools.com/html/) to [jupyter](http://jupyter.org/) document.

Name of the [jupyter](http://jupyter.org/) document is taken from the title of the web page.

Config
------

Diffrent pages have different constructions. Where to look is determined in config file `web_page_to_ipython.py.config`.
"stackoverflow.com", "docs.python.org", "wikipedia.org" and "wiki.python.org" are in the config by default.

Config file is in ini format. Contains domains with xpath strings....
[xpath](http://www.w3schools.com/xml/xpath_intro.asp) strings.
Those [xpath](http://www.w3schools.com/xml/xpath_intro.asp) strings decides witch tags of the [html page](http://www.w3schools.com/html/) are looked thru.

Usage
-----

URL: python web_page_to_ipython --url www.url.com/some_page

Local file: python web_page_to_ipython --local file [--encoding enc]
* Config for local file is `local_file` in `web_page_to_ipython.py.config`
* Default encoding is `utf-8`

STDIN: python web_page_to_ipython --stdin