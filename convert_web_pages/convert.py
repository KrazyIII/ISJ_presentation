import urllib.request
import lxml.html
import re
import os
import shutil
from IPython.display import display_javascript

class insert_html_page:
	url = ""
	xpath = ""
	source_type = ""
	image_file = ""
	source = ""
	listOrders=[]
	table_head = False
	
	def __init__(self, url, xpath, image_file):
		self.url = url
		self.xpath = xpath
		self.image_file = image_file
	
	def relative_to_absolute_ref(self, href):
		if self.source_type == "web":
			if re.match("http://|https://|ftp://|mailto:|file:", href):
				return href
			elif href.startswith("#"):
				return re.sub("(.*)#.*","\\1",self.url) + href
			elif href.startswith("/"):
				return re.sub("(.*://.*?)/.*","\\1",self.url) + href
			else:
				if href.startswith("./"):
					href = href[2:]
				return re.sub("(.*/).*","\\1",self.url) + href
		if self.source_type == "local":
			if re.match("http://|https://|ftp://|mailto:|file:", href):
				return href
			elif os.path.isabs(href):
				return href
			elif href.startswith("#"):
				return re.sub("(.*)#.*","\\1",self.url) + href
			else:
				return re.sub("(.*\\"+os.sep+").*","\\1",self.url) + href

	def download_image(self, src):
		if not os.path.exists(self.image_file):
			os.makedirs(self.image_file)
		
		img_name = self.image_file
		if img_name[-1] != "/":
			img_name+= "/"
		img_name+= re.sub(".*/(.*)", "\\1", src)
		#print(src)
		#print(img_name)
		if self.source_type == "web" or re.match("http://|https://|ftp://|mailto:|file:", src):
			urllib.request.urlretrieve(self.relative_to_absolute_ref(src), img_name)
		if self.source_type == "local":
			shutil.copyfile(self.relative_to_absolute_ref(src), img_name)
		return img_name
	
	def markdown_string(self, text):
		#print("\""+text.replace("\n","\\n")+"\"")
		text = re.sub("[\s]+"," ",text)
		text = re.sub("^\s$","",text)
		text = text.replace("_",r"\_").replace("*",r"\*")
		#print("\""+text.replace("\n","\\n")+"\"")
		return text
	
	def create_slide(self, source, cell_type):
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
		self.source = ""

	"""Iterative working of tags"""
	def work_tag(self, elem, order=0, printing="markdown"):
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
				text = self.markdown_string(elem.text)
			elif printing == "table":
				text = self.markdown_string(elem.text)

		if elem.tag == "p" or elem.tag == "q" or elem.tag == "small" or elem.tag == "mark" or elem.tag == "del" or elem.tag == "ins" or elem.tag == "sub" or elem.tag == "sup":
			self.source+= text
		elif elem.tag == "pre":
			"""Code"""
			self.create_slide(self.source, "markdown")
			printing = "code"
			self.source+= text
		elif elem.tag == "span":
			self.source+= text
		elif elem.tag == "div":
			self.source+= text
		elif elem.tag == "a":
			href = self.relative_to_absolute_ref(elem.get("href"))

			if printing == "code":
				self.source+= text
			else:
				self.source+= "["+text
				endBody = "]("+ href.replace("(","").replace(")","") +")"
		elif elem.tag == "img":
			try:
				href = self.download_image(elem.get("src"))
				text = elem.get("alt", "")
			except:
				href = ""
				text = "Image could not be downloaded"

			if printing == "code":
				self.source+= text
			else:
				self.source+= "!["+text
				endBody = "]("+ href.replace("(","").replace(")","") +")"
		elif elem.tag == "code":
			if printing == "code":
				self.source+= text
			else:
				self.source+= " `"+text
				endBody = "` "
			printing = "code"
		elif elem.tag == "strong" or elem.tag == "b" or elem.tag == "big":
			if printing == "code":
				self.source+= text
			else:
				self.source+= "**"+text
				endBody = "**"
		elif elem.tag == "em" or elem.tag == "i":
			if printing == "code":
				self.source+= text
			else:
				self.source+= "*"+text
				endBody = "*"
		elif elem.tag == "h1" or elem.tag == "h2" or elem.tag == "h3" or elem.tag == "h4" or elem.tag == "h5" or elem.tag == "h6":
			if printing == "code":
				self.source+= text
			else:
				for x in range(int(elem.tag[1])):
					self.source+= "#"
				self.source+= " "+text
				endBody = "\n"
		elif elem.tag == "ul":
			self.source+= "\n"
			self.listOrders.append("unordered")
			remList = True
			printing = "table"
			tail = False
			endBody = "\n"
		elif elem.tag == "ol":
			self.source+= "\n"
			self.listOrders.append("ordered")
			remList = True
			printing = "table"
			tail = False
			endBody = "\n"
		elif elem.tag == "li":
			for num in self.listOrders[1:]:
				self.source+= "  "
			if self.listOrders[-1] == "unordered":
				self.source+= "* "
			if self.listOrders[-1] == "ordered":
				self.source+= str(order)+". "
			self.source+= text
			endBody = "\n"
			printing = "table"
		elif elem.tag == "dd":
			self.source+= "  * "+text
			endBody = "\n"
			printing = "table"
		elif elem.tag == "dt":
			self.source+= "* "+text
			endBody = "\n"
			printing = "table"
		elif elem.tag == "dl":
			self.source+= "\n"
			printing = "table"
			tail = False
		elif elem.tag == "table":
			self.source+= "\n"
			self.table_head = True
			printing = "table"
			tail = False
		elif elem.tag == "tr":
			endBody = "|\n"
			tail = False
			if self.table_head:
				self.table_head = False
				for i in list(elem):
					for j in range(0, int(i.get("colspan", 1))):
						endBody+= "| --- "
				endBody+= "|\n"
		elif elem.tag == "td":
			self.source+= "| " + text
			endBody = " "
			for i in range(1 , int(elem.get("colspan", 1))):
				endBody+= "|"
			endBody+= " "
		elif elem.tag == "th":
			self.source+= "| **" + text
			endBody = "** "
			for i in range(1 , int(elem.get("colspan", 1))):
				endBody+= "|"
			endBody+= " "
		elif elem.tag == "caption":
			self.source+= text
			endBody = "\n"
		elif elem.tag == "title":
			self.source+= "# "+text
		else:
			tail = False

		"""Work childs"""
		for index, child in enumerate(list(elem), start=1):
			ret_tail = self.work_tag(child, index, printing)
			if tail and ret_tail:
				if printing == "code":
					self.source+= ret_tail
				else:
					self.source+= self.markdown_string(ret_tail)

		"""Write end of body"""
		self.source+= endBody

		if remList:
			self.listOrders.pop()
		"""print code cell"""
		if elem.tag == "pre":
			self.create_slide(self.source, "code")
		"""return tail"""
		return elem.tail

	def start(self):
		"""Getting the dokument"""
		if re.match("(http)|(https)://", self.url):
			page_text = urllib.request.urlopen(self.url).read()
			self.source_type = "web"
		else:
			file = open(self.url, "rt", encoding="utf-8")
			page_text = file.read()
			self.source_type = "local"
		html = lxml.html.fromstring(page_text)

		"""Looking thru the page"""
		for tag in html.xpath(self.xpath):
			"""1st call"""
			self.work_tag(tag)
			self.create_slide(self.source, "markdown")

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
