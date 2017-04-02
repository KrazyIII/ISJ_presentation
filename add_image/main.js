/* xpasto07, IBP - nazov
 * Suports images embedet in notebook
 */

define([
    'base/js/namespace',
    'jquery',
    'require',
    'notebook/js/cell',
    'base/js/events',
    'notebook/js/textcell'
], function(IPython, $, require, cell, events, textcell) {
	
	/*
	 * Add image in base64 to notebook metadata
	 *
	 * @param image_src Path to the image
	 */
	function add_image(image_src){
		if (image_src != null){
			var image_end = image_src.replace(/.*\.(.*)/g, "$1"); //File type
			var data_type = "";
			switch(image_end){//Set data type based on file type
				case "png":
					data_type = "image/png";
				break;
				case "jpg":
					data_type = "image/jpg";
				break;
				case "gif":
					data_type = "image/gif";
				break;
				default:
					console.log("Incompatible image type");
					return;
			}
			
			var img = new Image();
			
			/* When the image is loaded
			 * Converts it to base64 thru canvas
			 * &
			 * add it to notebook metadata
			 * &
			 * Updates table with images
			 */
			img.addEventListener('load', function(){
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;

				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);

				var dataURL = canvas.toDataURL(data_type);

				if(!IPython.notebook.metadata.hasOwnProperty("image.base64")){
					IPython.notebook.metadata["image.base64"] = {};
				}
				IPython.notebook.metadata["image.base64"]["image.base64/"+image_src] = dataURL;
				
				//var t_cell = IPython.notebook.insert_cell_below();
				//t_cell.set_text('%%html\n<img src="'+dataURL+'"/>');
				//t_cell.execute();
				fill_image_table();
			});
			/* When image fails to load
			 * Prints error msg.
			 */
			img.addEventListener('error', function() {
				console.log('Image "'+image_src+'" could not be loaded.');
			});
			
			img.src = image_src;//Starts conversion
		}
	}
	/* Gets image source from input
	 * &
	 * call add_image
	 */
	function get_image_path(e){
		if(e instanceof KeyboardEvent){//If function is set up by <input>
			if(e.key != "Enter")
				return; //Only reacts on enter
		}
		add_image($('#image_file_path')[0].value);
	}
	/* Updates image table
	 * Table class rendered_html
	 * | image name | delete button |
	 */
	function fill_image_table(){
		var image_table = document.createElement("table");
		image_table.id = "image_table";
		image_table.classList.add("rendered_html");
		
		var html = "";
		for(var i in IPython.notebook.metadata["image.base64"]){
			var tr = document.createElement("tr");
			
			var td_text = document.createElement("td");
			tr.appendChild(td_text);
			td_text.appendChild(document.createTextNode(i));
			
			var td_delete = document.createElement("td");
			tr.appendChild(td_delete);
			var button_delete = document.createElement("button");
			td.appendChild(button_delete);

			var icon_delete = document.createElement("i");
			button_delete.appendChild(icon_delete);
			icon_delete.classList.add("fa");
			icon_delete.classList.add("fa-trash");
		}
		image_table.innerHTML = html;
		$('#image_table').replaceWith(image_table);
	}
	
	function load_ipython_extension () {
		
		Jupyter.toolbar.add_buttons_group([
			{
				/* Opens jquery dialog with:
				 * Table of images
				 * &
				 * Delete buttons
				 * &
				 * Input to add more images
				 */
				id : 'base_64_image',
				label : 'Images in base64',
				icon : 'fa-info',
				callback : function(){
					var image_table = document.createElement("table");
					image_table.id = "image_table";
					image_table.classList.add("rendered_html");
					
					var input_path = document.createElement("input");
					input_path.type = "text"; input_path.id = "image_file_path";
					input_path.onkeyup = get_image_path;
					
					var add_button = document.createElement("button");
					add_button.type = "button";
					add_button.appendChild(document.createTextNode("Add"));
					add_button.onclick = get_image_path;
					
					var p = document.createElement("p");
					p.appendChild(input_path);
					p.appendChild(add_button);
					
					var div = document.createElement("div");
					div.setAttribute("id", "base_64_image_dialog");
					div.appendChild(image_table);
					div.appendChild(document.createElement("hr"));
					div.appendChild(p);
					IPython.keyboard_manager.register_events(div);
					
					var selection = {};
					
					selection["close"] = function( event, ui ) {
						$("div[aria-describedby='base_64_image_dialog']").remove();
					}
					
					$(div).dialog(selection);
					
					fill_image_table();
				}
			},
			{
				id : 'get_base_64_image',
				label : 'Get image in base64',
				icon : 'fa-book',
				callback : function(){
					var selection = {};
					selection["buttons"] = {};
					
					for(var i in IPython.notebook.metadata["image.base64"]){
						
						function display(button){
							var html_cell = "";
							
							var image_name = button["target"]["innerText"];
							
							var html_cell = '<p>Image: "'+image_name+'"</p>\n<hr>\n';
							if(IPython.notebook.metadata["image.base64"].hasOwnProperty(image_name)){
								html_cell+= '<p style="height: 10em; width=300px; word-break: break-all;">'+ IPython.notebook.metadata["image.base64"][image_name] +'</p>';
							}
							$('#get_base_64_image_dialog')[0].innerHTML = html_cell;
						}
						
						selection["buttons"][i] = display;
					}
					var div = document.createElement("div");
					div.setAttribute("id", "get_base_64_image_dialog");
					
					selection["close"] = function( event, ui ) {
						$("div[aria-describedby='get_base_64_image_dialog']").remove();
					}
					
					$(div).dialog(selection);
				}
			},
			{
				id : 'delete_base_64_image',
				label : 'Delete image',
				icon : 'fa-trash',
				callback : function(){
					var image_name = prompt("Image name", "");
					if (image_name != null){
						if(IPython.notebook.metadata["image.base64"].hasOwnProperty(image_name)){
							var base64 = IPython.notebook.metadata["image.base64"];
							delete base64[image_name];
						}
						else{
							var txt = 'Image not found "'+image_name+'"';
							alert(txt);
						}
					}
				}
			}
		]);
    };
	
	var render_cell = function(cell) {
        var element = cell.element.find('div.text_cell_render');
		var txt = element[0].innerHTML;
		
		function image_adder(match, offset, string) {
			if(offset.startsWith("image.base64/")){
				if(IPython.notebook.metadata.hasOwnProperty("image.base64") && IPython.notebook.metadata["image.base64"].hasOwnProperty(offset)){
					offset = IPython.notebook.metadata["image.base64"][offset];
					match = match.replace(/src="(.*?)"/g, 'src="'+ offset +'"');
				}
				else{
					console.log('Image "'+offset+'" could not be loaded.');
				}
			}
			return match;
		}
		
		txt = txt.replace(/<img .*?src="(.*?)".*?\/?>/g, image_adder);
		element[0].innerHTML = txt;
	}
	
	events.on("rendered.MarkdownCell", function (event, data) {
		render_cell(data.cell);
    });
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});