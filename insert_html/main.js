//

/*
conda 32 bit
obrázky v prezentácií
nbpresent
rozdelenie

lxml
pywin32

https://ipython.org/ipython-doc/3/interactive/magics.html#cell-magics
%%python
    %%python script magic
    Run cells with python in a subprocess.
    This is a shortcut for %%script python

%%python2
    %%python2 script magic
    Run cells with python2 in a subprocess.
    This is a shortcut for %%script python2

%%python3
    %%python3 script magic
    Run cells with python3 in a subprocess.
    This is a shortcut for %%script python3
*/

define([
    'base/js/namespace',
    'jquery',
    'require',
    'notebook/js/cell',
    'base/js/events',
    'notebook/js/textcell',
	'base/js/utils',
    'services/config'
], function(IPython, $, require, cell, events, textcell, utils, configmod) {
	
	var base_url = utils.get_body_data("baseUrl");
    var config = new configmod.ConfigSection('notebook', {base_url: base_url});
	var define_insert_html_page_class = true;
	
	config.loaded.then(function() {
		
		domains = {};
		
		if(config.data.hasOwnProperty('xpath_for_domain')){
			for(var i in config.data.xpath_for_domain){
				var indx = config.data.xpath_for_domain[i].indexOf("=");
				var domain = config.data.xpath_for_domain[i].substr(0, indx).trim();
				var xpath_string = config.data.xpath_for_domain[i].substr(indx + 1).trim();
				domains[domain] = xpath_string;
			}
		}
		else{
			domains["stackoverflow.com"] = "//div[@id='question-header']/h1 | //div[@class='post-text']/* | //span[@class='comment-copy']";
			domains["docs.python.org"] = "//div[@class='section']/*[not(@class='section') and not(name()='dl')] | //div[@class='section']/*[not(@class='section')]/dt | //div[@class='section']/*[not(@class='section')]/dd/*";
			domains["wikipedia.org"] = "//div[@id='mw-content-text']/* | //title";
			domains["wiki.python.org"] = "//div[@id='content']/* | //title";
			domains["github.com"] = "//div[@id='readme']/article/*";
			domains["readthedocs.io"] = "//div[@class='section']/*[not(@class='section')]";
			domains["reveal.js"] = "//div[@class='slides']/section | //div[@class='slides']/section/section";
		}
		
		var kernel = IPython.notebook.kernel;
		function output_callback(out_type, out_data){
			console.log(out_type);
			console.log(out_data);
		}
		
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'convert_web_pages',
				label : 'Convert web pages to ipython',
				icon : 'fa-file',
				callback : function(){
					var conv_url = prompt("Enter URL of page", "");
					if (conv_url != null) {
						var conv_domain = conv_url.replace(/(?:.*:\/\/)([^\/\r\n]+\.[^\/\r\n]+).*/, "$1");
						if(conv_domain == conv_url){
							conv_domain = 'default';
						}
						
						var dom_xpath = '/html/body';
						if(domains.hasOwnProperty(conv_domain)){
							dom_xpath = domains[conv_domain];
						}
						else{
							var reduced_conv_domain = conv_domain.replace(/.*\.(.*\..*)/g, "$1");
							if(domains.hasOwnProperty(reduced_conv_domain)){
								dom_xpath = domains[reduced_conv_domain];
							}
						}
						
						if(define_insert_html_page_class) $.get(require.toUrl("./convert.py"), function(python_text){
							kernel.execute(python_text, {"output": output_callback});
							/*var t_cell = IPython.notebook.insert_cell_below();
							t_cell.set_text(python_text);*/
							define_insert_html_page_class = false;
						});
						var txt = '';
						txt+= 'url = "' + conv_url.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"\n';
						txt+= 'xpath = "'+ dom_xpath.replace(/"/g, '\\"') +'"\n';
						
						var img_file = IPython.notebook.notebook_path;
						img_file = img_file.replace(/.*\/(.*)/g, "$1");
						img_file = img_file.replace(/(.*)\..*/g, "$1");
						txt+= 'image_dir = "'+ img_file +'/"\n\n';
						
						txt+= 'insert_html_page(url, xpath, image_dir).start()';
						
						var t_cell = IPython.notebook.insert_cell_below();
						t_cell.set_text(txt);
						//var t_index = IPython.notebook.get_cells().indexOf(t_cell);
						//IPython.notebook.to_code(t_index);
					}
				}
			},
			{
				id : 'speed_convert_web_pages',
				label : 'Speed convert web pages to ipython',
				icon : 'fa-file',
				callback : function(){
					var conv_domain = 'default';
					
					var dom_xpath = '/html/body';
					if(domains.hasOwnProperty(conv_domain)){
						dom_xpath = domains[conv_domain];
					}
					
					if(define_insert_html_page_class) $.get(require.toUrl("./convert.py"), function(python_text){
						kernel.execute(python_text, {"output": output_callback});
						define_insert_html_page_class = false;
					});
					var txt = '';
					txt+= 'url = ""\n';
					txt+= 'xpath = "'+ dom_xpath.replace(/"/g, '\\"') +'"\n';
					
					var img_file = IPython.notebook.notebook_path;
					img_file = img_file.replace(/.*\/(.*)/g, "$1");
					img_file = img_file.replace(/(.*)\..*/g, "$1");
					txt+= 'image_dir = "'+ img_file +'/"\n\n';
					
					txt+= 'insert_html_page(url, xpath, image_dir).start()';
					
					setTimeout(function(cell_text){
						kernel.execute("print('Hello world')", {"output": output_callback}, {silent:false});
					}, 1000, txt);
				}
			},
			{
				id : 'copy_notebook',
				label : 'Copy entire notebook',
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
    });
	
	function load_ipython_extension () {
        config.load();
    };
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});