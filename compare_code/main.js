//

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
	
	var load_ipython_extension = function() {
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
					for(var i in IPython.notebook.metadata.livereveal){
						console.log(i+" = "+IPython.notebook.metadata.livereveal[i]);
					}
					
					var txt = ''+
'%%javascript\n'+
'IPython.notebook.metadata["livereveal"] = {};\n'+
'\n'+
'//Set theme\n'+
'//Values |"simple"|, "beige", "blood", "default", "moon", "night", "serif", "sky", "solarized"\n'+
'IPython.notebook.metadata.livereveal["theme"] = "simple";\n'+
'\n'+
'//Set global transition type\n'+
'//Values |"linear"|, "none", "fade", "slide"\n'+
'IPython.notebook.metadata.livereveal["transition"] = "linear";\n'+
'\n'+
'//Scrolable slides\n'+
'//Values true, |false|\n'+
'IPython.notebook.metadata.livereveal["scroll"] = false;\n'+
'\n'+
'//Start slidechow at "selected" or "beginning"\n'+
'//Values |"beginning"|, "selected"\n'+
'IPython.notebook.metadata.livereveal["start_slideshow_at"] = "beginning";\n'+
'\n'+
'//Show controls\n'+
'//Values |true| false\n'+
'IPython.notebook.metadata.livereveal["controls"] = true;\n'+
'\n'+
'//Show progress\n'+
'//Values |true|, false\n'+
'IPython.notebook.metadata.livereveal["progress"] = true;\n'+
'\n'+
'//Show history\n'+
'//Values |true|, false\n'+
'IPython.notebook.metadata.livereveal["history"] = true;\n'+
'\n'+
'//Show number of slide\n'+
'//Values |true|, false\n'+
'IPython.notebook.metadata.livereveal["slideNumber"] = true;\n'+
'\n'+
'//Set width and height of the slide\n'+
'//Default values "width" = 1140, "height" = 855, ratio 4:3\n'+
'IPython.notebook.metadata.livereveal["width"] = 1140;\n'+
'IPython.notebook.metadata.livereveal["height"] = 855;\n'+
'\n'+
'IPython.notebook.metadata.livereveal["minScale"] = 1.0; //we need this for codemirror to work right\n';
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
    };
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});