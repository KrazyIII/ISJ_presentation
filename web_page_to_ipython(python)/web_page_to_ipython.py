import urllib.request
import re
import sys
import lxml.html
import json
import configparser
import os
from lxml import etree

def is_url(url):
	
	if re.match("(http)|(https)://", url):
		return True
	return False

sourceURL = ""
page_text = ""
outName = ""
"""Arguments"""
arg_num = len(sys.argv)
try:
	if (arg_num == 3 and sys.argv[1] == "--url")or(arg_num == 2 and is_url(sys.argv[1])):
		url = sys.argv[arg_num - 1]
	
		domain = re.sub('(.*://)([^/]*\\.[^/]*)/.*','\\2',url)
		#print(domain)

		page_text = urllib.request.urlopen(url).read()
		sourceURL = url
		outName = sourceURL
		source_type = "web"
	elif (arg_num == 3 or arg_num == 5) and sys.argv[1] == "--local":
		file_name = sys.argv[2]
	
		domain = "local_file"
	
		encoding = "utf-8"
		if len(sys.argv) == 5 and sys.argv[3] == "--encoding":
			encoding = sys.argv[4]
	
		file = open(file_name, "rt", encoding=encoding)
		page_text = file.read()
	
		#sourceURL = "https://docs.python.org/3/library/json.html#module-json"
		sourceURL = file_name
		outName = sourceURL
		source_type = "local"
	elif arg_num == 2 and sys.argv[1] == "--stdin":
		sourceURL = ""
		outName = "stdin"
	
		domain = "stdin"
	
		page_text = sys.stdin.read()
		source_type = "local"
	else:
		file_name = " ".join(sys.argv[1:])
	
		domain = "local_file"
	
		encoding = "utf-8"
	
		file = open(file_name, "rt", encoding=encoding)
		page_text = file.read()
	
		sourceURL = file_name
		outName = file_name
		source_type = "local"
except:
	print("Usage:")
	print("URL: python web_page_to_ipython --url http://www.url.com/some_page")
	print()
	print("Local file: python web_page_to_ipython --local file [--encoding enc]")
	print("            Config for local file is local_file in web_page_to_ipython.py.config")
	print("            Default encoding is utf-8")
	print("STDIN: python web_page_to_ipython --stdin")
	exit()

config_text = ""
config = configparser.ConfigParser()
config.read('web_page_to_ipython.py.config')

reduced_domain = re.sub(".*\.(.*\..*)", "\\1", domain)

if domain in config:
	config_text = config[domain]['find']
elif reduced_domain in config:
	config_text = config[reduced_domain]['find']
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
for title_text in html.xpath("/html/head/title/text()"):
	outName = title_text

outName = re.sub('["*/:<>?\|]', ' ', outName)

#print(html.xpath("//div[@class='post-text']/p/text()"))

"""Getting body of the html"""
for tag in html.xpath(config_text):
	def relative_to_absolute_ref(href):
		global sourceURL
		global source_type
		
		if source_type == "web":
			if re.match("http://|https://|ftp://|mailto:|file:", href):
				return href
			elif href.startswith("#"):
				return re.sub("(.*)#.*","\\1",sourceURL) + href
			elif href.startswith("/"):
				return re.sub("(.*://.*?)/.*","\\1",sourceURL) + href
			else:
				if href.startswith("./"):
					href = href[2:]
				return re.sub("(.*/).*","\\1",sourceURL) + href
		if source_type == "local":
			if re.match("http://|https://|ftp://|mailto:|file:", href):
				return href
			elif os.path.isabs(href):
				return href
			elif href.startswith("#"):
				return re.sub("(.*)#.*","\\1",sourceURL) + href
			else:
				return re.sub("(.*\\"+os.sep+").*","\\1",sourceURL) + href
	def download_image(src):
		global outName
		global source_type
		
		
		img_name = re.sub(".*/(.*)", "\\1", outName)
		img_name = re.sub("(.*)\..*", "\\1", img_name)
		
		if not os.path.exists(img_name):
			os.makedirs(img_name)
		
		img_name+= "/"
		img_name+= re.sub(".*/(.*)", "\\1", src)
		#print(src)
		#print(img_name)
		if source_type == "web" or re.match("http://|https://|ftp://|mailto:|file:", src):
			urllib.request.urlretrieve(relative_to_absolute_ref(src), img_name)
		if source_type == "local":
			shutil.copyfile(relative_to_absolute_ref(src), img_name)
		return img_name
	def markdown_string(text):
		#print("\""+text.replace("\n","\\n")+"\"")
		text = re.sub("[\s]+"," ",text)
		text = re.sub("^\s$","",text)
		text = text.replace("_",r"\_").replace("*",r"\*")
		#print("\""+text.replace("\n","\\n")+"\"")
		return text
	"""Creates a new cell 
	   cellType cell_type if the new cell"""
	def create_slide(source, cellType):
		global notebook
		source = source.strip()
		if source:
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
			notebook["cells"].append(cell)
	
	source = ""
	listOrders=[]
	table_head = False
	
	"""Iterative working of tags"""
	def work_tag(elem, order=0, printing="markdown"):
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
				text = markdown_string(elem.text)
			elif printing == "table":
				text = markdown_string(elem.text)

		if elem.tag == "p" or elem.tag == "q" or elem.tag == "small" or elem.tag == "mark" or elem.tag == "del" or elem.tag == "ins" or elem.tag == "sub" or elem.tag == "sup":
			source+= text
		elif elem.tag == "pre":
			"""Code"""
			create_slide(source, "markdown")
			source = ""
			printing = "code"
			source+= text
		elif elem.tag == "span":
			source+= text
		elif elem.tag == "div":
			source+= text
		elif elem.tag == "a":
			href = relative_to_absolute_ref(elem.get("href"))

			if printing == "code":
				source+= text
			else:
				source+= "["+text
				endBody = "]("+ href.replace("(","").replace(")","") +")"
		elif elem.tag == "img":
			try:
				href = download_image(elem.get("src"))
				text = elem.get("alt", "")
			except:
				href = ""
				text = "Image could not be downloaded"

			if printing == "code":
				source+= text
			else:
				source+= "!["+text
				endBody = "]("+ href.replace("(","").replace(")","") +")"
		elif elem.tag == "code":
			if printing == "code":
				source+= text
			else:
				source+= " `"+text
				endBody = "` "
			printing = "code"
		elif elem.tag == "strong" or elem.tag == "b" or elem.tag == "big":
			if printing == "code":
				source+= text
			else:
				source+= "**"+text
				endBody = "**"
		elif elem.tag == "em" or elem.tag == "i":
			if printing == "code":
				source+= text
			else:
				source+= "*"+text
				endBody = "*"
		elif elem.tag == "h1" or elem.tag == "h2" or elem.tag == "h3" or elem.tag == "h4" or elem.tag == "h5" or elem.tag == "h6":
			if printing == "code":
				source+= text
			else:
				for x in range(int(elem.tag[1])):
					source+= "#"
				source+= " "+text
				endBody = "\n"
		elif elem.tag == "ul":
			source+= "\n"
			listOrders.append("unordered")
			remList = True
			printing = "table"
			tail = False
			endBody = "\n"
		elif elem.tag == "ol":
			source+= "\n"
			listOrders.append("ordered")
			remList = True
			printing = "table"
			tail = False
			endBody = "\n"
		elif elem.tag == "li":
			for num in listOrders[1:]:
				source+= "  "
			if listOrders[-1] == "unordered":
				source+= "* "
			if listOrders[-1] == "ordered":
				source+= str(order)+". "
			source+= text
			endBody = "\n"
			printing = "table"
		elif elem.tag == "dd":
			source+= "  "+text
			endBody = "\n"
			printing = "table"
		elif elem.tag == "dt":
			source+= text
			endBody = "\n"
			printing = "table"
		elif elem.tag == "dl":
			source+= "\n"
			printing = "table"
			tail = False
		elif elem.tag == "table":
			source+= "\n"
			table_head = True
			printing = "table"
			tail = False
		elif elem.tag == "tr":
			endBody = "|\n"
			tail = False
			if table_head:
				table_head = False
				for i in list(elem):
					for j in range(0, int(i.get("colspan", 1))):
						endBody+= "| --- "
				endBody+= "|\n"
		elif elem.tag == "td":
			source+= "| " + text
			endBody = " "
			for i in range(1 , int(elem.get("colspan", 1))):
				endBody+= "|"
			endBody+= " "
		elif elem.tag == "th":
			source+= "| **" + text
			endBody = "** "
			for i in range(1 , int(elem.get("colspan", 1))):
				endBody+= "|"
			endBody+= " "
		elif elem.tag == "caption":
			source+= text
			endBody = "\n"
		elif elem.tag == "title":
			source+= "# "+text
		else:
			tail = False

		"""Work childs"""
		for index, child in enumerate(list(elem), start=1):
			ret_tail = work_tag(child, index, printing)
			if tail and ret_tail:
				if printing == "code":
					source+= ret_tail
				else:
					source+= markdown_string(ret_tail)

		"""Write end of body"""
		source+= endBody

		if remList:
			listOrders.pop()
		"""print code cell"""
		if elem.tag == "pre":
			create_slide(source, "code")
			source = ""
		"""return tail"""
		return elem.tail


	"""1st call"""
	work_tag(tag)
    
	create_slide(source, "markdown")

"""Output"""
#print(json.dumps(notebook, indent=4))
outFile = open(outName+'.ipynb', 'w', encoding="utf-8")
outFile.write(json.dumps(notebook, indent=4))