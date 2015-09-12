window.Router = {

    routingTree: {},

    isRouteParameter: function(routePart){
        return (routePart.length > 0 && routePart[0] == ':');
    },

    defineRoute: function(route, actions){
        var routeParts = route.split('/');


        var i, limit = routeParts.length, routePart, routePartName, currentBranch = this.routingTree;
        for(i=0; i<limit; i++){
            routePart = routeParts[i];

            routePartName = this.isRouteParameter(routePart) ? '/parameter' : routePart;

            if(!currentBranch[routePartName]){
                currentBranch[routePartName] = {};
            }

            currentBranch = currentBranch[routePartName];

        }

        currentBranch['/name'] = route;


        if(actions.enter){
            if(!currentBranch['/enter']){
                currentBranch['/enter'] = [];
            }
            currentBranch['/enter'].push(actions.enter);
        }

        if(actions.exit){
            if(!currentBranch['/exit']){
                currentBranch['/exit'] = [];
            }
            currentBranch['/exit'].push(actions.exit);
        }


    },


    getRoutingNode: function(route){
        var routeParts = route.split('/');

        var parameters = [];

        var i, limit = routeParts.length, routePart,
            currentBranch = this.routingTree, parameter;

        for(i = 0; i < limit; i++){
            routePart = routeParts[i];

            if(currentBranch[routePart]){

                currentBranch = currentBranch[routePart];

            }else if(currentBranch['/parameter']){ // If a route part is not registered, see if it could be a parameter.

                currentBranch = currentBranch['/parameter'];
                parameters.push(routePart);

            }else{
                // route is not defined.
                return undefined;
            }
        }

        return {
            definition: currentBranch,
            parameters: parameters
        };
    },

    executeRouteActions: function(actions, parameters){
        if(actions){
            var i, limit = actions.length;
            for(i=0; i<limit; i++){
                actions[i].apply(null, parameters);
            }
        }
    },


    /**
     * This is a function that can be overwritten to allow for conditional redirection. (Useful
     * for authenticated vs unauthenticated views, conditional access to views for validation, etc..)
     *
     * Returning a string will cause the Router to parse it as a new hash.
     *
     * @param targetRoute
     * @param actualRoute
     * @param parameters
     */
    getRedirect: function(targetRoute, parameters, actualRoute){

    },

    applyRoute: function(route, force){
        if(route){


            var newRoutingNode = this.getRoutingNode(route);

            if(newRoutingNode && newRoutingNode.definition['/name']){ // only nodes with names are part of a route definition (we don't want to exit when transitioning to a non-route - allows for element hashes to work)

                var newParameters = newRoutingNode.parameters;

                var redirect = this.getRedirect(newRoutingNode.definition['/name'], newParameters, route);

                if(typeof redirect === 'string'){

                    window.location.hash = redirect; // will fire another hash change.

                }else{

                    var currentRouteNode = this.currentRouteNode;
                    if(currentRouteNode && (this.currentRoute !== route || force)){
                        if(currentRouteNode.definition['/exit'])
                            this.executeRouteActions(currentRouteNode.definition['/exit'], currentRouteNode.parameters);
                    }


                    this.executeRouteActions(newRoutingNode.definition['/enter'], newParameters);

                    this.currentRouteNode = newRoutingNode;
                    this.currentRoute = route;

                }
            }

        }

    },

    init: function(config){

        if(config){
            if(config.getRedirect){
                this.getRedirect = config.getRedirect;
            }
        }

        this.onHashChange = function(event){
            this.applyRoute(window.location.hash.substring(1));

        }.bind(this);
        this.applyRoute(window.location.hash.substring(1));

        window.addEventListener("hashchange", this.onHashChange);
        console.log(this.routingTree)

    }
};