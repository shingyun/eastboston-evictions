var w = document.getElementById('plot').clientWidth,
    h = document.getElementById('plot').clientHeight,
    r = 5;

var plot = d3.select('#plot').append('svg')
    .attr('width',w)
    .attr('height',h-100)
    .append('g')
    .attr('transform','translate(0,0)');

var projection = d3.geoMercator(),
    path = d3.geoPath().projection(projection);

projection
	.center([-71,42])
	.scale(350000);

var colorLowPoint = '#ffffff',
    colorHightIncome = '#4682B4',
    colorHightRace = '#B22222';

var scaleColorIncome = d3.scaleLinear()
    .range([colorLowPoint,colorHightIncome])

var scaleColorRace = d3.scaleLinear()
    .range([colorLowPoint,colorHightRace])

var controller = new ScrollMagic.Controller();

d3.queue()
  .defer(d3.csv,'data/eviction_EB_latlong.csv', parseEviction)
  .defer(d3.csv,'data/demographic_data.csv', parseDemo)
  .defer(d3.json,'data/eastBostonCensusTracts.geojson')
  .defer(d3.json,'data/Boston_Neighborhoods.geojson')
  .await(dataLoaded);
  //
 
function dataLoaded(err, eviction, demo, geo, bos) {

    var dataMapping = d3.map(demo, function(d){ return d.geoid });

    scaleColorIncome.domain(d3.extent(demo,function(d){return d.median_household_income}))
    scaleColorRace.domain([0,1])

    //basemap
    plot.append('g')
        .attr('class','baseMap')
        .attr('transform','translate(-75,3100)')
	        .selectAll('.base')
	        .data(bos.features)
	        .enter()
	        .append('path')
	        .attr('class','base')
	        .attr('d',path)
		    .style('fill','none')
		    .style('stroke-width','1px')
		    .style('stroke','#969696')
		    .style('opacity',0.8);
    
    //east Boston
    plot.append('g')
        .attr('class','censusMap')
        .attr('transform','translate(-75,3100)')
	        .selectAll('.censusTract')
	        .data(geo.features)
	        .enter()
	        .append('path')
	        .attr('class','censusTract')
	        .attr('d',path)
		    .style('fill',function(d){
		    	 var incomeMapping = dataMapping.get(d.properties.geoid).median_household_income
		    	 //var raceMapping = dataMapping.get(d.properties.geoid).percentage_hispanic_latino
                 return scaleColorIncome(incomeMapping);
		    })
		    .style('stroke-width','2px')
		    .style('stroke','white')
		    .style('opacity',0.8);



    reasonArr = d3.map(eviction, function(d){return d.reason}).keys();

    nestByReason = d3.nest().key(function(d){return d.reason})
        .entries(eviction);

        console.log(nestByReason)

//////////////




    d3.select('#btn-reason').on('click',function(){
    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',0)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',0)

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.reason_x*3 + 50})
               .attr('cy',function(d){return d.reason_y*2 + 80})
    })


    //set lat long position for every circle
	eviction.forEach((d) => {
	    var xy = projection([d.long, d.lat]);
	        d.x = xy[0];
	        d.y = xy[1];
	})

    d3.select('#btn-income').on('click',function(){

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',1)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',1)

    	   plot.selectAll('.censusTract')
    	       .transition().duration(500)
    	       .style('fill',function(d){
		    	 var incomeMapping = dataMapping.get(d.properties.geoid).median_household_income
		    	 // var raceMapping = dataMapping.get(d.properties.geoid).percentage_hispanic_latino
                 return scaleColorIncome(incomeMapping);
		        })

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.x-75})
               .attr('cy',function(d){return d.y+3100})
    })

    d3.select('#btn-race').on('click',function(){

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',1)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',1)

    	   plot.selectAll('.censusTract')
    	       .transition().duration(500)
    	       .style('fill',function(d){
		    	 // var incomeMapping = dataMapping.get(d.properties.geoid).median_household_income
		    	 var raceMapping = dataMapping.get(d.properties.geoid).percentage_hispanic_latino
                 return scaleColorRace(raceMapping);
		        })
    	   plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.x-75})
               .attr('cy',function(d){return d.y+3100})
    })


		    var circle = plot
		        .selectAll('.circle')
		         .data(eviction);

		    //Enter
		    var circleEnter = circle
		        .enter()
		        .append('circle')
		        .attr('class','circle')
		        .attr('r',6)
		        .style('stroke-width','0.5px')
		        .style('stroke','#fff')
		        .style('fill','#111')
		        .style('opacity',0.5);

    ////Scroll function setting////
		    // $('#plot').on('scroll',function(e){
		    // 	console.log(this);
		    //     if(this.scrollTop > 50){
		    //     	$('#plot').addClass('fixed');
		    //     } else{
		    //     	$('#plot').removeClass('fixed');
		    //     }
		    // })

    //All eviction

    // var scene = new ScrollMagic.Scene({
    // 	  triggerElement: '#trigger-0', 
    // 	  offset: -(document.documentElement.clientHeight),
    // 	  triggerHook: 0,
    // 	  reverse: true
    //     })
    //     .on('start', function(){

    // 	   d3.select('.baseMap')
    // 	     .transition().duration(500)
    // 	     .style('opacity',0)
    	   
    // 	   d3.select('.censusMap')
    // 	     .transition().duration(500)
    // 	     .style('opacity',0)

		  //   circleEnter
		  //       .attr('cx',function(d){return d.init_x*3 + 50})
		  //       .attr('cy',function(d){return d.init_y*3 + 50})

	   //      console.log('Trigger 1')
    // })


    var sceneA = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-1', 
    	  offset: -(document.documentElement.clientHeight),
    	  triggerHook: 0,
    	  reverse: true
        })
        .on('start', function(){

           d3.select('#plot').classed('fixed',false);

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',0)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',0)

		    circleEnter
		        .attr('cx',function(d){return d.init_x*3 + 50})
		        .attr('cy',function(d){return d.init_y*3 + 50})

	        console.log('Trigger 1')
		})

    //Reason
    var sceneB = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-2', 
    	  // offset: -(document.documentElement.clientHeight),
    	  triggerHook: 0,
    	  reverse: true
        })
        .on('start', function(){

           d3.select('#plot').classed('fixed',true);

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',0)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',0)

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.reason_x*3 + 50})
               .attr('cy',function(d){return d.reason_y*2 + 80})

		    console.log('Trigger 2')
        })

    var sceneC = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-3', 
    	  // offset: -(document.documentElement.clientHeight),
    	  triggerHook: 0,
    	  reverse: true
        })
        .on('start', function(){

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',1)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',1)

    	   plot.selectAll('.censusTract')
    	       .transition().duration(500)
    	       .style('fill',function(d){
		    	 var incomeMapping = dataMapping.get(d.properties.geoid).median_household_income
		    	 // var raceMapping = dataMapping.get(d.properties.geoid).percentage_hispanic_latino
                 return scaleColorIncome(incomeMapping);
		        })

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.x-75})
               .attr('cy',function(d){return d.y+3100})

		    console.log('Trigger 3')
        })


    var sceneD = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-4', 
    	  // offset: -(document.documentElement.clientHeight),
    	  triggerHook: 0,
    	  reverse: true
        })
        .on('start', function(){

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',1)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',1)

    	   plot.selectAll('.censusTract')
    	       .transition().duration(500)
    	       .style('fill',function(d){
		    	 // var incomeMapping = dataMapping.get(d.properties.geoid).median_household_income
		    	 var raceMapping = dataMapping.get(d.properties.geoid).percentage_hispanic_latino
                 return scaleColorRace(raceMapping);
		        })
    	   plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.x-75})
               .attr('cy',function(d){return d.y+3100})

		    console.log('Trigger 4')
        })


    controller.addScene([sceneA, sceneB, sceneC, sceneD]);



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
		long: +d['longitude'],
		init_x: +d['init_x'],
		init_y: +d['init_y'],
		reason_x: +d['reason_x'],
		reason_y: +d['reason_y']
	}
}

function parseDemo(d){
	return{
		geoid: d['geoid'],
		name: d['name'],
		median_household_income: +d['median_household_income'],
		percentage_hispanic_latino: +d['percentage_hispanic_latino']
	}
}

//LEAFLET

// var baseMap = L.map('plot').setView([42.376,-71.010],12);

// L.tileLayer('https://api.mapbox.com/styles/v1/smilein/cjd3iju8m4cwn2rnutrll54f1/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic21pbGVpbiIsImEiOiJjaXpuODFsdTEwMzF3MnFvMTJsd2RodTFpIn0.g0uREfYE5sFsG5N3dUe_VQ', {
//      maxZoom: 15,
// 	 minZoom: 11,
// 	 id: 'mapbox.streets',
// 	 accessToken: 'pk.eyJ1Ijoic21pbGVpbiIsImEiOiJjaXpuODFsdTEwMzF3MnFvMTJsd2RodTFpIn0.g0uREfYE5sFsG5N3dUe_VQ'
// }).addTo(baseMap);

// var mapSVG = d3.select(baseMap.getPanes().overlayPane).append('svg');
//     mapG = mapSVG.append('g').attr('class','leaflet-zoom-hide');

    //TRYING LEAFLET
    // function mapPoint(x,y){
    // 	var point = mapSVG.latLngToLayerPoint(new L.LatLng(y,x));
    // 	this.stream.point(point.x, point.y);
    // }

    // var transform = d3.geoTransform({point: mapPoint}),
    //     path = d3.geoPath().projection(transform)

    // var feature = mapSVG
    //         .selectAll('.censusTract')
    //         .data(geo.features)
    //         .enter()
    //         .append('path')
    //         .attr('class','censusTract')
    //         .attr('d',path)
	   //      .style('fill','#E6E6E9')
	   //      .style('stroke-width','1px')
	   //      .style('stroke','#969696')
	   //      .style('opacity',0.8);

    // var bounds = path.bounds(geo),
    //     topLeft = bounds[0],
    //     bottomRight = bounds[1];

    // mapSVG.attr('width',bottomRight[0]-topLeft[0])
		  // .attr("height", bottomRight[1] - topLeft[1])
		  // .style("left", topLeft[0] + "px")
		  // .style("top", topLeft[1] + "px");
    
    // mapG.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");




