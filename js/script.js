var w = document.getElementById('plot').clientWidth,
    h = document.getElementById('plot').clientHeight,
    r = 5;

var plot = d3.select('#plot').append('svg')
    .attr('width',w)
    .attr('height',h-75)
    .append('g')
    .attr('transform','translate(0,50)');

//projection
var projection = d3.geoMercator(),
    path = d3.geoPath().projection(projection);

projection
	.center([-71,42])
	.scale(350000);

//Color scale
var colorLowIncome = '#D0DFEC',
    colorHighIncome = '#4682B4',
    colorLowRace = '#EBC7C7',
    colorHighRace = '#B22222',
    colorLowRent = 'C5D6CC',
    colorHighRent = '195E35';

var incomeThreshold = 24000,
    rentThreshold = 420;

var scaleColorRent = d3.scaleThreshold()
    .domain([rentThreshold, rentThreshold*2, rentThreshold*3, rentThreshold*4, rentThreshold*5])
    .range([colorLowRent, '9AB8A6','6F9A80','447C5A',colorHighRent])

var scaleColorIncome = d3.scaleThreshold()
    .domain([incomeThreshold,incomeThreshold*2,incomeThreshold*3,incomeThreshold*4,incomeThreshold*5])
    .range([colorLowIncome,'#ADC7DE','#8BB0D0','#6899C3',colorHighIncome])

var scaleColorRace = d3.scaleThreshold()
    .domain([0.2,0.4,0.6,0.8,1.0])
    .range([colorLowRace,'#DC9D9D','#CE7474','#C04B4B',colorHighRace])

var airportText = [
      {name:'Logan Airport', location:[-71.015, 42.361], color: '#ffffff', size: 14, stroke: true},
      {name:'Logan Airport', location:[-71.015, 42.361], color: '#666666', size: 14, stroke: false}      
    ];

//Set ScrollMagic controller
var controller = new ScrollMagic.Controller();

//make plot fixed
$('#plot').affix({
    offset: {
       top: $('#plot').offset().top
    }
});

//import data
d3.queue()
  .defer(d3.csv,'data/eviction_EB_latlong.csv', parseEviction)
  .defer(d3.csv,'data/demographic_data.csv', parseDemo)
  .defer(d3.json,'data/eastBostonCensusTracts.geojson')
  .defer(d3.json,'data/Boston_Neighborhoods.geojson')
  .await(dataLoaded);
 
function dataLoaded(err, eviction, demo, geo, bos) {

    var dataMapping = d3.map(demo, function(d){ return d.geoid });

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
		    .style('stroke','#666666')
		    .style('opacity',0.85);
    
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
		    .style('stroke-width','1.5px')
		    .style('stroke','white')
            .style('fill','none')
		    .style('opacity',0.85);

    //Plot the text of airport
    plot.append('g')
        .attr('class','airportText')
        .attr('transform','translate(-75,3100)')
            .selectAll('.airport')
            .data(airportText)
            .enter()
            .append('text')
            .attr('class','airport')
            .text(function(d){return d.name})
            .attr('transform',function(d){
                var xy = projection(d.location);
                return 'translate('+xy[0]+','+xy[1]+')';
            })
            .style('text-anchor','middle')
            .style('font-size', function(d){return d.size})
            .style('font-family', 'BentonSansCond-Regular')
            .style('stroke-width', function(d){
                if(d.stroke == true){
                    return '2px'
                } else {
                    return '0px'
                }
            })
            .style('stroke', '#ffffff')
            .style('fill', function(d){return d.color})
            .style('visibility','hidden')

    reason = d3.nest().key(function(d){return d.reason})
        .entries(eviction);

    //TEXT for reason
    plot.append('text')
        .attr('class','reasonText')
        .style('font-family','BentonSansCond-Regular, Helvetica, sans-serif')
        .style('font-size','16px')
        .text('114 Overdue Rent')
        .attr('x', 42.5)
        .attr('y', 85);

    plot.append('text')
        .attr('class','reasonText')
        .style('font-family','BentonSansCond-Regular, Helvetica, sans-serif')
        .style('font-size','16px')
        .text('9 Combination of Factors')
        .attr('x', 42.5)
        .attr('y', 305);

    plot.append('text')
        .attr('class','reasonText')
        .style('font-family','BentonSansCond-Regular, Helvetica, sans-serif')
        .style('font-size','16px')
        .text('36 Other')
        .attr('x', 42.5)
        .attr('y', 365);

    plot.append('text')
        .attr('class','reasonText')
        .style('font-family','BentonSansCond-Regular, Helvetica, sans-serif')
        .style('font-size','16px')
        .text('2 Unknown')
        .attr('x', 42.5)
        .attr('y', 465);

    //set lat long position for every circle
	eviction.forEach((d) => {
	    var xy = projection([d.long, d.lat]);
	        d.x = xy[0];
	        d.y = xy[1];
	})

    // Plot circle
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
        .style('opacity',0.6);

    //Scene of all evictions
    var sceneA = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-1', 
    	  triggerHook: 0,
    	  reverse: true
        })
        // .addIndicators()
        .on('start', function(){

           d3.select('#plot').classed('fixed',false);
           d3.selectAll('.reasonText').style('visibility','hidden');

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',0)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',0)

		    circleEnter
		        .attr('cx',function(d){return d.init_x*2.75 + 50})
		        .attr('cy',function(d){return d.init_y*2.75 + 50})

	        console.log('Trigger 1')
		})

    //Reason
    var sceneB = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-2', 
    	  triggerHook: 0,
    	  reverse: true
        })
        // .addIndicators()
        .on('start', function(){

           d3.select('#plot').classed('fixed',true);
           d3.selectAll('.reasonText').style('visibility','visible');
           d3.select('.key').style('visibility','hidden');
           d3.selectAll('.airport').style('visibility','hidden');

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',0)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',0)

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.reason_x*2.75 + 50})
               .attr('cy',function(d){return d.reason_y*2 + 100})

		    console.log('Trigger 2')
        })
    
    //Rent
    var sceneC = new ScrollMagic.Scene({
          triggerElement: '#trigger-3', 
          triggerHook: 0,
          reverse: true
        })
        // .addIndicators()
        .on('start', function(){

           d3.selectAll('.reasonText').style('visibility','hidden');
           d3.select('#key_rent').style('visibility','visible')
           d3.select('#key_income').style('visibility','hidden');
           d3.select('#key_race').style('visibility','hidden');
           d3.selectAll('.airport').style('visibility','visible');

           d3.select('.baseMap')
             .transition().duration(500)
             .style('opacity',1)
           
           d3.select('.censusMap')
             .transition().duration(500)
             .style('opacity',0.85)

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.x-75})
               .attr('cy',function(d){return d.y+3100})

           plot.selectAll('.censusTract')
               .style('fill','none')
               .transition().duration(500)
               .style('fill',function(d){
                     var rentMapping = dataMapping.get(d.properties.geoid).median_gross_rent
                     if(rentMapping == 0){
                       return '#d3d3d3';
                     } else {
                       return scaleColorRent(rentMapping);
                     }
                });

            console.log('Trigger 3')
        })

    //Income
    var sceneD = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-4', 
    	  triggerHook: 0,
    	  reverse: true
        })
        // .addIndicators()
        .on('start', function(){

           d3.select('#key_income').style('visibility','visible');
           d3.select('#key_race').style('visibility','hidden');
           d3.select('#key_rent').style('visibility','hidden')

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',1)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',0.85)

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.x-75})
               .attr('cy',function(d){return d.y+3100})

    	   plot.selectAll('.censusTract')
    	       .transition().duration(500)
    	       .style('fill',function(d){
    		    	 var incomeMapping = dataMapping.get(d.properties.geoid).median_household_income
                     if(incomeMapping == 0){
                       return '#d3d3d3';
                     } else {
                       return scaleColorIncome(incomeMapping);
                     }
		        })

		    console.log('Trigger 4')
        })

    //Race
    var sceneE = new ScrollMagic.Scene({
    	  triggerElement: '#trigger-5', 
    	  triggerHook: 0,
    	  reverse: true
        })
        // .addIndicators()
        .on('start', function(){

           d3.select('#key_rent').style('visibility','hidden');
           d3.select('#key_income').style('visibility','hidden');
           d3.select('#key_race').style('visibility','visible');

    	   d3.select('.baseMap')
    	     .transition().duration(500)
    	     .style('opacity',1)
    	   
    	   d3.select('.censusMap')
    	     .transition().duration(500)
    	     .style('opacity',0.85)

           plot.selectAll('circle')
               .transition().duration(500)
               .attr('cx',function(d){return d.x-75})
               .attr('cy',function(d){return d.y+3100})

    	   plot.selectAll('.censusTract')
    	       .transition().duration(500)
    	       .style('fill',function(d){
    		    	var raceMapping = dataMapping.get(d.properties.geoid).percentage_hispanic_latino
                    if(raceMapping == 0){
                      return '#d3d3d3';
                    } else {
                      return scaleColorRace(raceMapping);
                    }
		       })

		    console.log('Trigger 5')
        })

    controller.addScene([sceneA, sceneB, sceneC, sceneD, sceneE]);

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
		percentage_hispanic_latino: +d['percentage_hispanic_latino'],
        median_gross_rent: +d['median_gross_rent']
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




