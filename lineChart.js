const width = 1000;
const height = 500;
const margin = 5;
const padding = 5;
const adj = 40;


// we are appending SVG first
const lineChart = d3.select("div#lineChart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
        + adj + " -"
        + adj + " "
        + (width + adj *3) + " "
        + (height + adj*3))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
d3.select("#dataviz_brushing1D")
    .call( d3.brushX()                     // Add the brush feature using the d3.brush function
        .extent( [ [0,100], [400,300] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    )

//-----------------------------DATA-----------------------------//

const timeConv = d3.timeParse("%Y");
const dataset = d3.csv("data.csv");
dataset.then(function(data) {
    var slices = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d){
                return {
                    date: timeConv(d.date),
                    measurement: +d[id]
                };
            })
        };
    });

//----------------------------SCALES----------------------------//
    const xScale = d3.scaleTime().range([0,width]);
    const yScale = d3.scaleLinear().rangeRound([height, 0]);
    xScale.domain(d3.extent(data, function(d){
        return timeConv(d.date)}));
    yScale.domain([(0), d3.max(slices, function(c) {
        return d3.max(c.values, function(d) {
            return d.measurement + 4; });
    })
    ]);

//-----------------------------AXES-----------------------------//
    const yaxis = d3.axisLeft()
        .ticks((slices[0].values).length)
        .scale(yScale);

    const xaxis = d3.axisBottom()
        .ticks(d3.timeYear.every(4))
        .tickFormat(d3.timeFormat('%Y'))
        .scale(xScale);

//----------------------------LINES-----------------------------//
    const line = d3.line()
        //.defined(function(d) { return d.measurement >= 0 && d.measurement <= 270; })
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.measurement); });

    const dangerLine = d3.line()
        .defined(function(d) { return d.measurement >= 270; })
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.measurement); });


    let id = 0;
    const ids = function () {
        return "line-"+id++;
    }
//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
    lineChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);

    lineChart.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Electoral College Votes");

//----------------------------LINES-----------------------------//
    const show = (event, d) => {
        tooltip.transition()
            .duration(200)
            .style("opacity", 1)
        tooltip.html("Housing cost: ")
            .style("left", (d3.mouse(event)[0]+70))
            .style("top", (d3.mouse(this)[1]))
    };
    const lines = lineChart.selectAll("lines")
        .data(slices)
        .enter()
        .append("g");

    //  lines.append("path")
    //  .attr("d", function(d) { return dangerLine(d.values); });
    lines.append("path")
        .attr("class", ids)
        .attr("d", function(d) { return line(d.values); })
        // .attr("d", function(d) { return dangerLine(d.values); })
        .on("mouseover", function(d) {
            // show()
            console.log(d.id);
            // line1's legend is hovered
            d3.select(this).classed("highlight", true)

            if (d.id == "Democrats")
            {
                lineChart.selectAll(".line-0").style("stroke-width", "4px");
                lineChart.selectAll(".line-1").style("stroke", "gray");
                lineChart.selectAll(".line-1").style("stroke-opacity", "0.5");
            }
            else
            {
                lineChart.selectAll(".line-1").style("stroke-width", "4px")
                lineChart.selectAll(".line-0").style("stroke", "gray");
                lineChart.selectAll(".line-0").style("stroke-opacity", "0.5");
            }

        })
        .on("mouseout", function() {
            // revert the styles
            lineChart.selectAll(".line-0").style("stroke-width", "3px");
            lineChart.selectAll(".line-0").style("stroke", "blue");
            lineChart.selectAll(".line-0").style("stroke-opacity", "1");
            lineChart.selectAll(".line-1").style("stroke-width", "3px");
            lineChart.selectAll(".line-1").style("stroke-opacity", "1");
            lineChart.selectAll(".line-1").style("stroke", "red");
        });;

    lines.append("text")
        .attr("class","serie_label")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) - 5)
                + "," + (yScale(d.value.measurement) + 5 ) + ")"; })
        .attr("x", 5)
        .text(function(d) { return d.id; });

    d3.select("#lineChart")
        .call( d3.brush()                     // Add the brush feature using the d3.brush function
            .extent( [ [0,0], [400,400] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        )




})

const barMargin = {top: 30, right: 30, bottom: 70, left: 60},
    barWidth = 460 - barMargin.left - barMargin.right,
    barHeight = 400 - barMargin.top - barMargin.bottom;
// append the svg object to the body of the page
const barChart = d3.select("div#barChart")
    .append("svg")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
    .append("g")
    .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

// Parse the Data
d3.csv("barChartData.csv").then ( function(data) {

    // sort data
    data.sort(function(b, a) {
        return a.Value - b.Value;
    });

    const x = d3.scaleLinear()
        .domain([0, 40])
        .range([ 0, barWidth]);
    barChart.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    const y = d3.scaleBand()
        .range([ 0, barHeight ])
        .domain(data.map(d => d.Country))
        .padding(.1);
    barChart.append("g")
        .call(d3.axisLeft(y))

    //Bars
    barChart.selectAll("myRect")
        .data(data)
        .join("rect")
        .attr("x", x(0) )
        .attr("y", d => y(d.Country))
        .attr("width", d => x(d.Value))
        .attr("height", y.bandwidth())
        .attr("fill", "#69b3a2")

});


