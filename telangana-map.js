var width = 960,
    height = 500;

var path = d3.geo.path();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var url = "data/Telangana.json"
d3.json(url, function(error, topology) {
  if (error) throw error;
  
  console.log("topojson", topology)
  var geojson = topojson.feature(topology, topology.objects.DISTRICTS_2018);
  console.log("geojson", geojson)
  
  // Define projection
  var bounds = d3.geo.bounds(geojson);
  var centerX = d3.sum(bounds, function(d) {return d[0];}) / 2,
      centerY = d3.sum(bounds, function(d) {return d[1];}) / 2;
  var projection = d3.geo.mercator()
    .scale(1000)
    .center([centerX, centerY]); 
  path.projection(projection);

  svg.selectAll("path")
      .data(geojson.features)
      .enter().append("path")
      .attr("d", path);
});