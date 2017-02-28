import re
from nbconvert.preprocessors import Preprocessor

class CodeURLPreprocessor(Preprocessor):
	def preprocess_cell(self, cell, resources, index):
		if index == 0:
			#print(dir(Preprocessor))
			print(self.config.NbConvertApp.export_format)
		if cell["cell_type"] == "markdown":
			cell["source"] = re.sub('{ci?{(.*?)}(.*?)}', '[`\\1`](\\2)', cell["source"])
			if self.config.NbConvertApp.export_format == "latex":
				def add_escape_underscore(match_group):
					print(match_group.group(1))
					str = '\\texttt{\\colorbox{black!5}{'+re.sub(r"(?<!\\)_", r"\_",match_group.group(1))+'}}'
					print(str)
					return str
				cell["source"] = re.sub('`(.*?)`', add_escape_underscore, cell["source"])
		return cell, resources
