// Final Project (02.526 Interactive Data Visualisation)
// by Gian Jian Xiang & Rachel Ng

// =======================================================================================================================================
// Stacked Bar Chart of Religious Population Proportion by Ethnic Group
	
let marginBar = {top: 50, right: 70, bottom: 50, left: 70},
		widthBar = 650 - marginBar.left - marginBar.right,
		heightBar = 650 - marginBar.top - marginBar.bottom;

let svgBar = d3.select("#my_barchart")
	.append("svg")
		.attr("id", "svgBar")
		.attr("width", widthBar + marginBar.left + marginBar.right)
		.attr("height", heightBar + marginBar.top + marginBar.bottom)
	.append("g")
		.attr("transform",
					"translate(" + marginBar.left + "," + marginBar.top + ")");
					
let tooltipBar = d3.select("#my_barchart")
	.append("div")
		.attr("class", "tooltip-bar");
		
let legendBar = d3.select("#my_barchart")
	.append("div")
	.attr("id", "legend-bar");
	
legendBar.append("div")
	.attr("id", "legend-bar-header")
	.html("Religion");

legendBar.append("div")
	.attr("id", "legend-bar-values");

Promise.all([d3.csv("Religion by Ethnic Group.csv")]).then(data => {

	// List of religions
	let subgroups = data[0].columns.slice(1);
	
	let groups = ["Chinese", "Indians", "Malays", "Others"];
	//let groups = d3.map(data, function(d){return(d.Ethnic)}).values();
	
	let x = d3.scaleBand()
		.domain(groups)
		.range([0, widthBar])
		.padding([0.2])
	svgBar.append("g")
		.attr("class", "axis-marks")
		.attr("transform", "translate(0," + heightBar + ")")
		.call(d3.axisBottom(x).tickSizeOuter(0));
	svgBar.append("text")    
		.attr("class", "axis-label")
		.attr("transform",
					"translate(" + (widthBar/2) + " ," + (heightBar + marginBar.top + 20) + ")")
		.text("Ethnic Groups");

	let y = d3.scaleLinear()
		.domain([0, 100])
		.range([ heightBar, 0 ]);
	svgBar.append("g")
		.attr("class", "axis-marks")
		.call(d3.axisLeft(y));
	svgBar.append("text")
			.attr("class", "axis-label")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - marginBar.left / 2)
			.attr("x",0 - (heightBar / 2))
			.text("Proportion of Religious Groups (%)"); 

	// Tableau colour palette
	let colourScale = ["#e15759","#f28e2c","#59a14f","#76b7b2","#edc949","#4e79a7","#af7aa1","#ff9da7"];
	let colour = d3.scaleOrdinal()
			.domain(subgroups)
			.range(colourScale);
	
	//Normalize data
	let dataNormalized = []
	data[0].forEach(d => {
		tot = 0
		for (i in subgroups){ name=subgroups[i] ; tot += +d[name] }
		for (i in subgroups){ name=subgroups[i] ; d[name] = d[name] / tot * 100}
	})
	//data[0].forEach(d => console.log(d));

	//stack the data
	let stackedData = d3.stack()
		.keys(subgroups)
		(data[0])
	//console.log(stackedData);

	// Show the bars
	svgBar.append("g")
		.selectAll("g")
		// Enter in the stack data = loop key per key = group per group
		.data(stackedData)
		.enter().append("g")
			.attr("fill", function(d) { return colour(d.key); })
			.selectAll("rect")
			// enter a second time = loop subgroup per subgroup to add all rectangles
			.data(function(d) { return d; })
			.enter().append("rect")
				.attr("x", function(d) { return x(d.data.Ethnic); })
				.attr("y", function(d) { return y(d[1]); })
				.attr("height", function(d) { return y(d[0]) - y(d[1]); })
				.attr("width",x.bandwidth())
				.on("mouseover", (event, d) => {
					tooltipBar
						.style("display", "inline-block")
						.html(Math.round((d[1]-d[0])*10)/10 + "%")
				})
				.on("mousemove", (event, d) => {
					tooltipBar
						.style("left", (event.pageX) + "px")
						.style("top", (event.pageY + 20) + "px");
				})
				.on("mouseleave", () => {
					tooltipBar
						.style("display", "none");  
				})
				
	//Create legend	
	let labels = [];
	let HTML = "";
	
	colour.range().forEach((i, index) => {
		let val = subgroups[index];
		labels.push('<li class="sublegend-item"><div class="sublegend-color" style="background-color: ' + i + '"> </div> ' + val + '</li>');
	});
	HTML += '<ul id="sublegend-bar">' + labels.join('') + '</ul>';
	document.getElementById("legend-bar-values").innerHTML += HTML;
	
})

// =======================================================================================================================================
// Bubbles for ethnic population

// set the dimensions and margins of the graph
var width = 1000;
var height = 500;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width)
    .attr("height", height);

// Read data
//d3.csv("RelPop.csv", function(data) {
Promise.all([d3.csv("RelPop.csv")]).then(data => {
	
  // Tableau colour palette
	let colourScale = ["#e15759","#f28e2c","#59a14f","#76b7b2","#edc949","#4e79a7","#af7aa1","#ff9da7"];
  let color = d3.scaleOrdinal(colourScale);

  let xPosition = d3.scaleOrdinal()
    .domain([0, 1, 2])
    .range([500, 750, 950]);

  // Size scale
  var size = d3.scaleLinear()
    .domain([0, 500000])
    .range([7,55]);  // circle will be between 7 and 55 px wide

  // create a tooltip
  var tooltipBubble = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip-bubble")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");
		
	var formatComma = d3.format(",") 
	
  // Three functions that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    tooltipBubble
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltipBubble
      .html('<u>' + d.target.__data__.key +'</u>' + "<br>" + formatComma(d.target.__data__.value) + " pax")
      // .style("left", (d3.mouse(this)[0]) + "px")
      // .style("top", (d3.mouse(this)[1]+20) + "px")
      .style("left", (event.pageX) + "px")
      .style("top", (event.pageY + 20) + "px");
  }
  var mouseleave = function(d) {
    tooltipBubble
      .style("opacity", 0)
  }

  // Initialize the circle: all located at the center of the svg area
  var node = svg.append("g")
		.selectAll("circle")
    .data(data[0])
    .enter()
    .append("circle")
      .attr("class", "node")
      .attr("r", function(d){ return size(d.value)})
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", function(d){ return color(d.key)})
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 1)
      .on("mouseover", mouseover) // What to do when hovered
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .call(d3.drag() // call specific function when circle is dragged
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));

  // Features of the forces applied to the nodes:
  let	simulation = d3.forceSimulation()
    .nodes(data[0])
    .force("x", d3.forceX().strength(.3).x( d => xPosition(d.class) ))
    .force("y", d3.forceY().strength(.3).y( height /2 ))
    // .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.5)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return (size(d.value)+3) }).iterations(1)) // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
    .on("tick", function(d){
      node
				.attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
    });

  // What happens when a circle is dragged?
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(.03);
    d.fx = null;
    d.fy = null;
  }

})

// =======================================================================================================================================
// Choropleth map of religious population by planning area
	
let tiles = new L.tileLayer('https://maps-{s}.onemap.sg/v3/Default/{z}/{x}/{y}.png', {
	detectRetina: true,
	maxZoom: 18,
	minZoom: 11,
	
	//Do not remove this attribution
	attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;">' +
							 'New OneMap | Map data © contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
});

let map = new L.Map("my_map", {
	center: [1.347833, 103.809357], 
	zoom: 11,
	maxBounds: L.latLngBounds(L.latLng(1.1, 103.5), L.latLng(1.5, 104.3)) //bounce back to Singapore if user scroll/zoom out too far
}).addLayer(tiles);

let svgMap = d3.select(map.getPanes().overlayPane)
	.append("svg")
	.attr("width", 1000)
	.attr("height", 600)
		.append("g")
		.attr("id","svgLayer")
		.attr("class", "leaflet-zoom-hide");
		
function projectPoint(x, y) {
	let point = map.latLngToLayerPoint(new L.LatLng(y, x));
	this.stream.point(point.x, point.y);
}

let proj = d3.geoTransform({point: projectPoint});
let geopath = d3.geoPath().projection(proj);

//For point projection - format depends on file type
function applyLatLngToLayer(d){
	if(typeof(d.geometry) === "undefined") {
		var x = parseFloat(d.Geometry.substring(d.Geometry.indexOf(",")+1, d.Geometry.length));
		var y = parseFloat(d.Geometry.substring(0, d.Geometry.indexOf(",")));
	} else {
		var x = d.geometry.coordinates[0];
		var y = d.geometry.coordinates[1];
	}
	return map.latLngToLayerPoint(new L.LatLng(y,x));
}

let tooltipMap = d3.select("#my_map")            
	.append("div")     
	.attr("id", "tooltip-map");     

tooltipMap.append("div")
	.attr("id", "tooltip-map-header");
	
tooltipMap.append("div")
	.attr("id", "tooltip-map-body");
	
let legendMap = d3.select("#my_map")
	.append("div")
	.attr("id", "legend-map");
	
legendMap.append("div")
	.attr("id","legend-map-header")
	.html("Proportion (%)");

legendMap.append("div")
	.attr("id","legend-map-values");
	
drawMap = rel => {

	Promise.all([d3.json("MP14_PLNG_AREA_NO_SEA_PL.geojson"), d3.csv("Total_Top3_Religion-Population.csv")]).then(data => {
		
		data[0].features.forEach( district => {
			let result = data[1].filter( pop => {
				return pop.Subzone.toUpperCase() === district.properties.Name
			});
			if (typeof result[0] === "undefined") {
				district.properties.popReligion = null;
			} else {
				district.properties.popReligion = result[0][rel];
				district.properties.popReligionPct = Math.round((result[0][rel] / result[0].Total * 100) * 10) / 10; //calculate proportion and round to 1 dec pl.
			}
		});

		data[1].forEach( d => {
			d[rel] = +d[rel];
			d.Total = +d.Total;//convert column from string to integer
		});
		let maxRelPct = d3.max(data[1], d => {
			return Math.round((d[rel] / d.Total * 100) * 10) / 10;
		}); //extract max pop value for that religion
		let minRelPct = d3.min(data[1], d => {
			return Math.round((d[rel] / d.Total * 100) * 10) / 10;
		}); //extract min value
		
		let colourScale = "";
		if (rel === "BuddhismTaoism") {
			colourScale = d3.schemeOranges[5];
		} else if (rel === "Islam") {
			colourScale = d3.schemeGreens[5];
		} else {
			colourScale = d3.schemeBlues[5];
		}
				
		let colour = d3.scaleQuantize()
			.domain([minRelPct, maxRelPct])
			.range(colourScale);
		
		//reset planning-area layer, points and legend before regenerating new ones
		d3.select("#Singapore").remove();
		d3.select("#PoW").remove();
		if(document.getElementById("sublegend-map")) {
			document.getElementById("sublegend-map").remove();
		}
		
		//Generate planning-area layer
		svgMap.append("g")
			.attr("id", "Singapore")
			.selectAll("path")
			.data(data[0].features)
			.enter()
			.append("path")
			.attr("d",  d => geopath(d))
			.attr("fill", d => {
				return colour(d.properties.popReligionPct);
			})
			.classed("leaflet-interactive", true) //for mouse event in leaflet
			.on("mouseover", (event, d) => {
				tooltipMap.select("#tooltip-map-header").html(d.properties.Name);
				if(rel == "BuddhismTaoism") {
					if(d.properties.popReligion === null) {
						tooltipMap.select("#tooltip-map-body").html("Buddhism + Taoism Proportion: 0");
					} else {
						tooltipMap.select("#tooltip-map-body").html("Buddhism + Taoism Proportion: " + d.properties.popReligionPct + "%");
					}
				} else {
					if(d.properties.popReligion === null) {
						tooltipMap.select("#tooltip-map-body").html(rel + " Proportion: 0");
					} else {
						tooltipMap.select("#tooltip-map-body").html(rel + " Proportion: " + d.properties.popReligionPct + "%");
					}
				}
				d3.select(event.currentTarget)
					.classed("highlight-district", true);
			})
			.on("mouseout", (event, d) => {
				tooltipMap.select("#tooltip-map-header").html("");
				tooltipMap.select("#tooltip-map-body").html("");
				d3.select(event.currentTarget)
					.classed("highlight-district", false);
			})
		
		//Generate legend as html object
		let labels = [];
		let HTML = "";
		
		colour.range().forEach((i, index, array) => {
			let range_str = Math.round(colour.invertExtent(i)[0]) + " - " + Math.round(colour.invertExtent(i)[1]);
			//if (index === (array.length - 1)) {
			//	range_str = "> " + Math.round(colour.invertExtent(i)[0]);
			//}
			labels.push('<li class="sublegend-item"><div class="sublegend-color" style="background-color: ' +
					i + '"> </div> ' + range_str + '</li>');
		});
		labels.push('<li class="sublegend-item"><div class="sublegend-color" style="background-color: black"></div> Missing</li>');
		HTML += '<ul id="sublegend-map">' + labels.join('') + '</ul>';
		document.getElementById("legend-map-values").innerHTML += HTML;
		
		//To ensure svgMap zooms in tandem with oneMap zoom
		map.on('zoomend', onZoom);
		
		function onZoom() {
			let bounds = geopath.bounds(data[0]),
				topLeft = bounds[0],
				bottomRight = bounds[1];

			let svg = d3.select(map.getPanes().overlayPane).select("svg");
						
			svg.attr("width", bottomRight[0] - topLeft[0])
				.attr("height", bottomRight[1] - topLeft[1])
				.style("left", topLeft[0] + "px")
				.style("top", topLeft[1] + "px");
				 
			svg.select("g").attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
			d3.select("g#Singapore").selectAll("path")
				.attr("d", d => geopath(d));
			d3.select("g#PoW").selectAll("circle")
				.attr("cx", function(d) { return applyLatLngToLayer(d).x })
				.attr("cy", function(d) { return applyLatLngToLayer(d).y });
		}
		
	})
}

showPW = rel => {

	Promise.all([d3.json("mosque_fix.geojson"), d3.csv("Temple.csv"), d3.csv("Church.csv")]).then(data => {
		
		d3.select("#PoW").remove();
		
		if(rel === "BuddhismTaoism") {
			svgMap.append("g")
				.attr("id", "PoW")
				.selectAll("circle")
				.data(data[1])
				.enter()
				.append("circle")
				.attr("cx", function(d) { return applyLatLngToLayer(d).x })
				.attr("cy", function(d) { return applyLatLngToLayer(d).y })
				.attr("fill", "#FFD700")
				.attr("r", 5)
				.classed("leaflet-interactive", true) //for mouse event in leaflet
				.on("mouseover", (event, d) => {
					tooltipMap.select("#tooltip-map-header").html(d.Name);
					d3.select(event.currentTarget)
						.classed("highlight-point", true);
				})
				.on("mouseout", (event, d) => {
					tooltipMap.select("#tooltip-map-header").html("");
					d3.select(event.currentTarget)
						.classed("highlight-point", false);
				});
		} else if(rel === "Islam") {
			svgMap.append("g")
				.attr("id", "PoW")
				.selectAll("circle")
				.data(data[0].features)
				.enter()
				.append("circle")
				.attr("cx", function(d) { return applyLatLngToLayer(d).x })
				.attr("cy", function(d) { return applyLatLngToLayer(d).y })
				.attr("fill", "#FFD700")
				.attr("r", 5)
				.classed("leaflet-interactive", true) //for mouse event in leaflet
				.on("mouseover", (event, d) => {
					tooltipMap.select("#tooltip-map-header").html(d.properties.Mosque);
					d3.select(event.currentTarget)
						.classed("highlight-point", true);
				})
				.on("mouseout", (event, d) => {
					tooltipMap.select("#tooltip-map-header").html("");
					d3.select(event.currentTarget)
						.classed("highlight-point", false);
				});
		} else {
			svgMap.append("g")
				.attr("id", "PoW")
				.selectAll("circle")
				.data(data[2])
				.enter()
				.append("circle")
				.attr("cx", function(d) { return applyLatLngToLayer(d).x })
				.attr("cy", function(d) { return applyLatLngToLayer(d).y })
				.attr("fill", "#FFD700")
				.attr("r", 5)
				.classed("leaflet-interactive", true) //for mouse event in leaflet
				.on("mouseover", (event, d) => {
					tooltipMap.select("#tooltip-map-header").html(d.Name);
					d3.select(event.currentTarget)
						.classed("highlight-point", true);
				})
				.on("mouseout", (event, d) => {
					tooltipMap.select("#tooltip-map-header").html("");
					d3.select(event.currentTarget)
						.classed("highlight-point", false);
				});
		}			
	})
}

hidePW = () => {
	d3.select("#PoW").remove();
}

d3.select("#btBuddhismTaoism").on("click", () => {
	drawMap("BuddhismTaoism");
	religion = "BuddhismTaoism";
});

d3.select("#btIslam").on("click", () => {
	drawMap("Islam");
	religion = "Islam";
});
d3.select("#btChrist").on("click", () => {
	drawMap("Christianity");
	religion = "Christianity";
});

d3.select("#OnPoW").on("click", () => {
	showPW(religion);
});
d3.select("#OffPoW").on("click", () => {
	hidePW();
});

drawMap("BuddhismTaoism");
let religion = "BuddhismTaoism";
