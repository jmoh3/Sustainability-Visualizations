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
        .text("CS296 Final Viz");


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

    // const globalMax = 660;
    // const globalMin = 0;
    // var globalMean = 200;

    const globalMax = 64;
    const globalMin = -36;
    var globalMean = 14;


    const hueScale = d3.scale.linear()
                        .domain([globalMin, globalMax])
                        .range([0, 359]);

    var state_to_emission = {};
    var state_to_percent_change = {};
    for (row in data) {
        state_to_emission[data[row]['State']] = data[row][year];
        state_to_percent_change[data[row]['State']] = data[row]['Percent_Change_' + year + '_1990'];
    }

    mapLayer.selectAll('path')
            .style('fill', function(d) {
                // return color_picker(state_to_emission[d.properties['STATE_NAME']], globalMin, globalMax, globalMean);
                return color_picker(state_to_percent_change[d.properties['STATE_NAME']], globalMin, globalMax, globalMean);
            });

}

const color_picker = function(emission, globalMin, globalMax, globalMean) {
    if (globalMean == null) {
        globalMean = (globalMax + globalMin) / 2;
    }

    var hueScale = null;

    if (emission < globalMean) {
        hueScale = d3.scale.linear()
                        .domain([globalMin, globalMean])
                        .range([250, 170]);
    } else {
        hueScale = d3.scale.linear()
                        .domain([globalMean, globalMax])
                        .range([60, 0]);   
    }

    return d3.hsl(hueScale(emission), 1, 0.5);

}
