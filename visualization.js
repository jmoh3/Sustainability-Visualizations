
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

      
  var svg = d3.select("#map")
    .datum(exports);
  
  // Visualization Code:

  var format = function(d) {
    d = d / 1000;
    return d3.format(',.02f')(d) + 'k';
  }


  var map = d3.geomap.choropleth()
    .geofile('/d3-geomap/topojson/world/countries.json')
    .colors(colorbrewer.OrRd[9])
    .column('2017')
    .format(format)
    .unitId('iso3')
    .legend(true);
  
  map.draw(d3.select('#map'));

  console.log(map.path.centroid(100, 100));

  // console.log(d3.select("#map > svg > g.units.zoom > path.unit.unit-ARG").centroid());
  // console.log(map.svg.insert('g', 'g.units').attr('class', 'tectonics zoom').selectAll('path'));

  d3.csv("datasets/cites_1975.csv", function(error, cites) {
    d3.csv("countries_codes_and_coordinates.csv", function(error, coords) {

      // map.svg
      //   .insert('g', 'g.units')
      //   .attr('class', 'tectonics zoom')
      //   .selectAll('path')
      //   .data(topojson.feature(cites, b.objects.tec).features)
      //   .enter()
      //   .append('path')
      //   .attr('d', map.path);

      var projection = d3.geoMercator();

      // console.log(document.querySelector('#map > svg > g.units.zoom > path.unit.unit-AFG').getBoundingClientRect());
      

      var getCoords = function(tradeData, coordinates, countryType, i) {
        try {
          var country = tradeData[i][countryType];

          // console.log(country);
          // console.log(d3.select("#map > svg > g.units.zoom > path.unit.unit-ESH").path)
          
          // console.log(coordinates.filter(function f(d) {
          //   return d["Alpha-2 code"].includes(country)
          // })[0]["Latitude (average)"]);

          var lat = coordinates.filter(function f(d) {
            return d["Alpha-2 code"].includes(country)
          })[0]["Latitude (average)"];

          var long = coordinates.filter(function f(d) {
            return d["Alpha-2 code"].includes(country)
          })[0]["Longitude (average)"];
        

          return [parseInt(lat.replace(/"/g,"").replace(" ","")), parseInt(long.replace(/"/g,"").replace(" ",""))];
        } catch (err) {
          return [0, 0];
        }
  
      }

      function formatTradeData(tradeData) {
        var my_data = [];
        tradeData.map(function (d, i) {
          var feature = {
            "coordinates": [
              projection(getCoords(tradeData, coords, "Exporter", i)),
              projection(getCoords(tradeData, coords, "Importer", i))],
            "properties": {
              "origin": d["Origin"],
              "exporter": d["Exporter"],
              "destination": d["Importer"]
            }
          };
          my_data.push(feature);
        });
        return my_data;
      }

      var formattedData = formatTradeData(cites)
      // console.log(formattedData[0].coordinates)

      svg.selectAll("line")
        .data(formattedData)
        .enter()
        .append("line")
        .attr("x1", function(d, i) {
          return formattedData[i].coordinates[0][0]
        })
        .attr("y1", function(d, i) {
          return formattedData[i].coordinates[0][1]
        })
        .attr("x2", function(d, i) {
          return formattedData[i].coordinates[1][0]
        })
        .attr("y2", function(d, i) {
          return formattedData[i].coordinates[1][1]
        })

    //   var line = svg.selectAll("arc") 
    //     .data(formattedData)
    //     .enter()
    //     .append("path")
    //     .attr("class", "arc")
    //     .attr("fill", "none")
    //     .attr("stroke", "red")
    //     .attr("stroke-width", "2")
    //     .attr("stroke-linecap", "round")
    //     .attr("opacity", function(d, i) {
    //       console.log("here!")
    //       return "1"
    //     })
    //     .attr("d", this.path)
    //     .on("click",  function(d) {
    //       console.log("Clicked line!")
    //   });

    //   console.log();

    });
  });

  // console.log(topojson.feature(b, b.objects.tec).features);

  // svg.selectAll("line")
  //   .data(data)
  //   .enter()
  //   .append("line")
  //   .attr("x1", function(d, i) {
  //     d3.selectAll("#map").attr("cx")
  //   })
  //   .attr("y1", function(d, i) {
      
  //   })
  //   .attr("x2", function(d, i) {
      
  //   })
  //   .attr("y2", function(d, i) {
      
  //   })
};