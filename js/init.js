/**
 * Created by rob on 5/4/14.
 */

function adjustNavPlaceholderForMobile(){
    var nav = document.getElementsByTagName("nav")[0];
    document.getElementById("nav-placeholder").style.height = [nav.clientHeight, "px"].join("");
}

function LayoutManager(){
    var inchReference = document.createElement('div');

    inchReference.style.width = "1in";
    inchReference.style.visibility = "hidden";
    inchReference.style.position = "absolute";
    if(!getComputedStyle(inchReference, "").width){
        document.body.appendChild(inchReference)

    }

    this.calculateLayout = function(){
        var pixelsPerInch = getComputedStyle(inchReference, "").width;
        pixelsPerInch = pixelsPerInch.substring(0, pixelsPerInch.length-2);
        this.viewWidth = window.innerWidth / pixelsPerInch;
        this.viewHeight = window.innerHeight / pixelsPerInch;
    };
}
function initialize(){
    l = new LayoutManager();

    function doAdjust(){
        l.calculateLayout();

        var nav = document.getElementsByTagName("nav")[0];
        var content = document.getElementById("content");
        if(l.viewWidth < 5.5 || l.viewHeight < 3.2){
            document.body.className = "smallscreen";
        //    content.style.setProperty("padding-bottom", getComputedStyle(nav, "").width);
        //    content.style.setProperty("padding-left", 0);

        }else{
        //    content.style.setProperty("padding-bottom", 0);
        //    content.style.setProperty("padding-left", getComputedStyle(nav, "").width);
            document.body.className = "";
        }

    }
    doAdjust();

    window.addEventListener("resize", doAdjust);

    var views = {};
    views.about = document.getElementById("about");
    views.projects = document.getElementById("projects");
    views.resume = document.getElementById("resume");

    var nav = document.getElementsByTagName("nav")[0];
    var anchors = nav.getElementsByTagName("a");

    function navigate(clickEvent){

        var i= 0, iLen=anchors.length;
        for(i; i<iLen; i++){
            anchors[i].className = "";
        }
        clickEvent.currentTarget.className = "active"
    }

    var i= 0, iLen=anchors.length;
    for(i; i<iLen; i++){
        anchors[i].addEventListener("click", navigate)
    }



}