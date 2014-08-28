//DOM utils

function removeClass(cls, node){
    var replacer = new RegExp(cls, 'g');
    var oldClassName = node.className;
    node.className = (oldClassName ? oldClassName.replace(replacer, "") : "").trim();
}

function addClass(cls, node){
    removeClass(cls, node);
    node.className = [node.className||"", cls].join(" ").trim();
}




// Routing
var LOCAL_URL_PATTERN = "#";

function onHashChange(event){
    var newURL = event.newURL;
    parseURL(newURL);
}

function parseURL(url){
    var localChange = url.split(LOCAL_URL_PATTERN);
    var targetURI = "";
    if(localChange.length > 1){
        localChange = localChange[1];
        var uris = localChange.split('/');
        var uriLen = uris.length;
        if(uriLen > 0){
            targetURI = uris[uriLen-1];
        }
    }
    setNewActiveSection(targetURI);
}



// Routing use case
var DEFAULT_SECTION = "about";
function setNewActiveSection(sectionId){
    if(sectionId === ""){
        sectionId = DEFAULT_SECTION;
    }

    var sections = document.querySelectorAll("section[id]");
    for(var s in sections){
        if(sections.hasOwnProperty(s)){
            removeClass("active", sections[s]);
        }
    }
    var anchors = document.querySelectorAll("nav [href]");
    for(var a in anchors){
        if(anchors.hasOwnProperty(a)){
            removeClass("active", anchors[a]);
        }
    }


    var links = document.querySelectorAll('[href]');
    for(var l in links){
        if(links.hasOwnProperty(l)){
            var link = links[l];
            if(link.href && link.href.indexOf(sectionId) > -1){
                addClass("active", link);
            }
        }
    }

    var section = document.getElementById(sectionId);
    scrollTo(0, section.offsetTop);
    addClass("active", section);
}



//"Boot"
window.onload = function(){

    window.addEventListener("hashchange", onHashChange);
    parseURL(window.location.href);

};