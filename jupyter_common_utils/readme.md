Code URL
========

This extension adds special hyperlink to markdown that looks like a piece of code.

Usage
-----

&lt;a class="code" target="_blank" href="http://www.example.com/reference" &gt;example&lt;/a&gt;

or

{c{example}http://www.example.com/reference }

**That space before the last } is important.**
Ipython automatically converts basic hyperlinks. If said space is missing, last } will become part of hypelink.

There is also internal variant made to jump within notebook.

{c**i**{example}notebook.ipynb#anchor }

or

{c**i**{example}http://localhost:8888/notebooks/notebook.ipynb#anchor }