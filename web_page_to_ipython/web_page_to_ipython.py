import urllib.request
import re
import sys
import lxml.html
import json
from lxml import etree

page_text = ""
outName = ""
"""Arguments"""
if len(sys.argv) == 3 and sys.argv[1] == "--url":
	url = sys.argv[2]

	domain = re.sub('(.*://)([^/]*\\.[^/]*)/.*','\\2',url)
	#print(domain)

	page_text = urllib.request.urlopen(url).read()
	outName = url
elif (len(sys.argv) == 3 or len(sys.argv) == 5) and sys.argv[1] == "--local":
	file_name = sys.argv[2]
	
	domain = "local_file"
	
	encoding = "utf-8"
	if len(sys.argv) == 5 and sys.argv[3] == "--encoding":
		encoding = sys.argv[4]
	
	file = open(file_name, "rt", encoding=encoding)
	page_text = file.read()
	
	outName = file_name
elif len(sys.argv) == 2 and sys.argv[1] == "--stdin":
	outName = "stdin"
	
	domain = "stdin"
	
	page_text = sys.stdin.read()
else:
	print("Usage:")
	print("URL: python web_page_to_ipython --url www.url.com/some_page")
	print()
	print("Local file: python web_page_to_ipython --local file [--encoding enc]")
	print("            Config for local file is local_file in web_page_to_ipython.py.config")
	print("            Default encoding is utf-8")
	print("STDIN: python web_page_to_ipython --stdin")
	exit()

config_text = ""
with open("web_page_to_ipython.py.config", "rt", encoding="utf-8") as config_file:    
	config = json.loads(config_file.read())

	if config.get(domain, False):
		for index, part in enumerate(config[domain]):
			if index != 0:
				config_text+= ' | '
			config_text+= part
	else:
		print("Domain "+ domain +" is not in config\n")
		exit()

"""Converting web page"""
html = lxml.html.fromstring(page_text)
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

"""Filename"""
"""Getting the header"""
for title_text in html.xpath("//title/text()"):
	outName = title_text

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
	table_head = False
	
	"""Iterative working of tags"""
	def work_tag(elem, order=0, printing="markdown"):
		global type
		global source
		global listOrders
		global table_head
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
			if elem.tag == "code" or printing == "code":
				text = elem.text
			elif printing == "markdown":
				text = elem.text.replace("_",r"\_").replace("*",r"\*")
				text = re.sub("[ \t]+"," ",text)
			elif printing == "table":
				text = elem.text.replace("_",r"\_").replace("*",r"\*")
				text = text.replace("\n"," ")
		
		if elem.tag == "p" or elem.tag == "q" or elem.tag == "small" or elem.tag == "mark" or elem.tag == "del" or elem.tag == "ins" or elem.tag == "sub" or elem.tag == "sup":
			source+= text
		elif elem.tag == "pre":
			"""Code"""
			type = "code"
			printing = "code"
			source+= text
		elif elem.tag == "span":
			source+= text
		elif elem.tag == "div":
			source+= text
		elif elem.tag == "a":
			source+= "["+text
			endBody = "]("+elem.get("href")+")"
		elif elem.tag == "code":
			printing = "code"
			if type == "markdown":
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
			source+= "\n"
			listOrders.append("unordered")
			remList = True
			printing = "table"
		elif elem.tag == "ol":
			source = "\n"
			listOrders.append("ordered")
			remList = True
			printing = "table"
		elif elem.tag == "li":
			for num in listOrders[1:]:
				source+= ".."
			if listOrders[-1] == "unordered":
				source+= "* "
			if listOrders[-1] == "ordered":
				source+= str(order)+". "
			source+= text
			endBody = '\n'
			printing = "table"
			tail = False
		elif elem.tag == "dd":
			source+= "  "+text
			endBody = '\n'
			printing = "table"
			tail = False
		elif elem.tag == "dt":
			source+= text
			endBody = '\n'
			printing = "table"
			tail = False
		elif elem.tag == "dl":
			source+= "\n"
			printing = "table"
		elif elem.tag == "table":
			source+= "\n"
			table_head = True
			printing = "table"
		elif elem.tag == "tr":
			endBody = '|\n'
			tail = False
			if table_head:
				table_head = False
				for i in list(elem):
					endBody+= "| --- "
				endBody+= "|\n"
		elif elem.tag == "td":
			source+= "| " + text
			endBody = ' '
			tail = False
		elif elem.tag == "th":
			source+= "| **" + text
			endBody = '** '
			tail = False
		elif elem.tag == "caption":
			source+= text
			endBody = '\n'
			tail = False
		elif elem.tag == "title":
			source+= "# "+text
			tail = False
		else:
			tail = False
		
		"""Work childs"""
		for index, child in enumerate(list(elem), start=1):
			work_tag(child, index, printing)
		
		"""Write end of body"""
		source+= endBody
		"""Write tail"""
		if elem.tail != None and tail:
			if printing == "code":
				source+= elem.tail
			elif printing == "markdown":
				source+= re.sub("[ \t]+"," ",elem.tail.replace("_",r"\_").replace("*",r"\*"))
			elif printing == "table":
				source+= re.sub("[ \t]+"," ",elem.tail.replace("_",r"\_").replace("*",r"\*"))
		if remList:
			listOrders.pop()
			
			
	"""1st call"""
	work_tag(tag)
	
	if source:
		notebook["cells"].append(newCell(type, source))

"""Output"""
#print(json.dumps(notebook, indent=4))
outName = re.sub('["*/:<>?\|]', ' ', outName)
outFile = open(outName+'.ipynb', 'w', encoding="utf-8")
outFile.write(json.dumps(notebook, indent=4))