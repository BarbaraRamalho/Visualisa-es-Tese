const max = Math.max;
const sin = Math.sin;
const cos = Math.cos;
const HALF_PI = Math.PI / 2;

function RadarChart(parent_selector, data, radarChartDefinitions, svgRadarChart, createOrUpdate, tip, selectedValue) {

	var maxValue = 0;
	for (var j=0; j < data.length; j++) {
		for (var i = 0; i < data[j].axes.length; i++) {
			data[j].axes[i]['id'] = data[j].name;
			if (data[j].axes[i]['value'] > maxValue) {
				maxValue = data[j].axes[i]['value'];
			}
		}
	}
	
	const allAxis = data[0].axes.map((i, j) => i.axis),	
		total = allAxis.length,	
		radius = Math.min(radarChartDefinitions.width/2, radarChartDefinitions.height/2), 	
		Format = d3.format(radarChartDefinitions.format),			 
		angleSlice = Math.PI * 2 / total;		

	const rScale = d3.scaleLog()
		.range([1, radius])
		.domain([1, maxValue]);

	const radarLine = d3.radialLine()
			.curve(d3.curveLinearClosed)
			.radius(d => rScale(d.value))
			.angle((d,i) => i * angleSlice);

	const parent = d3.select("body");

	if(svgRadarChart.selectAll("g").size()==0){ 
		var g = svgRadarChart.append("g")
				.attr("transform", "translate(" + ((radarChartDefinitions.width/2)+45) + "," + ((radarChartDefinitions.height/2)+margin.top+5) + ")");
	} else {
		svgRadarChart.selectAll("g").remove()
		var g = svgRadarChart.append("g")
				.attr("transform", "translate(" + ((radarChartDefinitions.width/2)+45) + "," + ((radarChartDefinitions.height/2)+margin.top+5) + ")");
	}

	let axisGrid = g.append("g")
		.attr("class", "axisWrapper");

	axisGrid.selectAll(".levels")
	    .data(d3.range(1, (radarChartDefinitions.levels+1)).reverse())
	    .enter()
		.append("circle")
			.attr("class", "gridCircle")
			.attr("r", d => radius / radarChartDefinitions.levels * d)
			.style("fill", "white")
			.style("stroke", "black")
			.style("stroke-width", "0.7")

	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");

	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", (d, i) => rScale(maxValue) * cos(angleSlice * i - HALF_PI))
		.attr("y2", (d, i) => rScale(maxValue) * sin(angleSlice * i - HALF_PI))
		.attr("class", "line")
		.style("stroke", "black")
		.style("stroke-width", "0.7")

	if(createOrUpdate == "create"){
		axis.append("text")
			.attr("class", "legendAxis")
			.style("font-size", "11px")
			.attr("text-anchor", "middle")
			.attr("x", function(d,i){
				if(i == 4 || i == 5){
					return 160 * cos(angleSlice * i - HALF_PI)
				} else if(i == 1 || i == 2) {
					return 190 * cos(angleSlice * i - HALF_PI)
				}
			})
			.attr("y", function(d,i){
				if(i == 0){
					return 120 * sin(angleSlice * i - HALF_PI)
				} else {
					return 130 * sin(angleSlice * i - HALF_PI)
				}
			})
			.text(d => d)
	}

	const blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter()
		.append("g")
			.attr("class", "radarWrapper");

	svgRadarChart.selectAll(".radarArea").remove()

	blobWrapper.append("path")
		.attr("class", "radarArea")
		.attr("d", d => radarLine(d.axes))
		.style("fill", d => d.color)
		.style("fill-opacity", function(d){
			if(d.name == selectedValue){
				return 0.8;
			} else {
				return 0.3;
			}
		})	
		.on('mouseover', onMouseOver)
		.on('mouseout', onMouseOut)
		.on('click', onClick)

	svgRadarChart.selectAll(".radarStroke").remove()
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d.axes); })
		.style("stroke-width", 1.7)
		.style("stroke", function(d){
			if(d.name == selectedValue){
				return "black";
			} else {
				return d.color
			}
		})	
		.style("fill", "none")
		.on('mouseover', onMouseOver)
		.on('mouseout', onMouseOut)
		.on('click', onClick)
	
	svgRadarChart.selectAll(".radarCircle").remove()
	blobWrapper.selectAll(".radarCircle")
		.data(d => d.axes)
		.enter()
		.append("circle")
		.attr("class", "radarCircle")
		.attr("r", 4)
		.attr("cx", (d,i) => rScale(d.value) * cos(angleSlice * i - HALF_PI))
		.attr("cy", (d,i) => rScale(d.value) * sin(angleSlice * i - HALF_PI))
		.style("fill", function(d){
			if(d.id == selectedValue){
				radarChartDefinitions.color(d.id)
				return "black";
			} else {
				return radarChartDefinitions.color(d.id)
			}
		})		
		.on('mouseover', onMouseOver)
		.on('mouseout', onMouseOut)
		.on('click', onClick)

	svgRadarChart.selectAll(".radarCircleWrapper").remove()
	const blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");

	svgRadarChart.selectAll(".radarInvisibleCircle").remove()
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(d => d.axes)
		.enter()
		.append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", 4 * 1.5)
		.attr("cx", (d,i) => rScale(d.value) * cos(angleSlice*i - HALF_PI))
		.attr("cy", (d,i) => rScale(d.value) * sin(angleSlice*i - HALF_PI))
		.style("fill", (d) => radarChartDefinitions.color(d.id))
		.style("fill-opacity", 0)
		.style("pointer-events", "all")
		.on('mouseover', onMouseOver)
		.on('mouseout', onMouseOut)
		.on('click', onClick)
		.on('mouseover.tip', tip.show)
		.on('mouseout.tip', tip.hide)

	if(selectedValue != "No Attack Type"){
		parent.selectAll(".radarArea").filter(function(d){
			return d.name == selectedAttackType;
		}).transition().duration(200)
		  .style("fill-opacity", 0.8)

		parent.selectAll(".radarCircle").filter(function(d){
			return d.id == selectedAttackType;
		}).transition().duration(200)
		  .style("fill", "rgb(0, 0, 0)")
		  .style("fill-opacity", 1)

		parent.selectAll(".radarStroke").filter(function(d){
			return d.name == selectedAttackType;
		}).transition().duration(200)
		  .style("stroke", "rgb(0, 0, 0)")
		  .style("stroke-opacity", 1)
	}

	svgRadarChart.selectAll(".legendAttackType").remove()

	let legend = g.append("g")
		.attr("class", "legendAttackType")
		.attr("height", 100)
		.attr("width", 400)
		.attr("transform", "translate(-125, -132)");

	legend.selectAll('rect')
		.data(data)
		.enter()
		.append("rect")
			.attr("x", function(d,i){
				if(i >= 3){
					return i * 120 - (120 * 3);
				}else{
					return i * 120;
				}
			})
			.attr("y", function(d,i){
				if(i >= 3){
					return radarChartDefinitions.height + 70;
				}else{
					return radarChartDefinitions.height + 50;
				}
			})
			.attr("width", 9)
			.attr("height", 9)
	 		.style("fill", function(d){
	 			return d.color
	 		});

	legend.selectAll('text')
		.data(data)
		.enter()
		.append("text")
			.attr("x", function(d,i){
				if(i >= 3){
					return i * 120 - (120 * 3) + 15;
				}else{
					return i * 120 + 15;
				}
			})
			.attr("y", function(d,i){
				if(i >= 3){
					return radarChartDefinitions.height + 78;
				}else{
					return radarChartDefinitions.height + 58;
				}
			})
			.attr("font-size", "11px")
			.text(d => d.name);

	function onMouseOver(d, i) {
		currentColor = d.color
		currentID = d.name

		if(currentID == null){
			currentID = d.id
			currentColor = radarChartDefinitions.color(d.id)
		}

		if(selectedValue != currentID){
			parent.selectAll(".radarArea").filter(function(d){
				return d.name != currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 0.2)

			parent.selectAll(".radarArea").filter(function(d){
				return d.name == currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 0.8)

			parent.selectAll(".radarCircle").filter(function(d){
				return d.id != currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 0.6)

			parent.selectAll(".radarCircle").filter(function(d){
				return d.id == currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 1)

			parent.selectAll(".radarStroke").filter(function(d){
				return d.name != currentID;
			}).transition().duration(50)
			  .style("stroke-opacity", 0.6)

			parent.selectAll(".radarStroke").filter(function(d){
				return d.name == currentID;
			}).transition().duration(50)
			  .style("stroke-opacity", 1)
		} else {
			parent.selectAll(".radarArea").filter(function(d){
				return d.name != currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 0.2)

			parent.selectAll(".radarArea").filter(function(d){
				return d.name == currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 0.8)

			parent.selectAll(".radarCircle").filter(function(d){
				return d.id != currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 0.6)

			parent.selectAll(".radarCircle").filter(function(d){
				return d.id == currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 1)

			parent.selectAll(".radarStroke").filter(function(d){
				return d.name != currentID;
			}).transition().duration(50)
			  .style("stroke-opacity", 0.6)

			parent.selectAll(".radarStroke").filter(function(d){
				return d.name == currentID;
			}).transition().duration(50)
			  .style("stroke-opacity", 1)
		}
	}

	function onMouseOut() {
		parent.selectAll(".radarArea")
			.transition().duration(50)
			.style("fill-opacity", 0.3);

		if(selectedValue != "No Attack Type"){
			parent.selectAll(".radarArea").filter(function(d){
				return d.name == selectedAttackType;
			}).transition().duration(50)
			  .style("fill-opacity", 0.8)
		}

		parent.selectAll(".radarCircle")
			.transition().duration(50)
			.style("fill-opacity", 1);

		parent.selectAll(".radarStroke")
			.transition().duration(50)
		  	.style("stroke-opacity", 1);
	}

	function onClick(d) {
		currentID = d.name
		currentColor = d.color

		if(currentID == null){
			currentID = d.id
			currentColor = radarChartDefinitions.color(d.id)
		}

		if(selectedValue == "No Attack Type"){

			selectedValue = currentID
			selectedColor = currentColor

			parent.selectAll(".radarArea").filter(function(d){
				return d.name == currentID;
			}).transition().duration(50)
			  .style("fill-opacity", 0.8)

			parent.selectAll(".radarCircle").filter(function(d){
				return d.id == currentID;
			}).transition().duration(50)
			  .style("fill", "rgb(0, 0, 0)")
			  .style("fill-opacity", 1)

			parent.selectAll(".radarStroke").filter(function(d){
				return d.name == currentID;
			}).transition().duration(50)
			  .style("stroke", "rgb(0, 0, 0)")
			  .style("stroke-opacity", 1)

		} else {

			if(currentID == selectedValue){

				selectedValue = "No Attack Type"
				selectedColor = currentColor

				parent.selectAll(".radarArea").filter(function(d){
					return d.name == currentID;
				}).transition().duration(50)
				  .style("fill-opacity", 0.8)

				parent.selectAll(".radarCircle").filter(function(d){
					return d.id == currentID;
				}).transition().duration(50)
				  .style("fill", currentColor)

				parent.selectAll(".radarStroke").filter(function(d){
					return d.name == currentID;
				}).transition().duration(50)
				  .style("stroke", currentColor)

			} else {

				parent.selectAll(".radarCircle").filter(function(d){
					return d.id == selectedValue;
				}).transition().duration(50)
				  .style("fill", selectedColor)

				parent.selectAll(".radarStroke").filter(function(d){
					return d.name == selectedValue;
				}).transition().duration(50)
				  .style("stroke", selectedColor)

				selectedValue = currentID
				selectedColor = currentColor

				parent.selectAll(".radarArea").filter(function(d){
					return d.name == currentID;
				}).transition().duration(50)
				  .style("fill-opacity", 0.8)

				parent.selectAll(".radarCircle").filter(function(d){
					return d.id == currentID;
				}).transition().duration(50)
				  .style("fill", "rgb(0, 0, 0)")

				parent.selectAll(".radarStroke").filter(function(d){
					return d.name == currentID;
				}).transition().duration(50)
				  .style("stroke", "rgb(0, 0, 0)")
			}
		}

		d3.select(".attackTypeSelection").property('value', selectedValue)
		d3.select(".attackTypeSelection").dispatch("change")

	}

	return svgRadarChart;
}

