import nbformat
import re
import sys
from traitlets.config import Config
from nbconvert import LatexExporter

def get_outputs(outputs):
	ret_str = ""
	for output in outputs:
		for line in output.get("text", []):
			ret_str+= line
		for line in output.get("data", {}).get("text/plain", []):
			ret_str+= line
		for line in output.get("traceback", []):
			line = re.sub("\u001b\\[[0-9;]+m","",line)
			ret_str+= line + "\n"
	return ret_str
#end def get_outputs

if len(sys.argv) != 2:
	print("Usage: ipynb_to_pdf.py file\n")
	exit()

notebook_file = open(sys.argv[1],"rt",encoding="utf-8")

notebook = nbformat.reads(notebook_file.read(), as_version=4)

cmp_cell_A = None
for cell in notebook.cells[:]:
	if cell["cell_type"] == "markdown":
		#cell["source"] = re.sub('(?<!\\\\)_', '\\_', cell["source"])
		#cell["source"] = re.sub('`(.*?)`', '\\\\verb@\\1 @', cell["source"])
		
		cell["source"] = re.sub('{c{(.*?)}(.*?)}', '\\\\href{\\2}{\\\\colorbox{myBackground}{\color{black}{\\1}}}', cell["source"])
		cell["source"] = re.sub('{ci{(.*?)}(.*?)}', '\\\\href{\\2}{\\\\colorbox{myBackground}{\color{black}{\\1}}}', cell["source"])
		cell["source"] = re.sub('<a class="code" target="_blank" href="([^"]*?)">(.*?)</a>', '\\\\href{\\1}{\\\\colorbox{myBackground}{\color{black}{\\2}}}', cell["source"])
		cell["source"] = re.sub('<a class="code" href="([^"]*?)">(.*?)</a>', '\\\\href{\\1}{\\\\colorbox{myBackground}{\color{black}{\\2}}}', cell["source"])
		#print(line)
		
		iter = re.finditer('`.*?`', cell["source"])
		while iter!=None:
			try:
				match = next(iter)
				#print(cell["source"][match.start()+1:match.end()-1])
				cell["source"] = cell["source"][:match.start()] + "\\texttt{" + cell["source"][match.start()+1:match.end()-1].replace("_","\\_")+ "}" + cell["source"][match.end():]
				iter = re.finditer('`.*?`', cell["source"])
			except StopIteration:
				iter = None
		
	elif cell["cell_type"] == "code":
	
		#print(cell["metadata"].get("compare_code", False))
		
		if cell["metadata"].get("compare_code", False):
			if cmp_cell_A == None:
				cmp_cell_A = cell
				notebook.cells.remove(cell)
				#print(cmp_cell_A)
			else:
				cell["cell_type"] = "raw"
				new_source = "\\begin{lstlisting}\n"
				line_counter = 0
				for line_A, line_B in zip(cmp_cell_A["source"].split("\n"), cell["source"].split("\n")):
					line_counter+= 1
					if line_A == line_B:
						new_source+= line_A + "\n"
					else:
						new_source+= "(*@ \\colorbox{myLightBlue}{"
						new_source+= line_A + "} \setcounter{lstnumber}{"+ str(line_counter-1) +"} @*)\n"
						new_source+= "(*@ \\colorbox{myLightRed}{"
						new_source+= line_B + "} @*)\n"
				new_source+= "\\end{lstlisting}\n\\begin{verbatim}\n"
				new_source+= "A-----\n" + get_outputs(cmp_cell_A["outputs"])
				new_source+= "B-----\n" + get_outputs(cell["outputs"])
				new_source+= "\\end{verbatim}\n"
				cell["source"] = new_source
				
				cmp_cell_A = None
		elif not cell["source"].startswith("%%"):
			cell["cell_type"] = "raw"
			new_source = "\\begin{lstlisting}\n"
			new_source+= cell["source"]
			new_source+= "\n\\end{lstlisting}\n\\begin{verbatim}\n"
			new_source+= get_outputs(cell["outputs"])
			new_source+= "\n\\end{verbatim}\n"
			cell["source"] = new_source
	#end elif cell["cell_type"] == "code":
#end for cell in notebook.cells[:]:

latex_exporter = LatexExporter()
latex_exporter.template_file = 'article'

(body, resources) = latex_exporter.from_notebook_node(notebook)

outFile = open(sys.argv[1]+'.tex', 'w', encoding="utf-8")

packages = ("\\usepackage{listings}\n"
"\\definecolor{myDarkBlue}{rgb}{0,0,0.5}\n\n"
"\\definecolor{myDarkGreen}{rgb}{0,0.5,0}\n\n"
"\\definecolor{myDarkRed}{rgb}{0.5,0,0}\n\n"
"\\definecolor{myLightBlue}{rgb}{0.5,0.5,0.8}\n\n"
"\\definecolor{myLightRed}{rgb}{0.8,0.5,0.5}\n\n"
"\\definecolor{myBackground}{rgb}{0.98,0.98,0.98}\n\n"
"\\lstset{language=Python,backgroundcolor=\\color{myBackground}, frame=single, showstringspaces=false, stringstyle=\\color{myDarkRed}, keywordstyle=\\color{myDarkBlue}, commentstyle=\\color{myDarkGreen}, breakatwhitespace=false, breaklines=true, numbers=left, escapeinside={(*@}{@*)}}\n"
"\\begin{document}")

body = body.replace("\\begin{document}", packages)

outFile.write(body)
