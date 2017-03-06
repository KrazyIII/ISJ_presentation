//

/*
%%javascript
IPython.notebook.metadata["livereveal"] = {};

//Set theme
//Values |"simple"|, "beige", "blood", "default", "moon", "night", "serif", "sky", "solarized"
IPython.notebook.metadata.livereveal["theme"] = "simple";

//Set global transition type
//Values |"linear"|, "none", "fade", "slide"
IPython.notebook.metadata.livereveal["transition"] = "linear";

//Scrolable slides
//Values true, |false|
IPython.notebook.metadata.livereveal["scroll"] = false;

//Start slidechow at "selected" or "beginning"
//Values |"beginning"|, "selected"
IPython.notebook.metadata.livereveal["start_slideshow_at"] = "beginning";

//Show controls
//Values |true| false
IPython.notebook.metadata.livereveal["controls"] = true;

//Show progress
//Values |true|, false
IPython.notebook.metadata.livereveal["progress"] = true;

//Show history
//Values |true|, false
IPython.notebook.metadata.livereveal["history"] = true;

//Show number of slide
//Values |true|, false
IPython.notebook.metadata.livereveal["slideNumber"] = true;

//Set width and height of the slide
//Default values "width" = 1140, "height" = 855, ratio 4:3
IPython.notebook.metadata.livereveal["width"] = 1140;
IPython.notebook.metadata.livereveal["height"] = 855;

IPython.notebook.metadata.livereveal["minScale"] = 1.0; //we need this for codemirror to work right
*/

define([
    'base/js/namespace',
    'jquery',
    'require',
    'notebook/js/cell',
    'base/js/security',
    'base/js/events',
    'notebook/js/textcell',
	'base/js/utils',
    'services/config'
], function(IPython, $, require, cell, security, events, textcell, utils, configmod) {
	
	
	var compare_code_callback = IPython.CellToolbar.utils.checkbox_ui_generator(
        "Compare cells",
        // setter
        function(cell, value) {
            cell.metadata.compare_code = value;
        },
        // getter
        function(cell) {
             // if init_cell is undefined, it'll be interpreted as false anyway
            return cell.metadata.compare_code;
        }
    );
	
	var base_url = utils.get_body_data("baseUrl");
    var config = new configmod.ConfigSection('notebook', {base_url: base_url});
	
	config.loaded.then(function() {
		
		var rise_config = {};
		
		if(config.data.hasOwnProperty('default_config_for_rise')){
			for(var i in config.data.default_config_for_rise){
				var indx = config.data.default_config_for_rise[i].indexOf("=");
				var param = config.data.default_config_for_rise[i].substr(0, indx).trim();
				var value = config.data.default_config_for_rise[i].substr(indx + 1).trim();
				if(value == 'true'){
					rise_config[param] = true;
				}else if(value == 'false'){
					rise_config[param] = false;
				}else if(isNaN(value)){
					rise_config[param] = value;
				}else{
					rise_config[param] = +value;
				}
				
			}
		}
		else{
			rise_config["theme"] = "simple";
			rise_config["transition"] = "linear";
			rise_config["scroll"] = false;
			rise_config["start_slideshow_at"] = "beginning";
			rise_config["controls"] = true;
			rise_config["progress"] = true;
			rise_config["history"] = true;
			rise_config["slideNumber"] = true;
			rise_config["width"] = 1140
			rise_config["height"] = 855
			rise_config["minScale"] = 1.0
		}
		
		// Set global config when kernel is ready
        events.on("kernel_ready.Kernel", function () {
            if(!IPython.notebook.metadata.hasOwnProperty("livereveal")){
				IPython.notebook.metadata["livereveal"] = {};
				
				for(item in rise_config){
					IPython.notebook.metadata.livereveal[item] = rise_config[item];
				}
			}
        });
		
		var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./custom.css");
        document.getElementsByTagName("head")[0].appendChild(link);
		//----------------------------------------------------------------------------------------------------------
		// Register a callback to create a UI element for a cell toolbar.
        IPython.CellToolbar.register_callback('compare_code', compare_code_callback);
        // Register a preset of UI elements forming a cell toolbar.
        IPython.CellToolbar.register_preset("Compare cells", ['compare_code']);
		
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'compare_code',
				label : 'Compare cells',
				icon : 'fa-recycle',
				callback : function(){
					//console.log(IPython.notebook.metadata);
					if(IPython.notebook.metadata.celltoolbar === "Compare cells"){
						IPython.notebook.metadata.celltoolbar = 'Slideshow';
						IPython.CellToolbar.activate_preset('Slideshow', this.events);
					}
					else{
						IPython.notebook.metadata.celltoolbar = "Compare cells";
						IPython.CellToolbar.activate_preset("Compare cells", this.events);
					}
					//console.log(IPython.notebook.metadata);
				}
			},
			{
				id : 'set_slide_type',
				label : 'Set unassigned slide type',
				icon : 'fa-cogs',
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
			},
			{
				id : 'rise_global_settings',
				label : 'Set RISE settings for this notebook',
				icon : 'fa-cog',
				callback : function(){
					/*for(var i in IPython.notebook.metadata.livereveal){
						console.log(i+" = "+IPython.notebook.metadata.livereveal[i]);
					}*/
					
					var txt = '%%javascript\n\n';
					for(item in IPython.notebook.metadata.livereveal){
						if(typeof IPython.notebook.metadata.livereveal[item] === 'string'){
							txt+= "IPython.notebook.metadata.livereveal[\""+item+"\"] = \""+IPython.notebook.metadata.livereveal[item]+"\";\n";
						}else{
							txt+= "IPython.notebook.metadata.livereveal[\""+item+"\"] = "+IPython.notebook.metadata.livereveal[item]+";\n";
						}
					}
					
					var t_cell = IPython.notebook.insert_cell_below();
					t_cell.set_text(txt);
					var t_index = IPython.notebook.get_cells().indexOf(t_cell);
					IPython.notebook.to_code(t_index);
				}
			}
		]);
		
		
		var original = $.fn.addClass;
		$.fn.addClass = function(){
			var result = original.apply( this, arguments );
			$(this).trigger('addClassEvent', arguments);
			return result;
		}
		
		$('#maintoolbar').bind('addClassEvent', function(type, arguments){
			if (arguments === 'reveal_tagging'){
				//console.log('---------');
				//console.log(arguments);
				//console.log('---------');
			
				var slide_counter = -1, subslide_counter = -1;
			
				var ncells = IPython.notebook.ncells();
				var cells = IPython.notebook.get_cells();
				for (var i = 0; i < ncells; i++) {
					var cell = cells[i];
					slide_type = (cell.metadata.slideshow || {}).slide_type;
					if (slide_type === 'slide') {
						slide_counter++;
						subslide_counter = 0;
					} else if (slide_type === 'subslide') {
						subslide_counter ++;
					}
				
					if ((cell.metadata || {}).compare_code){
						if(slide_counter == -1) slide_counter = 0;
						if(subslide_counter == -1) subslide_counter = 0;
						
						if(cell.metadata.compare_code != "default"){
							console.log('#slide-'+slide_counter+'-'+subslide_counter+' '+cell.metadata.compare_code);
							$('#slide-'+slide_counter+'-'+subslide_counter).attr('data-transition-speed', "instant")
						}
					}
				}
			}
		});
	});
	
	function load_ipython_extension () {
        config.load();
    };
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});