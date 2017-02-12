//

/*
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
			domains["stackoverflow.com"] = "//div[@id='question-header'] | //div[@class='post-text']/* | //span[@class='comment-copy']";
			domains["docs.python.org"] = "//div[@class='section']/*[not(@class='section') and not(name()='dl')] | //div[@class='section']/*[not(@class='section')]/dt | //div[@class='section']/*[not(@class='section')]/dd/*";
			domains["sk.wikipedia.org"] = "//div[@id='mw-content-text']/* | //title";
			domains["cz.wikipedia.org"] = "//div[@id='mw-content-text']/* | //title";
			domains["en.wikipedia.org"] = "//div[@id='mw-content-text']/* | //title";
			domains["wiki.python.org"] = "//div[@id='content']/* | //title";
			domains["default"] = "//body/* | //title";
		}
		
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'convert_web_pages',
				label : 'Convert web pages to ipython',
				icon : 'fa-recycle',
				callback : function(){
					var conv_url = prompt("Enter URL of page", "URL");
					if (conv_url != null) {
						var conv_domains = conv_url.match(/(?:.*:\/\/)([^\/\r\n]+\.[^\/\r\n]+)/);
						var conv_domain = 'default';
						if(conv_domains != null && conv_domains.hasOwnProperty(1)){
							conv_domain = conv_domains[1];
						}
						
						var dom_xpath = '/html/body/*';
						if(domains.hasOwnProperty(conv_domain)){
							dom_xpath = domains[conv_domain];
						}
						
						$.get(require.toUrl("./convert.py"), function(python_text){
							var txt = '';
							txt+= 'url = "' + conv_url.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"\n'
							txt+= 'xpath = "'+ dom_xpath.replace(/"/g, '\\"') +'"\n\n'
							txt+= python_text;
							
							var t_cell = IPython.notebook.insert_cell_below();
							t_cell.set_text(txt);
							var t_index = IPython.notebook.get_cells().indexOf(t_cell);
							IPython.notebook.to_code(t_index);
						});
					}
				}
			},
			{
				id : 'copy_notebook',
				label : 'Copy entire notebook',
				icon : 'fa-cogs',
				callback : function(){
					$.get(require.toUrl("./convert.py"), function(python_text){
						alert(python_text);
					});
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