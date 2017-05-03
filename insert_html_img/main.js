/* xpasto07, IBP - 
 * Suports images embedet in notebook
 */

//lxml
//pywin32

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
	
	/*
	 * Add image in base64 to notebook metadata
	 *
	 * @param image_src Path to the image
	 */
	function add_image(image_src, dialog_win){
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
					$(dialog_win).trigger('status_change', "red");
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
				
				$(dialog_win).trigger('status_change', "green");
				$(dialog_win).trigger('table_change', "add");//fill_image_table();
			});
			/* When image fails to load
			 * Prints error msg and changes status
			 */
			img.addEventListener('error', function() {
				$(dialog_win).trigger('status_change', "red");
				console.log('Image "'+image_src+'" could not be loaded.');
			});
			
			img.src = image_src;//Starts conversion
		}
		else{
			$(dialog_win).trigger('status_change', "red");
		}
	}
	/*
	 * Deletes image in base64 from notebook metadata
	 *
	 * @param image_name Name of the image
	 */
	function delete_image(image_name, dialog_win){
		if (image_name != null){
			if(IPython.notebook.metadata["image.base64"].hasOwnProperty(image_name)){
				var base64 = IPython.notebook.metadata["image.base64"];
				delete base64[image_name];
				$(dialog_win).trigger('table_change', "Sub");
			}
			else{
				console.log('Image not found "'+image_name+'"');
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
		$(this).trigger('status_change', "orange");
		console.log($(this).find("#image_file_path").prop("value"));
		
		add_image($(this).find("#image_file_path").prop("value"), this);
	}
	/* Gets image file from input
	 * &
	 * uses FileReader to convert it
	 * alows multiple files
	 */
	function get_image_file(){
		$(this).trigger('status_f_change', {color:"orange", image:null, action:"start"});
		var files = $(this).find("#image_file_path_f").prop("files");
		//console.log(files);
		
		for(var i=0;i<files.length;i++){//For all files
			var file = files[i];
			//console.log(file);
				
			$(this).trigger('status_f_change', {color:"orange", image:file.name, action:"file_start"});
			setTimeout(function(file){//Asynchornus load
				var reader = new FileReader();
				/* When the image is loaded
				 * add its base64 value to notebook metadata
				 * &
				 * Updates table with images
				 */
				reader.addEventListener("load", function (file, dialog_win, e){
					if(this.result){
						if(!IPython.notebook.metadata.hasOwnProperty("image.base64")){
							IPython.notebook.metadata["image.base64"] = {};
						}
						IPython.notebook.metadata["image.base64"]["image.base64/"+file.name] = this.result;
						
						$(dialog_win).trigger('table_change', "Add");
						$(dialog_win).trigger('status_f_change', {color:"green", image:file.name, action:"add"});
					}else{
						$(dialog_win).trigger('status_f_change', {color:"red", image:file.name, action:"error"});
					}
					//console.log(this);
					//console.log(file);
				}.bind(reader, file, this)); //Bind sends file to function
				/* When image fails to load
				 * Prints error msg and changes status
				 */
				reader.addEventListener("error", function (file, dialog_win, e){
					console.log('Image "'+file.name+'" could not be loaded.');
					$(dialog_win).trigger('status_f_change', {color:"red", image:file.name, action:"error"});
				}.bind(reader, file, this));
				
				if(file){
					reader.readAsDataURL(file);
				}else{
					$(this).trigger('status_f_change', {color:"red", image:file.name, action:"error"});
				}
			}.bind(this, file), 2);
		}
		if(files.length==0){//If there are no files changes status
			$(this).trigger('status_f_change', {color:"red", image:null, action:null});
		}
		//console.log(this);
	}
	/* Adds html cell
	 */
	function add_image_cell(image){
		var txt = "%%html\n";
		txt+= '<img alt="'+image+'" src="'+IPython.notebook.metadata["image.base64"][image]+'"/>';
		
		var t_cell = IPython.notebook.insert_cell_below();
		t_cell.set_text(txt);
	}
	/* Adds invisible html cell
	 */
	function add_image_cell_invisible(image){
		var txt = "%%html ";
		txt+= "<!-- Invisible -->\n";
		txt+= '<img alt="'+image+'" src="'+IPython.notebook.metadata["image.base64"][image]+'"/>';
		
		var t_cell = IPython.notebook.insert_cell_below();
		t_cell.set_text(txt);
	}
	/* Updates image table
	 * Table class rendered_html
	 */
	function fill_image_table(type, action){
		var image_table = document.createElement("table");//Table
		image_table.id = "image_table";
		image_table.width = "100%";
		image_table.classList.add("rendered_html");
		
		var sortable = [];//Sort data
		for(var i in IPython.notebook.metadata["image.base64"]){
			sortable.push(i);
		}
		sortable.sort(function (a, b){
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		for(var x in sortable){
			var i = sortable[x];//Table row
			console.log(i);
			var tr = document.createElement("tr");
				var td_text = document.createElement("td");//Cell with image name
				td_text.appendChild(document.createTextNode(i));
				
				var td_image = document.createElement("td");//Cell with small version of the image
				td_image.style.width = "100px";
				td_image.style.height = "79px";
				td_image.style.overflow = "auto";
				td_image.setAttribute("data-src", i);
				setTimeout(function(){
					var image = document.createElement("img");
					image.setAttribute("src", IPython.notebook.metadata["image.base64"][this.getAttribute("data-src")]);
					image.setAttribute("alt", this.getAttribute("data-src"));
					image.style["max-width"] = "90px";
					image.style["max-height"] = "75px";
					this.innerHTML = "";
					this.appendChild(image);
					this.onclick = null;
				}.bind(td_image), 2);
				td_image.innerHTML = "Image";
				
				var td_base64_value = document.createElement("td");//Cell with base64 value
				td_base64_value.style.width = "100px";
				td_base64_value.style.height = "79px";
				td_base64_value.setAttribute("data-src", i);
				td_base64_value.onclick = function(){
					setTimeout(function(){
						var p_base64 = document.createElement("p");
						p_base64.style.width = "90px";
						p_base64.style.height = "70px";
						p_base64.style["word-break"] = "break-all";
						p_base64.style["overflow"] = "auto";
						p_base64.innerHTML = IPython.notebook.metadata["image.base64"][this.getAttribute("data-src")];
						this.innerHTML = "";
						this.appendChild(p_base64);
						this.onclick = null;
					}.bind(this), 2);
				}
				td_base64_value.innerHTML = "Click to show base64";
				
				var td_buttons = document.createElement("td");//Cell for buttons
					var button_delete = document.createElement("button");//Button for delete
					button_delete.onclick = delete_image.bind(button_delete, i, this);
						var icon_delete = document.createElement("i");
						icon_delete.classList.add("fa");
						icon_delete.classList.add("fa-trash");
					button_delete.appendChild(icon_delete);
					
					var button_add_image = document.createElement("button");//Button for adding image cell to document
					button_add_image.onclick = add_image_cell.bind(this, i);
						var icon_plus = document.createElement("i");
						icon_plus.classList.add("fa");
						icon_plus.classList.add("fa-plus");
					button_add_image.appendChild(icon_plus);
					
					var button_add_image_invisible = document.createElement("button");
					button_add_image_invisible.onclick = add_image_cell_invisible.bind(this, i);
						var icon_plus_invisible = document.createElement("i");
						icon_plus_invisible.classList.add("fa");
						icon_plus_invisible.classList.add("fa-plus");
						icon_plus_invisible.style.opacity = "0.5";
					button_add_image_invisible.appendChild(icon_plus_invisible);
				td_buttons.appendChild(button_delete);
				td_buttons.appendChild(button_add_image);
				//td_buttons.appendChild(button_add_image_invisible);
			tr.appendChild(td_text);
			tr.appendChild(td_image);
			tr.appendChild(td_base64_value);
			tr.appendChild(td_buttons);
			
			image_table.appendChild(tr);
		}
		$(this).find("#image_table").replaceWith(image_table);//Replaces the table
	}
	
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
		/*function output_callback(out_type, out_data){
			console.log(out_type);
			console.log(out_data);
		}*/
		
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
							kernel.execute(python_text);
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
						t_cell.select();
						t_cell.focus_cell();
					}
				}
			}
		]);
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
					var div = document.createElement("div");//Main dialog section
					div.setAttribute("id", "base_64_image_dialog");
					
					var image_table = document.createElement("table");//Table for images, empty prototype
					image_table.id = "image_table";
					image_table.classList.add("rendered_html");
					
					var image_div = document.createElement("div");
					image_div.style.height = "317px";
					image_div.style.overflow = "auto";
					image_div.appendChild(image_table);
					
					var input_path = document.createElement("input");//Text input for adding images
					input_path.type = "text"; input_path.id = "image_file_path";
					input_path.onkeyup = get_image_path.bind(div);
					
					var add_button = document.createElement("button");//Button for adding images from text input
					add_button.type = "button";
					add_button.id = "status";
						var icon_plus = document.createElement("i");//Icon for add
						icon_plus.classList.add("fa");
						icon_plus.classList.add("fa-plus-circle");
					add_button.appendChild(icon_plus);
					add_button.onclick = get_image_path.bind(div);
					
					var p = document.createElement("p");//Table for add input, add button and add status
					p.appendChild(input_path);
					p.appendChild(add_button);
					
					var input_path_f = document.createElement("input");//File input for adding images
					input_path_f.type = "file"; input_path_f.id = "image_file_path_f"; input_path_f.accept="image/*";
					input_path_f.multiple = "multiple";
					
					var add_button_f = document.createElement("button");//Button for adding images from file input
					add_button_f.type = "button";
					add_button_f.id = "status_f";
						var icon_plus_f = document.createElement("i");//Icon for add
						icon_plus_f.classList.add("fa");
						icon_plus_f.classList.add("fa-plus-circle");
					add_button_f.appendChild(icon_plus_f);
					add_button_f.onclick = get_image_file.bind(div);
					
					var status_text = document.createElement("p");
					status_text.id = "status_text";
					status_text.innerHTML = "Status:";
					
					var p2 = document.createElement("p");
					p2.appendChild(input_path_f);
					p2.appendChild(add_button_f);
					p2.appendChild(status_text);
					
					//Main section body
					div.appendChild(image_div);
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
					/* On opening
					 * Sets reactions to events
					 */
					selection["open"] = function( event, ui ) {
						/* Reaction to change table
						 * Refils the table
						 */
						$(this).bind('table_change', fill_image_table);
						$(this).trigger('table_change', "Start");//Fill table on load
						
						/* Reaction to change of image conversion status
						 * For file input
						 * Changes color of the adding button
						 */
						$(this).bind('status_f_change', function(type, arguments){
							//$(this).find("#status_f").css("color", arguments.color);
							if(arguments.action == "start"){
								$(this).find("#status_text").html('Status:<ul id="status_list_field"></ul>');
							}
							if(arguments.action == "file_start"){
								var item = document.createElement("li");
								item.innerHTML = arguments.image;
									var indikator = document.createElement("div");
									indikator.id = arguments.image;
									indikator.style.height = "1em";
									indikator.style.width = "1em";
									indikator.style.border = "1px black solid";
									indikator.style["border-radius"] = "0.5em";
									indikator.style.display = "inline-block";
									indikator.style["margin-left"] = "0.5em";
									//indikator.style["background-color"] = arguments.color;
								item.appendChild(indikator);
								
								$(this).find("#status_list_field").append(item);
							}
							if(arguments.action != "start"){
								//console.log($(this).find("#status_list_field li div[id='"+arguments.image+"']"));
								$(this).find("div[id='"+arguments.image+"']").css("background-color", arguments.color);
							}
							console.log(arguments);
						});
						/* Reaction to change of image conversion status
						 * For text input
						 * Changes color of the adding button
						 */
						$(this).bind('status_change', function(type, arguments){
							$(this).find("#status").css("color", arguments);
						});
					}
					
					$(div).dialog(selection);//Starts dialog
				}
			}
		]);
    });
	
	function load_ipython_extension () {
        config.load();
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