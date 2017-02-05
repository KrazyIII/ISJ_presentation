//

/*
https://ipython.org/ipython-doc/3/interactive/magics.html#cell-magics
%%python
    %%python script magic
    Run cells with python in a subprocess.
    This is a shortcut for %%script python

%%python2
    %%python2 script magic
    Run cells with python2 in a subprocess.
    This is a shortcut for %%script python2

%%python3
    %%python3 script magic
    Run cells with python3 in a subprocess.
    This is a shortcut for %%script python3
*/

define([
    'base/js/namespace',
    'jquery',
    'require',
    'notebook/js/cell',
    'base/js/security',
    'components/marked/lib/marked',
    'base/js/events',
    'notebook/js/textcell'
], function(IPython, $, require, cell, security, marked, events, textcell) {
	
	
	
	var load_ipython_extension = function() {
		
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'convert_web_pages',
				label : 'Convert web pages to ipython',
				icon : 'fa-recycle',
				callback : function(){
					var conv_url = prompt("Enter URL of page", "URL");
					if (conv_url != null) {
						var txt = '';
						
						txt+= 'url = "' + conv_url + '"\n'+
'xpath = \'//div[@id="question-header"] | //div[@class="post-text"]/* | //span[@class="comment-copy"]\'\n'+
'\n'+
'import urllib.request\n'+
'import lxml.html\n'+
'import re\n'+
'from IPython.display import display_javascript\n'+
'"""Getting the dokument"""\n'+
'page_text = urllib.request.urlopen(url).read()\n'+
'html = lxml.html.fromstring(page_text)\n'+
'\n'+
'"""Looking thru the page"""\n'+
'for tag in html.xpath(xpath):\n'+
'	def relative_to_absolute_ref(href):\n'+
'		global url\n'+
'\n'+
'		if re.match("(http)|(https)://", href):\n'+
'			return href\n'+
'		elif href.startswith("#"):\n'+
'			return re.sub("(.*)#.*","\\\\1",url) + href\n'+
'		elif href.startswith("/"):\n'+
'			return re.sub("(.*://.*?)/.*","\\\\1",url) + href\n'+
'		else:\n'+
'			if href.startswith("./"):\n'+
'				href = href[2:]\n'+
'			return re.sub("(.*/).*","\\\\1",url) + href\n'+
'\n'+
'	cell_type = "markdown"\n'+
'	source = ""\n'+
'	listOrders=[]\n'+
'	table_head = False\n'+
'\n'+
'	"""Iterative working of tags"""\n'+
'	def work_tag(elem, order=0, printing="markdown"):\n'+
'		global cell_type\n'+
'		global source\n'+
'		global listOrders\n'+
'		global table_head\n'+
'		"""Print tail after the rest"""\n'+
'		tail = True\n'+
'		"""Pop list, used for lists in lists"""\n'+
'		remList = False\n'+
'		"""After the body"""\n'+
'		endBody = ""\n'+
'\n'+
'		"""If text is null notebook can\'t run"""\n'+
'		if elem.text == None:\n'+
'			text = ""\n'+
'		else:\n'+
'			if elem.tag == "code" or printing == "code":\n'+
'				text = elem.text\n'+
'			elif printing == "markdown":\n'+
'				text = elem.text.replace("_",r"\\_").replace("*",r"\\*")\n'+
'				text = re.sub("[ \\t]+"," ",text)\n'+
'			elif printing == "table":\n'+
'				text = elem.text.replace("_",r"\\_").replace("*",r"\\*")\n'+
'				text = text.replace("\\n"," ")\n'+
'\n'+
'		if elem.tag == "p" or elem.tag == "q" or elem.tag == "small" or elem.tag == "mark" or elem.tag == "del" or elem.tag == "ins" or elem.tag == "sub" or elem.tag == "sup":\n'+
'			source+= text\n'+
'		elif elem.tag == "pre":\n'+
'			"""Code"""\n'+
'			cell_type = "code"\n'+
'			printing = "code"\n'+
'			source+= text\n'+
'		elif elem.tag == "span":\n'+
'			source+= text\n'+
'		elif elem.tag == "div":\n'+
'			source+= text\n'+
'		elif elem.tag == "a":\n'+
'			href = relative_to_absolute_ref(elem.get("href"))\n'+
'\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "["+text\n'+
'				endBody = "]("+ href.replace("(","").replace(")","") +")"\n'+
'		elif elem.tag == "code":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= " `"+text\n'+
'				endBody = "` "\n'+
'			printing = "code"\n'+
'		elif elem.tag == "strong" or elem.tag == "b" or elem.tag == "big":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "**"+text\n'+
'				endBody = "**"\n'+
'		elif elem.tag == "em" or elem.tag == "i":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "*"+text\n'+
'				endBody = "*"\n'+
'		elif elem.tag == "h1":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "# "+text\n'+
'				endBody = "\\n"\n'+
'		elif elem.tag == "h2":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "## "+text\n'+
'				endBody = "\\n"\n'+
'		elif elem.tag == "h3":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "### "+text\n'+
'				endBody = "\\n"\n'+
'		elif elem.tag == "h4":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "#### "+text\n'+
'				endBody = "\\n"\n'+
'		elif elem.tag == "h5":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "##### "+text\n'+
'				endBody = "\\n"\n'+
'		elif elem.tag == "h6":\n'+
'			if printing == "code":\n'+
'				source+= text\n'+
'			else:\n'+
'				source+= "###### "+text\n'+
'				endBody = "\\n"\n'+
'		elif elem.tag == "ul":\n'+
'			source+= "\\n"\n'+
'			listOrders.append("unordered")\n'+
'			remList = True\n'+
'			printing = "table"\n'+
'		elif elem.tag == "ol":\n'+
'			source+= "\\n"\n'+
'			listOrders.append("ordered")\n'+
'			remList = True\n'+
'			printing = "table"\n'+
'		elif elem.tag == "li":\n'+
'			for num in listOrders[1:]:\n'+
'				source+= "  "\n'+
'			if listOrders[-1] == "unordered":\n'+
'				source+= "* "\n'+
'			if listOrders[-1] == "ordered":\n'+
'				source+= str(order)+". "\n'+
'			source+= text\n'+
'			endBody = "\\n"\n'+
'			printing = "table"\n'+
'			tail = False\n'+
'		elif elem.tag == "dd":\n'+
'			source+= "  "+text\n'+
'			endBody = "\\n"\n'+
'			printing = "table"\n'+
'			tail = False\n'+
'		elif elem.tag == "dt":\n'+
'			source+= text\n'+
'			endBody = "\\n"\n'+
'			printing = "table"\n'+
'			tail = False\n'+
'		elif elem.tag == "dl":\n'+
'			source+= "\\n"\n'+
'			printing = "table"\n'+
'		elif elem.tag == "table":\n'+
'			source+= "\\n\\n"\n'+
'			table_head = True\n'+
'			printing = "table"\n'+
'		elif elem.tag == "tr":\n'+
'			endBody = "|\\n"\n'+
'			tail = False\n'+
'			if table_head:\n'+
'				table_head = False\n'+
'				for i in list(elem):\n'+
'					for j in range(0, int(i.get("colspan", 1))):\n'+
'						endBody+= "| --- "\n'+
'				endBody+= "|\\n"\n'+
'		elif elem.tag == "td":\n'+
'			source+= "| " + text\n'+
'			endBody = " "\n'+
'			for i in range(1 , int(elem.get("colspan", 1))):\n'+
'				endBody+= "|"\n'+
'			endBody+= " "\n'+
'			tail = False\n'+
'		elif elem.tag == "th":\n'+
'			source+= "| **" + text\n'+
'			endBody = "** "\n'+
'			for i in range(1 , int(elem.get("colspan", 1))):\n'+
'				endBody+= "|"\n'+
'			endBody+= " "\n'+
'			tail = False\n'+
'		elif elem.tag == "caption":\n'+
'			source+= text\n'+
'			endBody = "\\n"\n'+
'			tail = False\n'+
'		elif elem.tag == "title":\n'+
'			source+= "# "+text\n'+
'			tail = False\n'+
'		else:\n'+
'			tail = False\n'+
'\n'+
'		"""Work childs"""\n'+
'		for index, child in enumerate(list(elem), start=1):\n'+
'			work_tag(child, index, printing)\n'+
'\n'+
'		"""Write end of body"""\n'+
'		source+= endBody\n'+
'		"""Write tail"""\n'+
'		if elem.tail != None and tail:\n'+
'			if printing == "code":\n'+
'				source+= elem.tail\n'+
'			elif printing == "markdown":\n'+
'				source+= re.sub("[ \\t]+"," ",elem.tail.replace("_",r"\\_").replace("*",r"\\*"))\n'+
'			elif printing == "table":\n'+
'				source+= re.sub("[ \\t]+"," ",elem.tail.replace("_",r"\\_").replace("*",r"\\*"))\n'+
'		if remList:\n'+
'			listOrders.pop()\n'+
'\n'+
'\n'+
'	"""1st call"""\n'+
'	work_tag(tag)\n'+
'\n'+
'	if source:\n'+
'		if cell_type == "markdown":\n'+
'			display_javascript("""\n'+
'var t_cell = IPython.notebook.insert_cell_below();\n'+
't_cell.set_text(\'"""+source.replace("\\\\","\\\\\\\\").replace("\'","\\\\\'").replace("\\n","\\\\n")+"""\');\n'+
'var t_index = IPython.notebook.get_cells().indexOf(t_cell);\n'+
'IPython.notebook.to_markdown(t_index);""", raw=True)\n'+
'		else:\n'+
'			display_javascript("""\n'+
'var t_cell = IPython.notebook.insert_cell_below();\n'+
't_cell.set_text(\'%%code\\\\n"""+source.replace("\\\\","\\\\\\\\").replace("\'","\\\\\'").replace("\\n","\\\\n")+"""\');\n'+
'var t_index = IPython.notebook.get_cells().indexOf(t_cell);\n'+
'IPython.notebook.to_markdown(t_index);""", raw=True)\n'+
'\n'+
'var ncells = IPython.notebook.ncells();\n'+
'var cells = IPython.notebook.get_cells();\n'+
'\n'+
'display_javascript("""\n'+
'for (var i = 0; i < ncells; i++) {\n'+
'	var cell = cells[i];\n'+
'	if (cell.source.startswith("%%code\\\\n")){\n'+
'	var t_index = IPython.notebook.get_cells().indexOf(t_cell);\n'+
'	IPython.notebook.to_code(t_index);\n'+
'	}\n'+
'}"""\n'+
'\n';

						var t_cell = IPython.notebook.insert_cell_below();
						t_cell.set_text(txt);
						var t_index = IPython.notebook.get_cells().indexOf(t_cell);
						IPython.notebook.to_code(t_index);
					}
				}
			}
		]);
    };
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});