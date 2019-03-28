var margin	= {top: 25, right: 35, bottom: 25, left: 35};

var width = 1600 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var parseTime = d3.timeParse("%B");

var x_scale = d3.scaleTime().range([0, width]);
var y_scale = d3.scaleLinear().range([height, 0]);

var ticketline = d3.line()
    .x(function(d) { return x_scale(d.month); })
    .y(function(d) { return y_scale(d.n); })
    .curve(d3.curveMonotoneX);

var colors = ["#990CE8", "#0D49FF", "#FF0000", "0DECFF","#E8760C", "#FFEB7C"]

d3.select('#chart').selectAll("svg").remove();

var svg = d3.select('#chart').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append('g')
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

d3.csv("ticket-1.csv", function(error, data){
  if (error) throw error;

  data.forEach(function(d){
      d.month = parseTime(d.month);
      d.n = +d.n;
  });

  x_scale.domain(d3.extent(data, function(d){return d.month;}));
  y_scale.domain([0, d3.max(data, function(d){return d.n;})]);

  var nestedData = d3.nest()
      .key(function(d){return d.year;})
      .entries(data);

  nestedData.forEach(function(d,i) {

    // calculate stats
    var mean = Math.round(d3.mean(d.values, function(d) {return d.n}),2);
    var sd = Math.round(d3.deviation(d.values, function(d) {return d.n}));
    var year = d.values[0].year;
    var summe = d3.sum(d.values, function(d){ return d.n} );

    var stats = [year, "MW: " + mean, "SD: " + sd, "total: " + summe, "n/day: " + Math.round(mean/21)];

    svg.append("path")
        .attr("class", "line")
        .style("opacity", 0.2)
        .style("stroke", function(){
            var color = colors[i];
            return color;})
        .attr("d", ticketline(d.values))
        .on("mouseover", function(){
          d3.select(this).style("opacity", 1.0)
                          .style("stroke-width", 5);
        })
        .on("mouseout", function(){
          d3.select(this).style("stroke-width", 2.5);
        })
        .on("click", function(){addResults(i, stats)})
        ;
  });


  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", function(d) { return x_scale(d.month);})
      .attr("cy", function(d) {return y_scale(d.n);})
      .attr('fill', '#111')
      .attr("r", 5)
      .on('mouseover', function(d){
        d3.select(this)
          .attr('fill', colors[4])
          .attr('r', 10)
        svg.append("text")
          .attr("x", function() { return x_scale(d.month) + 15;})
          .attr("y", function() {return y_scale(d.n) + 25;})
          .text(function() {return d.n;})
          .attr("font-size", 12)
        })
      .on('mouseout', function(d){
        d3.select(this)
          .attr('fill', colors[5])
          .attr('r', 5)
      })  ;




  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x_scale));

  svg.append("g")
      .call(d3.axisLeft(y_scale));

  // add rectangle with stats
  var addResults = function(index, text){
     svg.append('rect')
        .attr('class', 'rect')
        .transition()
        .duration(1000)
        .attr('x', function(){
          return width -100;
        })
        .attr('y', function(){
          return (height/4) * index;
        })
        .attr('height', 150)
        .attr('width', 100)
        .attr('fill', colors[index])
        .attr('opacity', 0.2)

    for (i=0; i<text.length; i++){
        svg.append('text')
          .transition()
          .duration(1500)
          .attr('x', function(){
              return width - 80;
            })
          .attr('y', function(){
              return (height/4) * index + 20 + 15*(i+1);
            })
          .text(text[i])
      }
}
});
