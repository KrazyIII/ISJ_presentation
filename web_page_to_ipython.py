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
html = lxml.html.parse(url)

"""Header and filename"""
#print(html.xpath("//div[@id='question-header']/h1/a[@class='question-hyperlink']/text()"))
"""Cell init"""
cell = {}
cell["cell_type"] = "markdown"
cell["metadata"] = {}
cell["metadata"]["slideshow"] = {}
cell["metadata"]["slideshow"]["slide_type"] = "slide"
cell["source"] = []
"""Getting the header"""
for line in html.xpath("//title/text()"):
	cell["source"].append("# "+line)
	outName += line
notebook["cells"].append(cell)

#print(html.xpath("//div[@class='post-text']/p/text()"))

"""Getting body of the html"""
for line in html.xpath("//div[@class='post-text']/* | //span[@class='comment-copy']"):
	"""Creates a new cell 
	   cellType cell_type if the new cell"""
	def newCell(cellType):
		global cell
		cell = {}
		cell["cell_type"] = cellType
		cell["metadata"] = {}
		cell["metadata"]["slideshow"] = {}
		cell["metadata"]["slideshow"]["slide_type"] = "subslide"
		cell["source"] = []
		notebook["cells"].append(cell)
	
	newCell("markdown")
	
	"""Iterative working of tags"""
	def work_tag(elem, listOrders=[], order=1):
		global cell
		"""Print tail after the rest"""
		tail = True
		"""Pop list, used for lists in lists"""
		remList = False
		
		"""If text is null notebook can't run"""
		if elem.text == None:
			text = ""
		else:
			text = elem.text
		
		if elem.tag == "p":
			#newCell("markdown")
			cell["source"].append(text)
		elif elem.tag == "pre":
			"""Code"""
			#newCell("code")
			cell["cell_type"] = "code"
			cell["outputs"] = []
			cell["metadata"]["collapsed"] = False
			cell["execution_count"] = None
			cell["source"].append(text)
		elif elem.tag == "span":
			"""Comments"""
			#newCell("markdown")
			#cell["metadata"]["slideshow"]["slide_type"] = "notes"
			cell["source"].append(text)
		elif elem.tag == "a":
			cell["source"].append("["+text+"]("+elem.get("href")+")")
		elif elem.tag == "code":
			if cell["cell_type"] == "markdown":
				cell["source"].append("`"+text+"`")
			else:
				cell["source"].append(text)
		elif elem.tag == "strong":
			cell["source"].append("**"+text+"**")
		elif elem.tag == "em":
			cell["source"].append("*"+text+"*")
		elif elem.tag == "h1":
			cell["source"].append("# "+text)
		elif elem.tag == "h2":
			cell["source"].append("## "+text)
		elif elem.tag == "h3":
			cell["source"].append("### "+text)
		elif elem.tag == "h4":
			cell["source"].append("#### "+text)
		elif elem.tag == "h5":
			cell["source"].append("##### "+text)
		elif elem.tag == "h6":
			cell["source"].append("###### "+text)
		elif elem.tag == "ul":
			listOrders.append("unordered")
			tail = False
			remList = True
		elif elem.tag == "ol":
			listOrders.append("ordered")
			tail = False
			remList = True
		elif elem.tag == "li":
			preText = ""
			for num in listOrders[1:]:
				preText+= ".."
			if listOrders[-1] == "unordered":
				preText+= "* "
			if listOrders[-1] == "ordered":
				preText+= str(order)+". "
			cell["source"].append(preText+text+'\n')
			tail = False
		else:
			tail = False
		
		"""Work childs"""
		for index, child in enumerate(list(elem), start=1):
			work_tag(child, listOrders, index)
		
		"""Write tails"""
		if elem.tail != None and tail:
			cell["source"].append(elem.tail)
		if remList:
			listOrders.pop()
			
			
	"""1st call"""
	work_tag(line)

"""Output"""
#print(json.dumps(notebook, indent=4))
outName = re.sub('["*/:<>?\|]', ' ', outName)
outFile = open(outName+'.ipynb', 'w', encoding="utf-8")
outFile.write(json.dumps(notebook, indent=4))