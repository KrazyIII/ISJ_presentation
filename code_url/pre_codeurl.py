import re
from nbconvert.preprocessors import Preprocessor
from nbconvert.preprocessors import LatexPreprocessor

class CodeURLPreprocessor(Preprocessor):
	def preprocess_cell(self, cell, resources, index):
		print(cell["source"])
		cell["source"] = re.sub('{c{(.*?)}(.*?)}', '<a class="code" target="_blank" href="\\2">\\1</a>', cell["source"])
		cell["source"] = re.sub('{ci{(.*?)}(.*?)}', '<a class="code" href="\\2">\\1</a>', cell["source"])
		return cell, resources

class CodeURLLatexPreprocessor(LatexPreprocessor):
	def preprocess_cell(self, cell, resources, index):
		print(cell["source"])
		cell["source"] = re.sub('{c{(.*?)}(.*?)}', '\\\\href{\\2}{\\\\color{black}{\\1}}', cell["source"])
		cell["source"] = re.sub('{ci{(.*?)}(.*?)}', '\\\\href{\\2}{\\\\color{black}{\\1}}', cell["source"])
		cell["source"] = re.sub('<a class="code" target="_blank" href="([^"]*?)">(.*?)</a>', '\\\\href{\\1}{\\\\color{black}{\\2}}', cell["source"])
		cell["source"] = re.sub('<a class="code" href="([^"]*?)">(.*?)</a>', '\\\\href{\\1}{\\\\color{black}{\\2}}', cell["source"])
		return cell, resources