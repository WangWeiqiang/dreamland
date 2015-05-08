var _500pxDiscovery={
	parameters:{
		global:'popular',
		user:'user',
		page:1,
		imageSize:2,
		totalPage:0,
		loading:true,
		swipeStart:false,
		activeItem:null,
		currentPhoto:null,
		cropImage:null,
		cropData:null,
        cropTarget:null,
        cropResult:null
	},

	bigPhotos:[

	],

	fetchPicture:function(type,page,imageSize,callback){
		$("#wrapper").append("<div class='loading'></div>");
		_500pxDiscovery.parameters.loading=true;
		_500px.api(
	    	'/photos', 
	    	{ feature: type, page: page,image_size:imageSize }, 
	    	function (response) {
				if(response.success){
					_500pxDiscovery.parameters.global=type;
					_500pxDiscovery.parameters.page=parseInt(page);
					_500pxDiscovery.imageSize=imageSize;

					$(".loading").remove();
					if(page==1){
						$("#gallery").empty();
					}
					_500pxDiscovery.parameters.totalPage=response.data.total_pages;
					
					$.each(response.data.photos,function(){
						$("#gallery").append("<li data-thum='"+this.image_url+"' style='background-image:url("+this.image_url+")' data-photoid='"+this.id+"' onclick='_500pxDiscovery.ShowPhoto(this)'><img src='img/dot-clear.png'></li>")
					});

					_500pxDiscovery.parameters.loading=false;

					if(typeof callback !="undefined"){
						callback.call();
					}

					
				}
				else
				{

				}
			}
		);
	},

	mainCategoryBtnInital:function(){
		$("#navbar-collapse-maincategory").find("ul").find("li").on("click",function(){
			var category=$(this).attr("data-category");
			var page=$(this).attr("data-page");
			var imageSize=$(this).attr("data-imagesize");
			$("#top-btn-maincategory").click();
			$("#top-btn-maincategory").removeClass("sprite-popular");
			$("#top-btn-maincategory").removeClass("sprite-fresh_today");
			$("#top-btn-maincategory").removeClass("sprite-upcoming");
			$("#top-btn-maincategory").removeClass("sprite-editors");
			$("#top-btn-maincategory").removeClass("sprite-highest_rated");
			$("#top-btn-maincategory").addClass("sprite-"+category);
			_500pxDiscovery.fetchPicture(category,page,imageSize);
		});
	},

	ShowPhoto:function(object){
		_500pxDiscovery.parameters.activeItem=object;
		var photoid=$(object).attr("data-photoid");
		var img=$(".bigphoto");
		img.attr("src",$(object).attr("data-thum"));
		if($("#photo:visible").length==0){
			$("#photo").fadeIn();
		}

		var bigPhoto=null;
		$.each(_500pxDiscovery.bigPhotos,function(i,n){
			if(n.data.photo.id==parseInt(photoid)){
				bigPhoto=n;
				img.attr("src",n.photo.src);
				_500pxDiscovery.parameters.currentPhoto=img;
			}
		});

		if(bigPhoto==null){
			$("#loading").fadeIn();
			_500px.api(
		    	'/photos/'+photoid, 
		    	function (response) {
		    		var photo=new Image();
		    		photo.src=response.data.photo.image_url;
		    		_500pxDiscovery.bigPhotos.push({photo:photo,data:response.data});
		    		img.attr("src",response.data.photo.image_url);
		    		_500pxDiscovery.parameters.currentPhoto=img;
		    		$("#loading").fadeOut();
		    	}
			);			
		}
	},

	AdjustImagePosition:function(img){
		if($(img).attr("src").indexOf("v=")<0){
			var h=$("#photo-container").height();
			var w=$("#photo-container").width();
			var imgH,imgW;

			var imgObj=new Image();
			imgObj.src=$(img).attr("src");

			if(h>w){

				if(imgObj.width>=imgObj.height){
					imgW=w;
					imgH=imgObj.height/(imgObj.width/w);
				}
				else
				{
					if(imgObj.width>w){
						imgW=w;
						imgH=imgObj.height/(imgObj.width/w);
					}
					else
					{
						imgH=h;
						imgW=imgObj.width/(imgObj.height/h);
					}

				}
			}
			else
			{

				imgH=h;
				imgW=imgObj.width/(imgObj.height/h);
			}

		    $(img).animate({"width":imgW,"height":imgH,"margin-top":(h-imgH)/2},200);
		    _500pxDiscovery.parameters.swipeStart=false;	
		}
	}

};

$(document).ready(function () {

	var myElement = document.getElementById('bigphoto');
	var img=$('#bigphoto');

	// create a simple instance
	// by default, it only adds horizontal recognizers
	var mc = new Hammer(myElement);
	//mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
	mc.add( new Hammer.Tap({ event: 'singletap' }) );
	//mc.get('doubletap').recognizeWith('singletap');
	mc.get('singletap').requireFailure('doubletap');

	//var rotate = new Hammer.Rotate();
	//var pinch = new Hammer.Pinch();
	//pinch.recognizeWith(rotate);
	//mc.add([pinch, rotate]);

	// listen to events...
	mc.on("singletap", function(ev) {
    	switch(ev.type){
    		case "singletap":
    			$("#photo").fadeOut();
    			break;
    	}
	});
	mc.on("panleft panright press tap pinch", function(ev) {

	    switch(ev.type){

	    	case "panleft":
	    		if(!_500pxDiscovery.parameters.swipeStart){
	    			if($(_500pxDiscovery.parameters.activeItem).next().length>0){
						img.toggle("slide",{direction:"left"},function(){
							//img.panzoom("reset");
							img.attr("src",$(_500pxDiscovery.parameters.activeItem).next().attr("data-thum"));
							img.toggle("slide",{direction:"right"},function(){
								_500pxDiscovery.ShowPhoto($(_500pxDiscovery.parameters.activeItem).next());
							});
							
						});

						_500pxDiscovery.parameters.swipeStart=true;
					}
					else
					{
						$("#loading").fadeIn();
						_500pxDiscovery.parameters.swipeStart=true;
						_500pxDiscovery.fetchPicture(_500pxDiscovery.parameters.global,_500pxDiscovery.parameters.page+1,_500pxDiscovery.parameters.imageSize,function(){
							img.toggle("slide",{direction:"left"},function(){
								//img.panzoom("reset");
								img.attr("src",$(_500pxDiscovery.parameters.activeItem).next().attr("data-thum"));
								img.toggle("slide",{direction:"right"},function(){
									_500pxDiscovery.ShowPhoto($(_500pxDiscovery.parameters.activeItem).next());
								});
								
							});

						});
					}
	    				
	    		}
	    		break;

	    	case "panright":
	    		if(!_500pxDiscovery.parameters.swipeStart){
		    		if($(_500pxDiscovery.parameters.activeItem).prev().length>0){
						img.toggle("slide",{direction:"right"},function(){
							//img.panzoom("reset");
							img.attr("src",$(_500pxDiscovery.parameters.activeItem).prev().attr("data-thum"));
							img.toggle("slide",{direction:"left"},function(){
								_500pxDiscovery.ShowPhoto($(_500pxDiscovery.parameters.activeItem).prev());
							});
							
						});
						_500pxDiscovery.parameters.swipeStart=true;	
					}
						
				}
	    		break;
	    	case "tap":
	    		$("#photo").fadeOut();
	    		break;

	    	case "press":
	    		$("#loading").fadeIn();
	    		_500pxDiscovery.parameters.cropImage=$('#photo-container>img');
	    		var canvasData,cropBoxData;
			  	_500pxDiscovery.parameters.cropImage.cropper({
			  	    autoCropArea: 0.9,
			  	    built: function () {
			  	        _500pxDiscovery.parameters.cropImage.cropper('setCanvasData', canvasData);
			  	        _500pxDiscovery.parameters.cropImage.cropper('setCropBoxData', cropBoxData);
			  	        $("#loading").fadeOut();
			  	        $("#photocrop-bar").show();
			    	}
			    });
	    		break;

	    	case "doubletap":
	    		img.panzoom("reset");
	    		break;

	    	case "pinch":
	    		alert(1);
	    		break;
	    }
	});

	
	/*
	$.event.special.swipe.scrollSupressionThreshold = 100; // More than this horizontal displacement, and we will suppress scrolling.
	$.event.special.swipe.horizontalDistanceThreshold = 30; // Swipe horizontal displacement must be more than this.
	$.event.special.swipe.durationThreshold = 500;  // More time than this, and it isn't a swipe.
	$.event.special.swipe.verticalDistanceThreshold = 75; // Swipe vertical displacement must be less than this.
	*/
	$('.bigphoto').bind("load",function(){
		//img.panzoom("reset");
		_500pxDiscovery.AdjustImagePosition(this);
	});

	//$(".bigphoto").panzoom();

	window.addEventListener("orientationchange", function() {
		_500pxDiscovery.AdjustImagePosition($('.bigphoto'));
	}, false);



	$(window).scroll(function() {
	   	if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
	   		if(_500pxDiscovery.parameters.page<_500pxDiscovery.parameters.totalPage & _500pxDiscovery.parameters.loading==false){
	   			_500pxDiscovery.fetchPicture(_500pxDiscovery.parameters.global,_500pxDiscovery.parameters.page+1,_500pxDiscovery.parameters.imageSize);	
	   		}
	       
	   	}
	});

    _500px.init({
      sdk_key: 'ece6ce49f7bc937ed981fad549cf22b176126ffc'
    });
    _500pxDiscovery.mainCategoryBtnInital();
    _500pxDiscovery.fetchPicture(_500pxDiscovery.parameters.global,_500pxDiscovery.parameters.page,_500pxDiscovery.parameters.imageSize);

    $(document.body).on('click', '[data-method]', function () {
    	_500pxDiscovery.parameters.cropData=$(this).data();

    	if (_500pxDiscovery.parameters.cropData.method) {
	        _500pxDiscovery.parameters.cropData = $.extend({}, _500pxDiscovery.parameters.cropData); // Clone a new one
	        _500pxDiscovery.parameters.cropResult=_500pxDiscovery.parameters.cropImage.cropper(_500pxDiscovery.parameters.cropData.method, _500pxDiscovery.parameters.cropData.option);
	        _500pxDiscovery.parameters.cropImage.cropper('destroy');
	        $("#photocrop-bar").hide();
	        $("#canvas-container").html(_500pxDiscovery.parameters.cropResult);
	        $("#cropresult").fadeIn();

      	}
    });

    $("#bt-cancel").on("click",function(){
    	$("#photocrop-bar").hide();
    	_500pxDiscovery.parameters.cropImage.cropper('destroy');
    });

    $("#bt-share").on("click",function(){
    	var context = $("#canvas-container>canvas")[0];
    	var dataURL = context.toDataURL();
    	window.plugins.socialsharing.share('',
	      '',
	      dataURL, // check the repo for other usages
	      '')
	});

	$("#bt-remove").on("click",function(){
		$("#cropresult").fadeOut();
		_500pxDiscovery.parameters.cropImage.cropper('destroy');
	});

	$("#bt-save").on("click",function(){
		var canvas=$("#canvas-container>canvas")[0];
		window.savephotoplugin(canvas,"image/png",device.version,function(val){ 
		  	//returns you the saved path in val	
			alert("Photo Saved: " + val);	
		});		
	});

	document.addEventListener("backbutton", function(e){
		if($("#cropresult:visible").length>0){
			$("#cropresult").fadeOut();
			return false;
		}

		if($("#photo:visible").length>0){
			$("#photo").fadeOut();
			return false;
		}

	    navigator.app.exitApp();

	}, false);
})
