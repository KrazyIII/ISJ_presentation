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
    'notebook/js/textcell'
], function(IPython, $, require, cell, events, textcell) {
	
	function load_ipython_extension () {
		Jupyter.toolbar.add_buttons_group([
			{
				id : 'add_base_64_image',
				label : 'Add image in base64',
				icon : 'fa-file-o',
				callback : function(){
					var image_src = prompt("Path to image", "");
					if (image_src != null){
						var image_end = image_src.replace(/.*\.(.*)/g, "$1");
						var data_type = "";
						switch(image_end){
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
						});
						img.addEventListener('error', function() {
							alert('Image "'+image_src+'" could not be loaded.');
						});
						
						img.src = image_src;
					}
				}
			},
			{
				id : 'see_base_64_image',
				label : 'See images in base64',
				icon : 'fa-info',
				callback : function(){
					var txt = "  Images:\n";
					for(var i in IPython.notebook.metadata["image.base64"]){
						txt+= i;
						txt+= "\n";
					}
					alert(txt);
				}
			},
			{
				id : 'get_base_64_image',
				label : 'Get image in base64',
				icon : 'fa-book',
				callback : function(){
					var image_name = null;
					var selection = {};
					selection["buttons"] = {};
					for(var i in IPython.notebook.metadata["image.base64"]){
						selection["buttons"][i] = function(){image_name = i;}
					}
					selection["buttons"]["Cancel"] = function(){image_name = null;}
					$('').dialog(selection);
					
					if (image_name != null){
						var txt = 'Image not found "'+image_name+'"';
						if(IPython.notebook.metadata["image.base64"].hasOwnProperty(image_name)){
							txt = IPython.notebook.metadata["image.base64"][image_name];
						}
						alert(txt);
					}
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