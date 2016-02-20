

function forEach(list, action){
    var i, limit;
    for(i=0, limit=list.length; i<limit; i++){
        action(list[i]);
    }
}


function traverse(streamLinks, action){
    var i, limit, streamLink, results = [];
    for(i=0, limit = streamLinks.length; i<limit; i++){
        streamLink = streamLinks[i];
        results = results.concat(action(streamLink));
    }
    return results;
}

function traverser(getter){
    return function me(link){
        var connections = [[link.source.name, link.target.name]];
        var next = getter(link);
        if(next){
            return connections.concat(
                traverse(
                    next,
                    me
                )
            );
        }else{
            return connections;
        }
    }
}

function previous(link){
    return link.source ? link.source.targetLinks : null;
}

function next(link){
    return link.target ? link.target.sourceLinks : null;
}

var traverseSources = traverser(previous);
var traverseTargets = traverser(next);


function getAllNodePairs(node){

    var upstreamLinks = traverse(
        node.targetLinks,
        traverseSources
    );
    var downstreamLinks = traverse(
        node.sourceLinks,
        traverseTargets
    );

    return upstreamLinks.concat(downstreamLinks);
}

function getAllNodePairsForLink(link){

    var upstreamLinks = traverse(
        link.source.targetLinks,
        traverseSources
    );
    var downstreamLinks = traverse(
        link.target.sourceLinks,
        traverseTargets
    );

    return [[link.source.name, link.target.name]].concat(upstreamLinks, downstreamLinks);
}


function getLinkSelector(srcNodeName, targetNodeName){
    return 'path[data-source="' + srcNodeName + '"][data-target="' + targetNodeName + '"]'
}

function getNodeSelector(nodeName){
    return '.node[data-name="'+nodeName+'"]';
}


function flattenNodeList(list){
    var items = {};
    forEach(list, function(item){
        items[item[0]] = true;
        items[item[1]] = true;
    });
    return Object.keys(items);
}



function applyClassToNodeSet(nodePairs, cls){
    var nodeNames = flattenNodeList(nodePairs);
    forEach(
        nodePairs,
        function(nodePair){
            d3.select(getLinkSelector(nodePair[0], nodePair[1]))
                .attr('class', cls+' link');
        }
    );
    forEach(nodeNames, function(nodeName){
        d3.select(getNodeSelector(nodeName))
            .attr('class', cls+' node')
    });
}

function onMouseEnterNode(event){
    applyClassToNodeSet(getAllNodePairs(event), 'active');
}

function onMouseLeaveNode(event){
    applyClassToNodeSet(getAllNodePairs(event), '');
}


function onMouseEnterLink(event){
    applyClassToNodeSet(getAllNodePairsForLink(event), 'active');
}

function onMouseLeaveLink(event){
    applyClassToNodeSet(getAllNodePairsForLink(event), '');
}
