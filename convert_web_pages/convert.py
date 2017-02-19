import urllib.request
import lxml.html
import re
from IPython.display import display_javascript
"""Getting the dokument"""
if re.match("(http)|(https)://", url):
	page_text = urllib.request.urlopen(url).read()
else:
	file = open(url, "rt")
	page_text = file.read()
html = lxml.html.fromstring(page_text)

"""Looking thru the page"""
for tag in html.xpath(xpath):
	def relative_to_absolute_ref(href):
		global url

		if re.match("(http)|(https)://", href):
			return href
		elif href.startswith("#"):
			return re.sub("(.*)#.*","\\1",url) + href
		elif href.startswith("/"):
			return re.sub("(.*://.*?)/.*","\\1",url) + href
		else:
			if href.startswith("./"):
				href = href[2:]
			return re.sub("(.*/).*","\\1",url) + href
	def markdown_string(text):
		#print("\""+text.replace("\n","\\n")+"\"")
		text = re.sub("[\s]+"," ",text)
		text = re.sub("^\s$","",text)
		text = text.replace("_",r"\_").replace("*",r"\*")
		#print("\""+text.replace("\n","\\n")+"\"")
		return text
	def create_slide(source, cell_type):
		source = source.strip()
		if source:
			if cell_type == "markdown":
				display_javascript("""
var t_cell = IPython.notebook.insert_cell_below();
t_cell.set_text('"""+re.sub("[\r]?[\n]","\\\\n",source.replace("\\","\\\\").replace("'","\\'"))+"""');
var t_index = IPython.notebook.get_cells().indexOf(t_cell);
IPython.notebook.to_markdown(t_index);""", raw=True)
			else:
				display_javascript("""
var t_cell = IPython.notebook.insert_cell_below();
t_cell.set_text('%%code\\n"""+re.sub("[\r]?[\n]","\\\\n",source.replace("\\","\\\\").replace("'","\\'"))+"""');
var t_index = IPython.notebook.get_cells().indexOf(t_cell);
IPython.notebook.to_markdown(t_index);""", raw=True)


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
			href = relative_to_absolute_ref(elem.get("src"))
			text = elem.get("alt", "")

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

display_javascript("""
var ncells = IPython.notebook.ncells();
var cells = IPython.notebook.get_cells();

for (var i = 0; i < ncells; i++) {
	var cell = cells[i];
	if (cell.get_text().startsWith("%%code\\n")){
		cell.set_text(cell.get_text().substring(7));
		var t_index = IPython.notebook.get_cells().indexOf(cell);
		IPython.notebook.to_code(t_index);
	}
}""", raw=True)
