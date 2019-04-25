// Load map data
d3.json('dataViz/usa.json', function (error, mapData) {
    displayBaseMap(mapData);
});

var displayBaseMap = function (mapData) {
    var features = mapData.features;
    console.log("loaded map data");

    var width = 960 * 3;
    var height = 500 * 3;

    var projection = d3.geo.mercator()
        .scale(1000)
        .center([-95, 44])
        .translate([width / 2, height / 2 + 200]);

    var path = d3.geo.path()
        .projection(projection);

    // Set svg width & height
    var svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height);

    var mapLayer = svg.append('g')
        .classed('map-layer', true);

    // title
    mapLayer.append("text")
        .attr("x", (width / 2))             
        .attr("y", 60)
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
        .text("USA Vizualization");


    mapLayer.selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke');

    console.log("done rendering base map!");

}
