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

    // monitors slider
    var data = null;
    d3.csv('dataViz/summary_cleaned.csv', function(error, d) {
        data = d;
        const year = document.getElementById('yearSlider').value;
        visualize(data, year, mapLayer, projection);
    });

    document.getElementById('yearSlider').oninput = function() {
        mapLayer.selectAll('circle').remove();
        const year = document.getElementById('yearSlider').value;
        visualize(data, year, mapLayer, projection);
    }
}

const visualize = function (data, year, mapLayer, projection) {

    const globalMax = 660;
    const globalMin = 0;

    var radiusScale = d3.scale.linear()
                        .domain([globalMin, globalMax])
                        .range([2, 30]);

    mapLayer.selectAll('circle')
            .data(data).enter()
            .append('circle')
            .attr('cx', function (d) {
                const toProject = [d['Longitude'], d['Latitude']];
                return projection(toProject)[0];
            })
            .attr('cy', function (d) {
                const toProject = [d['Longitude'], d['Latitude']];
                return projection(toProject)[1];
            })
            .attr('r', function (d) {
                return radiusScale(d[year]);
            })
            .attr('fill', function (d) {
                return d3.hsl(0, 1, 0.5);
            });

}
