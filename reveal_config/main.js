//úpravy
//Cyklovanie
//štýly pre jednotlivé slajdy
//insert config
//insert default config

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

//Start slidechow at "selected" cell or "beginning" (first) cell
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
	
	var slide_transition_callback = IPython.CellToolbar.utils.select_ui_generator([
		["-",undefined],
		["Linear","linear"],
		["None","none"],
		["Fade","fade"],
		["Slide","slide"],
		["Zoom","zoom"]
	],
	// setter
	function(cell, value){
		cell.metadata.slide_transition = value
	},
	//geter
	function(cell){
		var cell_val = cell.metadata.slide_transition;
		return (cell_val == undefined)? undefined: cell_val
	},
	"Slide transition");
	var slide_transition_speed_callback = IPython.CellToolbar.utils.select_ui_generator([
		["-",undefined],
		["Default","default"],
		["Fast","fast"],
		["Slow","slow"],
		["Instant","instant"]
	],
	// setter
	function(cell, value){
		cell.metadata.slide_transition_speed = value
	},
	//geter
	function(cell){
		var cell_val = cell.metadata.slide_transition_speed;
		return (cell_val == undefined)? undefined: cell_val
	},
	"Slide transition speed");
	
	var base_url = utils.get_body_data("baseUrl");
    var config = new configmod.ConfigSection('notebook', {base_url: base_url});
	
	config.loaded.then(function() {
		
		var rise_config = {};
		var rise_config_desc = {};
		
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
			rise_config["width"] = 1140;
			rise_config["height"] = 855;
			rise_config["minScale"] = 1.0;
		}
		if(config.data.hasOwnProperty('default_config_for_rise_description')){
			for(var i in config.data.default_config_for_rise_description){
				var indx = config.data.default_config_for_rise_description[i].indexOf("=");
				var param = config.data.default_config_for_rise_description[i].substr(0, indx).trim();
				var value = config.data.default_config_for_rise_description[i].substr(indx + 1).trim();
				rise_config_desc[param] = value;
			}
		}
		else{
			rise_config_desc["theme"] = 'Set theme.\nValues |"simple"|, "beige", "blood", "default", "moon", "night", "serif", "sky", "solarized"';
			rise_config_desc["transition"] = 'Set global transition type.\nValues |"linear"|, "none", "fade", "slide", "zoom"';
			rise_config_desc["scroll"] = 'Scrolable slides.\nValues true, |false|';
			rise_config_desc["start_slideshow_at"] = 'Start slidechow at "selected" cell or "beginning" (first) cell.\nValues |"beginning"|, "selected"';
			rise_config_desc["controls"] = 'Show controls.\nValues |true| false';
			rise_config_desc["progress"] = 'Show progress.\nValues |true|, false';
			rise_config_desc["history"] = 'Show history.\nValues |true|, false';
			rise_config_desc["slideNumber"] = 'Show number of slide.\nValues |true|, false';
			rise_config_desc["width"] = 'Set slide width.\nDefault value = 1140';
			rise_config_desc["height"] = 'Set slide height.\nDefault value = 855';
			rise_config_desc["minScale"] = 'We need this for codemirror to work right.\nDefault value = 1.0';
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
        IPython.CellToolbar.register_callback('Slide transition', slide_transition_callback);
		IPython.CellToolbar.register_callback('Slide transition speed', slide_transition_speed_callback);
        // Register a preset of UI elements forming a cell toolbar.
        IPython.CellToolbar.register_preset("Slide transition", ['Slide transition']);
		IPython.CellToolbar.register_preset("Slide transition speed", ['Slide transition speed']);
		
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'reveal_switch',
				label : 'reveal_config',
				icon : 'fa-recycle',
				callback : function(){
					//console.log(IPython.notebook.metadata);
					if(IPython.notebook.metadata.celltoolbar === "Slideshow"){
						IPython.notebook.metadata.celltoolbar = "Slide transition";
						IPython.CellToolbar.activate_preset("Slide transition", this.events);
					}
					else if(IPython.notebook.metadata.celltoolbar === "Slide transition"){
						IPython.notebook.metadata.celltoolbar = "Slide transition speed";
						IPython.CellToolbar.activate_preset("Slide transition speed", this.events);
					}
					else{
						IPython.notebook.metadata.celltoolbar = 'Slideshow';
						IPython.CellToolbar.activate_preset('Slideshow', this.events);
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
					
					var txt = '%%javascript\n';
					for(item in IPython.notebook.metadata.livereveal){
						if(rise_config_desc.hasOwnProperty(item)){
							txt+= "\n\n/*";
							txt+= rise_config_desc[item].replace("\\n","\n").replace("\\t","\t");
							txt+= "*/\n";
						}else txt+= "\n\n";
						if(typeof IPython.notebook.metadata.livereveal[item] === 'string'){
							txt+= "IPython.notebook.metadata.livereveal[\""+item+"\"] = \""+IPython.notebook.metadata.livereveal[item]+"\";";
						}else{
							txt+= "IPython.notebook.metadata.livereveal[\""+item+"\"] = "+IPython.notebook.metadata.livereveal[item]+";";
						}
					}
					
					var t_cell = IPython.notebook.insert_cell_below();
					t_cell.set_text(txt);
					var t_index = IPython.notebook.get_cells().indexOf(t_cell);
					IPython.notebook.to_code(t_index);
				}
			},
			{
				id : 'rise_global_default_settings',
				label : 'Set default RISE settings for this notebook',
				icon : 'fa-cog',
				callback : function(){
					/*for(var i in IPython.notebook.metadata.livereveal){
						console.log(i+" = "+IPython.notebook.metadata.livereveal[i]);
					}*/
					
					var txt = '%%javascript\n';
					for(item in rise_config){
						if(rise_config_desc.hasOwnProperty(item)){
							txt+= "\n\n/*";
							txt+= rise_config_desc[item].replace("\\n","\n").replace("\\t","\t");
							txt+= "*/\n";
						}else txt+= "\n\n";
						if(typeof rise_config[item] === 'string'){
							txt+= "IPython.notebook.metadata.livereveal[\""+item+"\"] = \""+rise_config[item]+"\";";
						}else{
							txt+= "IPython.notebook.metadata.livereveal[\""+item+"\"] = "+rise_config[item]+";";
						}
					}
					
					var t_cell = IPython.notebook.insert_cell_below();
					t_cell.set_text(txt);
					var t_index = IPython.notebook.get_cells().indexOf(t_cell);
					IPython.notebook.to_code(t_index);
				}
			}
		]);
		
		
		var original_add = $.fn.addClass;
		$.fn.addClass = function(){
			var result = original_add.apply( this, arguments );
			$(this).trigger('addClassEvent', arguments);
			return result;
		}
		var original_remove = $.fn.removeClass;
		$.fn.removeClass = function(){
			var result = original_remove.apply( this, arguments );
			$(this).trigger('removeClassEvent', arguments);
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
				
					if ((cell.metadata || {}).slide_transition){
						if(slide_counter == -1) slide_counter = 0;
						if(subslide_counter == -1) subslide_counter = 0;
						
						if(cell.metadata.slide_transition != undefined){
							console.log('#slide-'+slide_counter+'-'+subslide_counter+' '+cell.metadata.slide_transition);
							$('#slide-'+slide_counter+'-'+subslide_counter).attr('data-transition', cell.metadata.slide_transition)
						}
					}
					if ((cell.metadata || {}).slide_transition_speed){
						if(slide_counter == -1) slide_counter = 0;
						if(subslide_counter == -1) subslide_counter = 0;
						
						if(cell.metadata.slide_transition_speed != undefined){
							console.log('#slide-'+slide_counter+'-'+subslide_counter+' '+cell.metadata.slide_transition_speed);
							$('#slide-'+slide_counter+'-'+subslide_counter).attr('data-transition-speed', cell.metadata.slide_transition_speed)
						}
					}
					
				}
			}
		});
		$('body').bind('removeClassEvent', function(type, arguments){
			if (arguments === 'rise-enabled'){
				var slide_count = 0;
				var sub_slide_count = 0;
				$('.present').each(function(){
					var id = $(this).attr('id');
					if(id != undefined && id.startsWith("slide")){
						slide_count = +id.replace(/^slide-([0-9]+)-([0-9]+)$/g,"$1");
						sub_slide_count = +id.replace(/^slide-([0-9]+)-([0-9]+)$/g,"$2");
					}
				})
				console.log("slide:" + slide_count + "-" + sub_slide_count);
				setTimeout(function(){
					var ncells = IPython.notebook.ncells();
					var cells = IPython.notebook.get_cells();
					for (var i = 0; i < ncells; i++){
						var slide_type = (cells[i].metadata.slideshow || {}).slide_type;
						if(slide_type == "slide"){slide_count--;}
						if((slide_type == "subslide" || slide_type == "slide") && slide_count < 0){sub_slide_count--;}
						
						if(slide_count < 0 && sub_slide_count < 0){
							cells[i].select();
							cells[i].focus_cell();
							break;
						}
					}
				}, 1000);
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