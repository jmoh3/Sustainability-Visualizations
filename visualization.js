
// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function() {
  d3.csv("exports_by_years.csv", function(error, exports) {
    // Write the data to the console for debugging:
    console.log(exports);
    // Call our visualize function:
    visualize(exports);
  });
});


var visualize = function(exports) {
  // Boilerplate:
  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
     width = 960 - margin.left - margin.right,
     height = 100 - margin.top - margin.bottom,
     padding = 50;
  
  // Visualization Code:

  var svg = d3.select("svg");

  var path = d3.geoPath();
  var projection = d3.geoNaturalEarth()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 2])
  var path = d3.geoPath()
      .projection(projection);

  // Data and color scale
  var data = d3.map();
  var colorScheme = d3.schemeReds[6];
  colorScheme.unshift("#eee")
  var colorScale = d3.scaleThreshold()
      .domain([1, 6, 11, 26, 101, 1001])
      .range(colorScheme);

  // Legend
  var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
  g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Students");
  var labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '> 1000'];
  var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
  svg.select(".legendThreshold")
    .call(legend);

  d3.queue()
    .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, "exports_by_years.csv", function(d) {
      console.log(d.col_2017);
      data.set(d.col_iso3, +d.col_2017);
      console.log(data.col_2017.replace("$", ""))
    })
    .await(ready);

  function ready(error, topo) {
    if (error) throw error;
    
    console.log("here");
    console.log(data["$ARE"]);
    console.log();

    // Draw the map
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
            .attr("fill", function (d){
                console.log("HERE")
                // Pull data for this country
                d.col_2017 = data.get(d.id) || 0;
                // Set the color
                return colorScale(d.col_2017);
            })
            .attr("d", path);
  }


  // d3.csv("datasets/cites_1975.csv", function(error, cites) {
  //   d3.csv("countries_codes_and_coordinates.csv", function(error, coords) {

  //     var projection = d3.geoMercator();
      

  //     var getCoords = function(tradeData, coordinates, countryType, i) {
  //       try {
  //         var country = tradeData[i][countryType];

  //         var lat = coordinates.filter(function f(d) {
  //           return d["Alpha-2 code"].includes(country)
  //         })[0]["Latitude (average)"];

  //         var long = coordinates.filter(function f(d) {
  //           return d["Alpha-2 code"].includes(country)
  //         })[0]["Longitude (average)"];
        

  //         return [parseInt(lat.replace(/"/g,"").replace(" ","")), parseInt(long.replace(/"/g,"").replace(" ",""))];
  //       } catch (err) {
  //         return [0, 0];
  //       }
  //     }

  //     console.log(getCoords(cites, coords, "Origin", 0))

  //     function formatTradeData(tradeData) {
  //       var my_data = [];
  //       tradeData.map(function (d, i) {
  //         var feature = {
  //           "coordinates": [
  //             projection(getCoords(tradeData, coords, "Exporter", i)),
  //             projection(getCoords(tradeData, coords, "Importer", i))],
  //           "properties": {
  //             "origin": d["Origin"],
  //             "exporter": d["Exporter"],
  //             "destination": d["Importer"]
  //           }
  //         };
  //         my_data.push(feature);
  //       });
  //       return my_data;
  //     }

  //     var formattedData = formatTradeData(cites)
  //     console.log(formattedData[0].coordinates)

      // svg.selectAll("line")
      //   .data(formattedData)
      //   .enter()
      //   .append("line")
      //   .attr("x1", function(d, i) {
      //     return formattedData[i].coordinates[0][0]
      //   })
      //   .attr("y1", function(d, i) {
      //     return formattedData[i].coordinates[0][1]
      //   })
      //   .attr("x2", function(d, i) {
      //     return formattedData[i].coordinates[1][0]
      //   })
      //   .attr("y2", function(d, i) {
      //     return formattedData[i].coordinates[1][1]
      //   })

//     });
//   });
};