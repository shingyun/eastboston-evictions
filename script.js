var w = document.getElementById('plot').clientWidth,
    h = document.getElementById('plot').clientHeight,
    r = 5;

var plot = d3.select('#plot').append('svg')
    .attr('width',w)
    .attr('height',h)
    .append('g')
    .attr('transform','translate(100,100)');

//Create projection
var projection = d3.geoEquirectangular();
var path = d3.geoPath()
    .projection(projection);

var controller = new ScrollMagic.Controller();

d3.queue()
  .defer(d3.csv,'data/eviction_EB_latlong.csv', parseEviction)
  .defer(d3.json,'data/acs2016_5yr_B23025_14000US25025090600.geojson')
  .defer(d3.json,'data/Boston_Neighborhoods.geojson')
  .await(dataLoaded);


function dataLoaded(err, eviction, geo, bos) {

	console.log(bos)

	//Umemployment B23025005

	projection.fitExtent([[0,0],[w,h],bos])
	    .scale(190);

    plot.append('g')
        .attr('class','map')
        .attr('transform','translate(0,0)')
            .selectAll('.censusTract')
            .data(bos.features)
            .enter()
            .append('path')
            .attr('class','censusTract')
            .attr('d',path)
	        .style('fill','#E6E6E9')
	        .style('stroke-width','1px')
	        .style('stroke','#969696')
	        .style('opacity',0.8);


 //    $('#plot').affix({
	//     offset: {
	// 		top: $('#plot').offset().top
	// 	}
	// });


    console.log(eviction);

    reasonArr = d3.map(eviction, function(d){return d.reason}).keys();

	////Set the scale////
	var scaleReason = d3.scaleBand()
	    .domain(['Rental Arrearage','Combination of Factors','Other','N/A'])
	    .range([50,550]);




    var allEviction = ForceLayout()
			    .x(w/4)
				.y(h/4)
				.r(r)
			    .collide(r*2)
			    .strength(-15);
	plot.datum(eviction)
		        .call(allEviction)

    
    d3.select('#btn-reason').on('click',function(){
    	    var reason = ForceLayout()	    
                .x(w/4)
		        .y(function(d){return scaleReason(d.reason)})
				.r(r)
			    .collide(r-2)
			    .strength(-15); 

            plot.datum(eviction)
		        .call(reason)
    })






    ////Scroll function setting////

    //All eviction
    // var sceneA = new ScrollMagic.Scene({
    // 	  triggerElement: 'trigger-0', 
    // 	  offset: -(document.documentElement.clientHeight),
    // 	  triggerHook: 0
    //     })
    //     .on('start', function(){

		  //    var allEviction = ForceLayout()
			 //    .x(w/4)
				// .y(h/4)
				// .r(r)
			 //    .collide(r*2)
			 //    .strength(0);
		  //   plot.datum(eviction)
		  //       .call(allEviction)

		  //   // d3.select('#sidebar').transition().style('opacity',1);

		  //   console.log('Trigger 0')
    //     })

    // //Reason
    // var sceneB = new ScrollMagic.Scene({
    // 	  triggerElement: 'trigger-1', 
    // 	  offset: -(document.documentElement.clientHeight),
    // 	  triggerHook: 0,
    // 	  reverse: true
    //     })
    //     .on('start', function(){
    //     	var reason = ForceLayout()	    
    //             .x(w/4)
		  //       .y(function(d){return scaleReason(d.reason)})
				// .r(r)
			 //    .collide(r)
			 //    .strength(30); 

    //         plot.datum(eviction)
		  //       .call(reason)

		  //   console.log('Trigger 1')
    //     })

    // controller.addScene([sceneA, sceneB]);




    //Reaseon
    // var reason = 


}


function parseEviction(d){

	return{
		id: d['Docket_Number'],
		reason: d['Reason_for_Proceedings'],
		landlordType: d['Landlord Type'],
		legelRep: d['Did_tenant_receive_legal_representation'],
		rent: +d['Tenants_monthly_rent_share_at_time_case_was_filed'],
		addr: d['add_complete'],
		lat: +d['latitude'],
		long: +d['longitude']
	}

}



