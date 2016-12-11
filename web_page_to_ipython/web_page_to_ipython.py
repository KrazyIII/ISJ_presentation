import urllib.request
import re
import sys
import lxml.html
import json
from lxml import etree

"""Arguments"""
if len(sys.argv) != 2:
	print("Usage: web_page_to_ipython.py url\n")
	exit()
"""Global variables"""
url = sys.argv[1]
outName = ""

with open("web_page_to_ipython.py.config", "rt", encoding="utf-8") as config_file:    
    config = json.loads(config_file.read())

domain = re.sub('(.*://)([^/]*\\.[^/]*)/.*','\\2',url)
#print(domain)

config_text = ""
if config.get(domain, False):
	for index, part in enumerate(config[domain]):
		if index != 0:
			config_text+= ' | '
		config_text+= part
else:
	print("Domain not in config\n")
	exit()

#print(config_text)

notebook = {}

"""Notebook init"""
notebook["nbformat"] = 4
notebook["nbformat_minor"] = 0

notebook["metadata"] = {}
notebook["metadata"]["anaconda-cloud"] = {}
notebook["metadata"]["celltoolbar"] = "Slideshow"

notebook["metadata"]["kernelspec"] = {}
notebook["metadata"]["kernelspec"]["display_name"] = "Python [Root]"
notebook["metadata"]["kernelspec"]["language"] = "python"
notebook["metadata"]["kernelspec"]["name"] = "Python [Root]"

notebook["metadata"]["language_info"] = {}
notebook["metadata"]["language_info"]["codemirror_mode"] = {}
notebook["metadata"]["language_info"]["codemirror_mode"]["name"] = "ipython"
notebook["metadata"]["language_info"]["codemirror_mode"]["version"] = 3

notebook["metadata"]["language_info"]["file_extension"] = ".py"
notebook["metadata"]["language_info"]["mimetype"] = "text/x-python"
notebook["metadata"]["language_info"]["name"] = "python"
notebook["metadata"]["language_info"]["nbconvert_exporter"] = "python"
notebook["metadata"]["language_info"]["pygments_lexer"] = "ipython3"
notebook["metadata"]["language_info"]["version"] = "3.5.2"

notebook["cells"] = []

"""Getting web page"""
page_text = urllib.request.urlopen(url)
html = lxml.html.fromstring(page_text.read())

"""Header and filename"""

"""Cell init"""
cell = {}
cell["cell_type"] = "markdown"
cell["metadata"] = {}
cell["metadata"]["slideshow"] = {}
cell["metadata"]["slideshow"]["slide_type"] = "slide"
cell["source"] = []
"""Getting the header"""
for title_text in html.xpath("//title/text()"):
	cell["source"].append("# "+title_text)
	outName += title_text
notebook["cells"].append(cell)

#print(html.xpath("//div[@class='post-text']/p/text()"))

"""Getting body of the html"""
for tag in html.xpath(config_text):
	"""Creates a new cell 
	   cellType cell_type if the new cell"""
	def newCell(cellType, source):
		cell = {}
		cell["cell_type"] = cellType
		cell["metadata"] = {}
		cell["metadata"]["slideshow"] = {}
		cell["metadata"]["slideshow"]["slide_type"] = "subslide"
		cell["source"] = source
		if cell["cell_type"] == "code":
			cell["outputs"] = []
			cell["metadata"]["collapsed"] = False
			cell["execution_count"] = None
		return cell
	
	#newCell("markdown")
	type = "markdown"
	source = ""
	listOrders=[]
	
	"""Iterative working of tags"""
	def work_tag(elem, order=0, code=False):
		global type
		global source
		global listOrders
		"""Print tail after the rest"""
		tail = True
		"""Pop list, used for lists in lists"""
		remList = False
		"""After the body"""
		endBody = ""
		
		"""If text is null notebook can't run"""
		if elem.text == None:
			text = ""
		else:
			if elem.tag == "code" or code:
				text = elem.text
			else:
				text = elem.text.replace("_",r"\_").replace("*",r"\*")
		
		if elem.tag == "p" or elem.tag == "small" or elem.tag == "mark" or elem.tag == "del" or elem.tag == "ins" or elem.tag == "sub" or elem.tag == "sup":
			source+= text
		elif elem.tag == "pre":
			"""Code"""
			type = "code"
			code = True
			source+= text
		elif elem.tag == "span":
			source+= text
		elif elem.tag == "div":
			source+= text
		elif elem.tag == "a":
			source+= "["+text
			endBody = "]("+elem.get("href")+")"
		elif elem.tag == "code":
			code = True
			if cell["cell_type"] == "markdown":
				source+= " `"+text
				endBody = "` "
			else:
				source+= text
		elif elem.tag == "strong" or elem.tag == "b":
			source+= "**"+text
			endBody = "**"
		elif elem.tag == "em" or elem.tag == "i":
			source+= "*"+text
			endBody = "*"
		elif elem.tag == "h1":
			source+= "# "+text
		elif elem.tag == "h2":
			source+= "## "+text
		elif elem.tag == "h3":
			source+= "### "+text
		elif elem.tag == "h4":
			source+= "#### "+text
		elif elem.tag == "h5":
			source+= "##### "+text
		elif elem.tag == "h6":
			source+= "###### "+text
		elif elem.tag == "ul":
			listOrders.append("unordered")
			remList = True
		elif elem.tag == "ol":
			listOrders.append("ordered")
			remList = True
		elif elem.tag == "li":
			for num in listOrders[1:]:
				source+= ".."
			if listOrders[-1] == "unordered":
				source+= "* "
			if listOrders[-1] == "ordered":
				source+= str(order)+". "
			source+= text
			endBody = '\n'
			tail = False
		elif elem.tag == "dd":
			source+= "  "+text
			endBody = '\n'
			tail = False
		elif elem.tag == "dt":
			source+= text
			endBody = '\n'
			tail = False
		elif elem.tag == "dt":
			None
		else:
			tail = False
		
		"""Work childs"""
		for index, child in enumerate(list(elem), start=1):
			work_tag(child, index, code)
		
		"""Write end of body"""
		source+= endBody
		"""Write tail"""
		if elem.tail != None and tail:
			source+= elem.tail
		if remList:
			listOrders.pop()
			
			
	"""1st call"""
	work_tag(tag)
	notebook["cells"].append(newCell(type, source))

"""Output"""
#print(json.dumps(notebook, indent=4))
outName = re.sub('["*/:<>?\|]', ' ', outName)
outFile = open(outName+'.ipynb', 'w', encoding="utf-8")
outFile.write(json.dumps(notebook, indent=4))