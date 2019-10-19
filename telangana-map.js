var indiaCenter = [17.5, 79.2];
var defaultZoom = 7;

var map = L.map('mapid', {zoomControl: false, scrollWheelZoom: false}).setView(indiaCenter, defaultZoom);

// Create choropleth from statewise data
var legend;
$.getJSON("./data/sample_data.json", function(json) {
   // Populate dropdown entries
   var x = document.getElementById("dropdown");
   for (i in json["Hyderabad"]) {
     var option = document.createElement("option");
     option.text = i;
     x.add(option);
   }

   // Add event listener
   $('#dropdown').bind('change', function() {
     // Set prop
     prop = this.value;

     // Get Data function
     function getData(val) {
       if (val in json) {
          return json[val][prop];
       }
      else {
        return 0.0;
      }
     }
     // Get data values as array
     var vals = [];
     for (i in json) {
       vals.push(json[i][prop]);
     }
     // Get minimum and maximum
     var min = Math.min(...vals);
     var max = Math.max(...vals);

     function style(feature) {
     	return {
     		fillColor: getColor(getData(feature.properties.D_NAME), vals),
     		weight: 2,opacity: 1,color: 'white',dashArray: '3',fillOpacity: 0.7
     	};
     }
     $.getJSON("./data/Telangana.geojson", function(geojson) {
       var searchLayer = L.geoJSON(geojson, {
         style: style,

         onEachFeature(feature, layer) {
            layer.on('mouseover', function () {
              this.setStyle({
                'fillColor': '#0000ff'
              });
              var tipText = feature.properties.D_NAME + "<br>"
                            + getData(feature.properties.D_NAME);
              this.bindTooltip(tipText).openTooltip();
            });
            layer.on('mouseout', function () {
              this.setStyle({
                'fillColor': getColor(getData(feature.properties.D_NAME), vals),
              });
            });
        }
       }).addTo(map);
     });

    // Add legend
    if(legend instanceof L.Control){map.removeControl(legend);}
    legend = L.control({position: 'topright'});
    legend.onAdd = function (map) {
    	var div = L.DomUtil.create('div', 'info legend'),
    		grades = d3.ticks(min, max, 6),
    		labels = [];
    	// loop through our density intervals and generate a label with a colored square for each interval
    	for (var i = 0; i < grades.length; i++) {
    		div.innerHTML +=
    			'<i style="background:' + getColor(grades[i] + 1, vals) + '"></i> ' +
    			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    	}
    	return div;
    };
    legend.addTo(map);
  });
  $('#dropdown').trigger('change');
});

// Define color
function getColor(d, values) {
  // Get range of values
  var min = Math.min(...values);
  var max = Math.max(...values);

  var myColor = d3.scaleLinear().domain([min,0.5*(min+max), max])
    .range(["red", "yellow", "green"]);

	return myColor(d);
}
