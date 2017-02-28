//This extension adds special hyperlink to markdown that looks like cut from a piece of code.

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
	
	/*
	 * Finds patterns and convets them to HTML
	 *
	 * @param cell Executed markdown cell
	 */
	var render_cell = function(cell) {
        var element = cell.element.find('div.text_cell_render');
		
		//console.log(element[0].innerHTML);
		
		var txt = element[0].innerHTML;
		//console.log(txt);
				/*[`example`](reference)*/
		function href_replacer(match, offset, string) {
			return match.replace(/<a (.*?)>(.*?<code>.*?<\/code>.*?)<\/a>/g, "<a class=\"code\" $1>$2</a>");
		}
		txt = txt.replace(/<a .*?>.*?<\/a>/g, href_replacer);
				/*{c{example}http://www.example.com/reference }*/
		txt = txt.replace(/{c{(.*?)}<a.*?>(.*?)<\/a> }/g, "<a class=\"code\" href=\"$2\" target=\"_blank\"><code>$1</code></a>");
				/*{ci{example}http://www.example.com/reference }*/
		txt = txt.replace(/{ci{(.*?)}<a.*?>(.*?)<\/a> }/g, "<a class=\"code\" href=\"$2\"><code>$1</code></a>");
				/*{c{example}reference }*/
		txt = txt.replace(/{c{(.*?)}(.*?) }/g, "<a class=\"code\" href=\"$2\" target=\"_blank\"><code>$1</code></a>");
				/*{ci{example}reference }*/
		txt = txt.replace(/{ci{(.*?)}(.*?) }/g, "<a class=\"code\" href=\"$2\"><code>$1</code></a>");

		element[0].innerHTML = txt;
		
		//console.log(txt);
        //console.log(element);
    };
	
	var load_ipython_extension = function() {
		// Load CSS
		var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./custom.css");
        document.getElementsByTagName("head")[0].appendChild(link);
		
		// Mark cells as not yet renederd on start
		var original_render = textcell.MarkdownCell.prototype.render;
		textcell.MarkdownCell.prototype.render = function() {
			this.rendered = false;
			return original_render.apply(this);
		};
		
		// Run my code when rendering markdown cell
        events.on("rendered.MarkdownCell", function (event, data) {
            render_cell(data.cell);
        });
		
		// Execute markdown cell when kernel is ready
        events.on("kernel_ready.Kernel", function () {
            var ncells = IPython.notebook.ncells();
            var cells = IPython.notebook.get_cells();
            for (var i = 0; i < ncells; i++) {
                var cell = cells[i];
				if (cell instanceof IPython.MarkdownCell){
					cell.execute();
				}
                
            }
        });
		
    };
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});