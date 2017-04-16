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
		if (image_src){
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
				
				$("#base_64_image_dialog").trigger('status_change', "green");
				$("#base_64_image_dialog").trigger('table_change', "add");//fill_image_table();
			});
			/* When image fails to load
			 * Prints error msg.
			 */
			img.addEventListener('error', function() {
				$("#base_64_image_dialog").trigger('status_change', "red");
				console.log('Image "'+image_src+'" could not be loaded.');
			});
			
			img.src = image_src;//Starts conversion
		}
		else{
			$("#base_64_image_dialog").trigger('status_change', "red");
		}
	}
	/*
	 * Deletes image in base64 from notebook metadata
	 *
	 * @param image_name Name of the image
	 */
	function delete_image(image_name){
		if (image_name != null){
			if(IPython.notebook.metadata["image.base64"].hasOwnProperty(image_name)){
				var base64 = IPython.notebook.metadata["image.base64"];
				delete base64[image_name];
				$("#base_64_image_dialog").trigger('table_change', "Sub");
			}
			else{
				var txt = 'Image not found "'+image_name+'"';
				alert(txt);
			}
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
		$("#base_64_image_dialog").trigger('status_change', "orange");
		add_image($('#image_file_path')[0].value);
	}
	/* Gets image file from input
	 */
	function get_image_file(){
		$("#base_64_image_dialog").trigger('status_f_change', "orange");
		
		//console.log(this.previousSibling.files);
		for(var i=0;i<this.previousSibling.files.length;i++){
			var file = this.previousSibling.files[i];
			//console.log(file);
			
			var reader = new FileReader();
			reader.addEventListener("load", function (file, e){
				if(this.result){
					if(!IPython.notebook.metadata.hasOwnProperty("image.base64")){
						IPython.notebook.metadata["image.base64"] = {};
					}
					IPython.notebook.metadata["image.base64"]["image.base64/"+file.name] = this.result;
					
					$("#base_64_image_dialog").trigger('table_change', "Add");
				}
				$("#base_64_image_dialog").trigger('status_f_change', "green");
				//console.log(this);
				//console.log(file);
			}.bind(reader, file));
			reader.addEventListener("error", function (){
				$("#base_64_image_dialog").trigger('status_f_change', "red");
			});
			
			if(file){
				reader.readAsDataURL(file);
			}else{
				$("#base_64_image_dialog").trigger('status_f_change', "red");
			}
		}
		console.log(this);
	}
	/* Gets image name from button
	 * &
	 * call delete_image
	 */
	function get_image_name(button){
		delete_image(button.currentTarget.getAttribute("data-src"));
	}
	/* Adds html cell
	 */
	function add_image_cell(button){
		var txt = "%%html\n";
		txt+= '<img alt="'+button.currentTarget.getAttribute("data-src")+'" src="'+IPython.notebook.metadata["image.base64"][button.currentTarget.getAttribute("data-src")]+'"/>';
		
		var t_cell = IPython.notebook.insert_cell_below();
		t_cell.set_text(txt);
	}
	/* Adds invisible html cell
	 */
	function add_image_cell_invisible(button){
		var txt = "%%html ";
		txt+= "<!-- Invisible -->\n";
		txt+= '<img alt="'+button.currentTarget.getAttribute("data-src")+'" src="'+IPython.notebook.metadata["image.base64"][button.currentTarget.getAttribute("data-src")]+'"/>';
		
		var t_cell = IPython.notebook.insert_cell_below();
		t_cell.set_text(txt);
	}
	/* Updates image table
	 * Table class rendered_html
	 * | image name | delete button |
	 */
	function fill_image_table(type, action){
		var image_table = document.createElement("table");
		image_table.id = "image_table";
		image_table.width = "100%";
		image_table.classList.add("rendered_html");
		
		var sortable = [];
		for(var i in IPython.notebook.metadata["image.base64"]){
			sortable.push(i);
		}
		sortable.sort(function (a, b){
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		for(var x in sortable){
			var i = sortable[x];
			console.log(i);
			var tr = document.createElement("tr");
				var td_text = document.createElement("td");
				td_text.appendChild(document.createTextNode(i));
				
				var td_image = document.createElement("td");
				td_image.style.width = "100px";
				td_image.style.height = "70px";
					var image = document.createElement("img");
					image.setAttribute("alt", i);
					image.setAttribute("src", IPython.notebook.metadata["image.base64"][i]);
				td_image.appendChild(image);
				
				var td_base64_value = document.createElement("td");
				td_base64_value.style.width = "100px";
				td_base64_value.style.height = "70px";
					var p_base64 = document.createElement("p");
					p_base64.style.width = "100px";
					p_base64.style.height = "70px";
					p_base64.style["word-break"] = "break-all";
					p_base64.style["overflow"] = "auto";
					p_base64.innerHTML = IPython.notebook.metadata["image.base64"][i];
				td_base64_value.appendChild(p_base64);
				
				var td_delete = document.createElement("td");
					var button_delete = document.createElement("button");
					button_delete.setAttribute("data-src", i);
					button_delete.onclick = get_image_name;
						var icon_delete = document.createElement("i");
						icon_delete.classList.add("fa");
						icon_delete.classList.add("fa-trash");
					button_delete.appendChild(icon_delete);
					
					var button_add_image = document.createElement("button");
					button_add_image.setAttribute("data-src", i);
					button_add_image.onclick = add_image_cell;
						var icon_plus = document.createElement("i");
						icon_plus.classList.add("fa");
						icon_plus.classList.add("fa-plus");
					button_add_image.appendChild(icon_plus);
					
					var button_add_image_invisible = document.createElement("button");
					button_add_image_invisible.setAttribute("data-src", i);
					button_add_image_invisible.onclick = add_image_cell_invisible;
						var icon_plus_invisible = document.createElement("i");
						icon_plus_invisible.classList.add("fa");
						icon_plus_invisible.classList.add("fa-plus");
						icon_plus_invisible.style.opacity = "0.5";
					button_add_image_invisible.appendChild(icon_plus_invisible);
				td_delete.appendChild(button_delete);
				td_delete.appendChild(button_add_image);
				td_delete.appendChild(button_add_image_invisible);
			tr.appendChild(td_text);
			tr.appendChild(td_image);
			tr.appendChild(td_base64_value);
			tr.appendChild(td_delete);
			
			image_table.appendChild(tr);
		}
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
				icon : 'fa-file-image-o',
				callback : function(){
					var image_table = document.createElement("table");//Table for images, empty prototype
					image_table.id = "image_table";
					image_table.classList.add("rendered_html");
					
					var input_path = document.createElement("input");//Text input for adding images
					input_path.type = "text"; input_path.id = "image_file_path";
					input_path.onkeyup = get_image_path;
					
					var add_button = document.createElement("button");//Button for adding images
					add_button.type = "button";
					add_button.classList.add("status");
					add_button.appendChild(document.createTextNode("Add"));
					add_button.onclick = get_image_path;
					
					var p = document.createElement("p");//Table for add input, add button and add status
					p.appendChild(input_path);
					p.appendChild(add_button);
					
					var input_path_f = document.createElement("input");//File input for adding images
					input_path_f.type = "file"; input_path_f.id = "image_file_path_f"; input_path_f.accept="image/*";
					input_path_f.multiple = "multiple";
					//input_path_f.style["display"] = "inline-block";
					
					var add_button_f = document.createElement("button");//Button for adding images
					add_button_f.type = "button";
					add_button_f.classList.add("status_f");
					add_button_f.appendChild(document.createTextNode("Add"));
					add_button_f.onclick = get_image_file;
					//add_button_f.style["display"] = "inline-block";
					
					/*var status_f = document.createElement("div");
					status_f.id = "status_f";
					status_f.classList.add("status_f");
					status_f.style["border"] = "1px solid black";
					status_f.style["border-radius"] = "7px";
					status_f.style["width"] = "14px";
					status_f.style["height"] = "14px";
					status_f.style["background-color"] = "gray";
					status_f.style["display"] = "inline-block";*/
					
					var p2 = document.createElement("p");
					p2.appendChild(input_path_f);
					p2.appendChild(add_button_f);
					//p2.appendChild(status_f);
					
					var div = document.createElement("div");//Main dialog section
					div.setAttribute("id", "base_64_image_dialog");
					//div.appendChild(image_section);
					div.appendChild(image_table);
					div.appendChild(document.createElement("hr"));//Separator
					div.appendChild(p);
					div.appendChild(document.createElement("hr"));//Separator num2
					div.appendChild(p2);
					IPython.keyboard_manager.register_events(div);//Turns of jupyter keyboard shortcuts
					
					var selection = {};
					selection.width = '800px';
					selection.position = { my: "top", at: "bottom", of: $('#maintoolbar') };//Position under the toolbar
					
					/* Destroys zombie after close
					 */
					selection["close"] = function( event, ui ) {
						$("div[aria-describedby='base_64_image_dialog']").remove();
					}
					selection["open"] = function( event, ui ) {
						$("#base_64_image_dialog").bind('table_change', fill_image_table);
						$("#base_64_image_dialog").trigger('table_change', "Start");
						
						$("#base_64_image_dialog").bind('status_f_change', function(type, arguments){
							var status = this.getElementsByClassName("status_f");
							for(var i=0;i<status.length;i++){
								status[i].style["color"] = arguments;
							}
						});
						$("#base_64_image_dialog").bind('status_change', function(type, arguments){
							var status = this.getElementsByClassName("status");
							for(var i=0;i<status.length;i++){
								status[i].style["color"] = arguments;
							}
						});
					}
					
					$(div).dialog(selection);//Starts dialog
				}
			}
		]);
    };
	
	/* Changes value of images with basa64 string in notebook metadata
	 * 
	 * @param cell cell that will be changed
	 */
	var render_cell = function(cell) {
        var element = cell.element.find('div.text_cell_render');//Get rendered data
		var txt = element[0].innerHTML;
		
		/* Callback for replace
		 * if source starts with image.base64/
		 * then replaces its source in output with base64 value from notebook metadata
		 */
		function image_adder(match, offset, string) {
			if(offset.startsWith("image.base64/")){
				if(IPython.notebook.metadata.hasOwnProperty("image.base64") && IPython.notebook.metadata["image.base64"].hasOwnProperty(offset)){
					offset = IPython.notebook.metadata["image.base64"][offset];//Set offset
					match = match.replace(/src="(.*?)"/g, 'src="'+ offset +'"');//Replaces source in match
				}
				else{//If image is not in notebook metadata
					console.log('Image "'+offset+'" could not be loaded.');
				}
			}
			return match;
		}
		
		txt = txt.replace(/<img .*?src="(.*?)".*?\/?>/g, image_adder);//Changes source of the images
		element[0].innerHTML = txt;
	}
	
	/* On rendering markdown cell
	 * Changes dysplay
	 */
	events.on("rendered.MarkdownCell", function (event, data) {
		render_cell(data.cell);
    });
	
	return {
        load_ipython_extension : load_ipython_extension
    };
});