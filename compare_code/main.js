//

define([
    'base/js/namespace',
    'jquery',
    'require',
    'notebook/js/cell',
    'base/js/security',
    'base/js/events',
    'notebook/js/textcell'
], function(IPython, $, require, cell, security, events, textcell) {
	
	var compare_code_callback = IPython.CellToolbar.utils.checkbox_ui_generator(
	"Compare code",
	// setter
	function(cell, value){
		cell.metadata.compare_code = value
	},
	//geter
	function(cell){
		var cell_val = cell.metadata.compare_code;
		return (cell_val == undefined)? undefined: cell_val
	});
	
	function load_ipython_extension () {
		//----------------------------------------------------------------------------------------------------------
		// Register a callback to create a UI element for a cell toolbar.
        IPython.CellToolbar.register_callback('Compare code', compare_code_callback);
        // Register a preset of UI elements forming a cell toolbar.
        IPython.CellToolbar.register_preset("Compare code", ['Compare code']);
	};
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});