function ForceLayout(){

       var simulation, plot, _r, nodes;

       function exports(selection){

            var nodes = selection.datum() || [];

            var plot = selection;

            var charge = d3.forceManyBody().strength(_strength);

            var forceX = d3.forceX()
                .x(_x);

            var forceY = d3.forceY()
                .y(_y); 

            var collide = d3.forceCollide()
                .radius(_collision);

            var circle = plot
                .selectAll('.circle')
                .data(nodes);

            //Enter
            var circleEnter = circle
                .enter()
                .append('circle')
                .attr('class','circle')
                .attr('r',6)

            if (!simulation) {
              simulation = d3.forceSimulation(nodes);
            }

            force = simulation
                .force('charge',charge)
                .force('forceX',forceX)
                .force('forceY',forceY)
                .force('collide',collide)
                // .restart()
                // .alpha(1)
                .on('tick',function(){
                    //Update
                    circle.merge(circleEnter)
                          .style('fill','red')
                          .attr('cx', function(d){
                            return d.x
                          })
                          .attr('cy',function(d){
                            return d.y
                          });;

                    
                });//tick
            
            circle.exit().remove();

        }//exports

        // setting config values
	      // "Getter" and "setter" functions
        exports.x = function(_){
            	if(!arguments.length) return _x;
            	_x = _;
            	return this;
        }
 
        exports.y = function(_){
            	if(!arguments.length) return _y;
            	_y = _;
            	return this;
        }
            
        exports.strength = function(_){
            	if(!arguments.length) return _strength;
            	_strength = _;
            	return this;
        }

        exports.collide = function(_){
            if(!arguments.length) return _collision;
            _collision = _;
            return this;
        }

        exports.r = function(_){
            if(!arguments.length) return _r;
            _r = _;
            return this;
        }

        
        // function _tooltip(selection,node){
  
        //       var tooltip = selection.select('.custom-tooltip');
              
        //       tooltip.style('opacity',1);

        //       tooltip.select('.title').html(node.name);

        //       tooltip.select('.nationality').html('Nationality: '+node.nationality);

        //       tooltip.select('.des').html(node.name + ' worked at ' + node.org +', was killed in ' + node.countryKilled + ' in ' + node.year + ' because of '+ node.deathType + '.')

        // }
        
        return exports;

}//forceLayoutNoBind

