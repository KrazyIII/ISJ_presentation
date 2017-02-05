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
        'compare_code',
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
        IPython.CellToolbar.register_preset('Compare Code', ['compare_code']);
		
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'compare_code',
				label : 'Compare Code',
				icon : 'fa-recycle',
				callback : function(){
					//console.log(IPython.notebook.metadata);
					if(IPython.notebook.metadata.celltoolbar === 'Compare Code'){
						IPython.notebook.metadata.celltoolbar = 'Slideshow';
						IPython.CellToolbar.activate_preset('Slideshow', this.events);
					}
					else{
						IPython.notebook.metadata.celltoolbar = 'Compare Code';
						IPython.CellToolbar.activate_preset('Compare Code', this.events);
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
						console.log('#slide-'+slide_counter+'-'+subslide_counter);
						$('#slide-'+slide_counter+'-'+subslide_counter).attr('data-transition-speed',"instant")
					}
				}
			}
		});
    };
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});