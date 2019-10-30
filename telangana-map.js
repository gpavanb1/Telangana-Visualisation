var indiaCenter = [17.5, 79.2];
var defaultZoom = 7;

var map = L.map('mapid', {zoomControl: false, scrollWheelZoom: false}).setView(indiaCenter, defaultZoom);

// Create choropleth from statewise data
var legend;
$.getJSON("./data/sample_data.json", function(json) {
   // Populate dropdown entries
   var thisUL = document.getElementById('dropMenu');
   for (i in json["Hyderabad"]) {
     var link = document.createElement('a');
     link.appendChild(document.createTextNode(i));
     var thisLI = document.createElement('li');
     thisLI.appendChild(link);
     thisUL.appendChild(thisLI);
   }

   // Add event listener
   // Caret definition
   var caretHTML = " <span class='caret'></span>";
   // On-click event
   $(".dropdown-menu").on('click', 'li a', function() {
     var currValue = $(this).text();
     prop = currValue;
     $(".btn:first-child").text(currValue);
     $(".btn:first-child").html(currValue + " " + caretHTML)

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
  //trigger event
  $('.dropdown-menu li a').first().trigger('click');
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

// Filter from dropdown
// Taken from https://www.w3schools.com/bootstrap/tryit.asp
$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".dropdown-menu li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});
