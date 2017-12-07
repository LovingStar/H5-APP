mui.init();
document.addEventListener('plusready',onPlusReady,false);
function onPlusReady(){}

/**
 * 调取摄像头拍照
 * @param {照片序号} str
 */
var resetPhoto = false; //是否重新拍照
window.addEventListener("resetPhoto",function(){
	resetPhoto = true;
})
var w = null;
var photo; //当前调用摄像头的对象
var tTrue = false; //做控制


function choiceMdode(that,str){
	var btnArray = [{title:"我的相册"},{title:"拍照"}];
	plus.nativeUI.actionSheet( {
		cancel:"取消",
		buttons:btnArray
	}, function(e){
		var index = e.index;
		switch (index){
			case 1:
				plus.gallery.pick(function(p) {
					plus.zip.compressImage({
						src:p,
						dst:p,
						quality:50,
						overwrite:true,
						clip:{
							top:"20%"
						}
					},
					function() {
						that.src = p;
						that.setAttribute("data-value","ok");
					},function(error) {
						alert("压缩失败");
					});
				},function(error){
					mui.toast("请重新选择");
				},{filter:"image"});
				break;
			case 2:
				getImage(that,str);					
				break;
		}
	} );
}

//
function getImage(that,str){
	if(w){
		return;
	}
	if(tTrue){
		tTrue = false;
		return;
	}
	var photoID = "photo" + str;
	photo = document.getElementById(photoID);
//	if ( that.getAttribute("data-value")=="ok" ) { 
//		var thisSrc = that.getAttribute("src");
//		var url = "camera_images.html";
//		w=plus.webview.create(url,url,{scrollIndicator:'none',scalable:false,popGesture:'none'},{preate:true,type:"basicImage"});
//		w.addEventListener( "loaded", function(){
//			w.evalJS( "loadMedia('"+thisSrc+"')" );
//		}, false );
//		w.addEventListener( "close", function() {
//			w = null;
//			if(resetPhoto){
//				resetPhoto = false;
//				photo.setAttribute("data-value","no");
//				setTimeout(function(){
//					doCapture(str);
//				},200);
//			}  
//		}, false );
//		setTimeout(function(){
//			w.show( "zoom-fade-out" );
//		},200);
//	}else{
		doCapture(str);
//	}
}
function doCapture(str){
	var cmr = plus.camera.getCamera();
	if(photo.getAttribute("data-tValue")=="ok"){
		photo.setAttribute("data-value","ok");
	} 
	cmr.captureImage(function(path){
		plus.gallery.save(path,function(){});
		plus.io.resolveLocalFileSystemURL(path,function(entry){
			photo.setAttribute("data-tValue","ok");
			photo.setAttribute("data-value","ok");
			var localurl = entry.toLocalURL();
			var img = new Image();
			img.src = localurl;
			plus.nativeUI.showWaiting();
			img.onload = function(){ 
				if(plus.os.name='Android'){
					EXIF.getData(img,function(){
						var ori = EXIF.getTag(this,"Orientation");
						orisAndroid(ori,localurl);
					});
				}else{
					plus.zip.compressImage({
						src:localurl,
						dst:localurl,
						quality:10,
						overwrite:true
					},
					function() {
						plus.nativeUI.closeWaiting();
						photo.src = localurl; 
					},function(error) {
						plus.nativeUI.closeWaiting();
						alert("压缩失败");
					});
				} 
			}
			
		})
	},function(error){
		mui.toast("未获取图片，请确认摄像头权限开启之后重新尝试");
	})
}
//判断当前选取图片方向
function orisAndroid(ori,path){
	switch(ori){
		case 1:
//			当为1的时候,显示正确
			rotateImage(0,path);
		  	break;
		case 3:
//			旋转180
			rotateImage(2,path);
		case 6:
//			顺时针旋转90
			rotateImage(1,path);
		case 9:
//			逆时针旋转90
			rotateImage(3,path);
		default:
			rotateImage(0,path);
	}
}
//旋转图片
function rotateImage(Ori,path){
	plus.zip.compressImage({
		src:path,
		dst:path,
		quality:50,
		overwrite:true,
		rotate:90*Ori  //旋转90度
	},
	function(){
		plus.nativeUI.closeWaiting();
		photo.src = path;
	},function(error){
		alert("压缩失败");
		plus.nativeUI.closeWaiting();
	}) 
} 