
function initialize(){

    var nav = document.getElementsByTagName("nav")[0];
    var anchors = nav.getElementsByTagName("a");

    function navigate(selectedAnchor){
        selectedAnchor.className = "active";
        var i= 0, iLen=anchors.length;
        for(i; i<iLen; i++){
            var displayVal = (selectedAnchor === anchors[i]) ? "" : "none";
            var classNameToApply = (selectedAnchor === anchors[i]) ? "active" : "";
            var sectionId = anchors[i].href.split("#");
            if(sectionId.length > 1){
                var section = document.getElementById(sectionId[1]);
                section.style.setProperty("display", displayVal);
                anchors[i].className = classNameToApply;
            }
        }
    }

    function onAnchorClick(clickEvent){
        var selectedAnchor = clickEvent.currentTarget;
        navigate(selectedAnchor);
    }

    var i= 0, iLen=anchors.length;
    for(i; i<iLen; i++){
        anchors[i].addEventListener("click", onAnchorClick);
    }

    var hash = window.location.hash;
    if(hash){
        var selector = [
            "a[href=\"#",
            hash.substring(1),
            "\"]"
        ].join("");
    }
    navigate(document.querySelector(selector));

    function expand(control){
        var divToExpandId = control.getAttribute("data-expands");
        document.getElementById(divToExpandId).style.setProperty("display", "");
        control.textContent = "(less...)";
    }

    function contract(control){
        var divToContractId = control.getAttribute("data-expands");
        console.log(divToContractId)
        document.getElementById(divToContractId).style.setProperty("display", "none");
        control.textContent = "(more...)";
    }

    function onExpanderClick(event){
        var expander = event.target;
        if(expander.textContent === "(less...)"){
            contract(expander)
        }else{
            expand(expander);
        }
    }

    var expanders = document.getElementsByClassName("expander");
    var i= 0, iLen=expanders.length;
    for(i; i<iLen; i++){
        expanders[i].onclick = onExpanderClick;
    }

}