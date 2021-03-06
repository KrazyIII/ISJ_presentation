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
		
		var google_fonts = document.createElement("link");
        google_fonts.type = "text/css";
        google_fonts.rel = "stylesheet";
        //google_fonts.href = require.toUrl("https://fonts.googleapis.com/css?family=Inconsolata");
        google_fonts.href = require.toUrl("https://fonts.googleapis.com/css?family=Roboto+Mono");
        document.getElementsByTagName("head")[0].appendChild(google_fonts);
		
		// Run my code when rendering markdown cell
        events.on("rendered.MarkdownCell", function (event, data) {
            render_cell(data.cell);
        });
		
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'rerun_and_clean',
				label : 'Render markdown and clean code',
				icon : 'fa-refresh',
				callback : function(){
					var ncells = IPython.notebook.ncells();
					var cells = IPython.notebook.get_cells();
					for (var i = 0; i < ncells; i++) {
						var cell = cells[i];
						if (cell instanceof IPython.MarkdownCell){
							cell.rendered = false;
							cell.render();
						}
						if (cell instanceof IPython.CodeCell){
							if(cell.get_text().startsWith("%%html"))
								cell.execute();
							if(cell.get_text().startsWith("# Run"))
								cell.execute();
							else
								cell.clear_output();
						}
					}
					/*console.log(cells[1].rendered);
					for(var i in cells[1]){
						console.log(i);
					}*/
				}
			}
		]);
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'clean_all',
				label : 'Clean all cells',
				icon : 'fa-eraser',
				callback : function(){
					var ncells = IPython.notebook.ncells();
					var cells = IPython.notebook.get_cells();
					for (var i = 0; i < ncells; i++) {
						var cell = cells[i];
						if (cell instanceof IPython.MarkdownCell){
							cell.unrender();
						}
						if (cell instanceof IPython.CodeCell){
							cell.clear_output();
						}
					}
				}
			}
		]);
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'set_slide_type',
				label : 'Set unassigned slide type',
				icon : 'fa-share',
				callback : function(){
					var ncells = IPython.notebook.ncells();
					var cells = IPython.notebook.get_cells();
					
					for (var i = 0; i < ncells; i++) {
						var cell = cells[i];
						slide_type = (cell.metadata.slideshow || {}).slide_type;
						//console.log(slide_type);
						if (slide_type == undefined || slide_type === "-"){
							cell.metadata.slideshow = {};
							cell.metadata.slideshow.slide_type = "subslide";
						}
					}
					IPython.notebook.metadata.celltoolbar = 'Slideshow';
					IPython.CellToolbar.activate_preset('Slideshow', this.events);
				}
			}
		]);
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'copy_notebook',
				label : 'Select entire notebook',
				icon : 'fa-copy',
				callback : function(){
					$("div.cell").addClass("jupyter-soft-selected");

					var cells = IPython.notebook.get_selected_cells();
					if (cells.length === 0) {
						cells = [IPython.notebook.get_selected_cell()];
					}
					
					for (var i=0; i < cells.length; i++) {
						console.log(cells[i].get_text());
						/*for(var j in cells[i]){
							console.log(cells[i][j]);
						}*/
					}
					/*for(var i in IPython.notebook){
						console.log(i);
					}*/
				}
			}
		]);
		// Execute markdown cell when kernel is ready
        events.on("kernel_ready.Kernel", function () {
            var ncells = IPython.notebook.ncells();
            var cells = IPython.notebook.get_cells();
			console.log("Kernel ready");
            for (var i = 0; i < ncells; i++) {
                var cell = cells[i];
				if (cell instanceof IPython.MarkdownCell){
					if(cell.rendered){
						cell.rendered = false;
						cell.execute();
						//console.log("Kernel ready");
					}
				}
            }
        });
		
    };
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});