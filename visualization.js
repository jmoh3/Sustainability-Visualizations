
// Load map data
d3.json('dataViz/usa.json', function (error, mapData) {
    var result = displayBaseMap(mapData);
    var mapLayer = result[0];
    var projection = result[1];
    var width = result[2];
    var height = result[3];

    const showPercents = true;

    var toDisplay = 'dataViz/summary_cleaned.csv';
    displayCSV(toDisplay, mapLayer, projection, width, height, showPercents);

    $(document).ready(function(){
        $(".dropdown-toggle").dropdown();

        $(".dropdown-menu li a").click(function(){
            // $(".btn:first-child").text($(this).text());
            // $(".btn:first-child").val($(this).text());

            // modify toDisplay in here
            const click = $(this).text();
            console.log('Clicked ' + click);
            toDisplay = menuToCSV(click);
            displayCSV(toDisplay, mapLayer, projection, width, height, showPercents);
        });
    });
});

var menuToCSV = function(menuName) {
    if (menuName == 'Summary') {
        return 'dataViz/summary_cleaned.csv';
    } else if (menuName == 'Coal') {
        return 'dataViz/coal_cleaned.csv';
    } else if (menuName == 'Electricity') {
        return 'dataViz/electricity_cleaned.csv';
    } else if (menuName == 'Petroleum') {
        return 'dataViz/petroleum_cleaned.csv';
    } else if (menuName == 'Industrial') {
        return 'dataViz/industrial_cleaned.csv';
    } else if (menuName == 'Commercial') {
        return 'dataViz/commercial_cleaned.csv';
    } else if (menuName == 'Residential') {
        return 'dataViz/residential_cleaned.csv';
    } else {
        return 'dataViz/transportation_cleaned.csv';
    }
}

var displayBaseMap = function (mapData) {

    var features = mapData.features;
    console.log("loaded map data");

    var width = 960 * 2;
    var height = 500 * 2;

    var projection = d3.geo.mercator()
        .scale(700)
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
            .text("Current Year: 1990");


    mapLayer.selectAll('path')
            .data(features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke');

    console.log("done rendering base map!");

    return [mapLayer, projection, width, height];
}

const displayCSV = function(csv, mapLayer, projection, width, height, showPercents) {
    // monitors slider
    var data = null;
    var year_to_state_to_emission = {};
    var year_to_state_to_percent_change = {};
    var maxNum = 0;
    var minNum = 0;
    var maxPercent = 0;
    var minPercent = 0;

    d3.csv(csv, function(error, d) {
        
        const result =  initializeDicts(d);
        year_to_state_to_emission = result[0];
        year_to_state_to_percent_change = result[1];
        maxNum = result[2]
        minNum = result[3];
        maxPercent = result[4];
        minPercent = result[5];

        const year = document.getElementById('yearSlider').value;

        if (showPercents){
            visualize(year_to_state_to_percent_change, showPercents, maxPercent, minPercent, year, mapLayer, projection);
        } else {
            visualize(year_to_state_to_emission, showPercents, maxNum, minNum, year, mapLayer, projection);
        }
    });

    // Legend
    const indexToColor = d3.scale.linear()
                    .domain([0, 10])
                    .range(['rgb(46,73,123)', 'rgb(71, 187, 94)']);
    const range = d3.range(10).map(indexToColor);
    const quant = d3.scale.quantize()
                        .domain([0, 200, 1000])
                        .range(range);
    
    const legend = mapLayer.append("g")
                            .attr("class", "quantize")
                            .attr("transform", "translate(" + width / 9 + "," + height * 5/8 + ")");
    
    const legendQuant = d3.legend.color()
                        .title("Quantize")
                        .labelFormat(d3.format('.0f'))
                        .scale(quant);
    
    legend.call(legendQuant);


    document.getElementById('yearSlider').oninput = function() {
        const year = document.getElementById('yearSlider').value;

        const displayTitle = 'Current Year: ' + year;

        mapLayer.selectAll('text').remove();
        mapLayer.append("text")
                .attr("x", (width / 2))             
                .attr("y", 60)
                .attr("text-anchor", "middle")  
                .style("font-size", "30px") 
                .text(displayTitle);

        if (showPercents) {
            visualize(year_to_state_to_percent_change, showPercents, maxPercent, minPercent, year, mapLayer, projection);
        } else {
            visualize(year_to_state_to_emission, showPercents, maxNum, minNum, year, mapLayer, projection);
        }
    }
}

const initializeDicts = function (data) {
    const startYear = 1990;
    const endYear = 2016;

    var maxNum = 0;
    var minNum = 0;
    var maxPercent = 0;
    var minPercent = 0;
    var first = true;
    var firstRow = true;

    var year_to_state_to_emission = {};
    var year_to_state_to_percent_change = {};

    for (row in data) {
        for (var currentYear = startYear; currentYear <= endYear; currentYear++) {
            const currentState = data[row]['State'];
            const currentEmission = parseFloat(data[row][currentYear.toString()]);
            var currentPercentChange = null;
            if (currentYear != startYear) {
                currentPercentChange = parseFloat(data[row]['Percent_Change_' + currentYear.toString() + '_'+ startYear.toString()]);
            }

            if (firstRow) {
                year_to_state_to_emission[currentYear] = {};
                year_to_state_to_emission[currentYear][currentState] = currentEmission;
                if (currentYear != startYear) {
                    year_to_state_to_percent_change[currentYear] = {};
                    year_to_state_to_percent_change[currentYear][currentState] = currentPercentChange;
                }
            } else {
                year_to_state_to_emission[currentYear][currentState] = currentEmission;
                if (currentYear != startYear) {
                    year_to_state_to_percent_change[currentYear][currentState] = currentPercentChange;
                }
            }

            if (first) {
                maxNum = currentEmission;
                minNum = currentEmission;
                maxPercent = parseFloat(data[row]['Percent_Change_' + ((startYear + 1).toString()) + '_'+ startYear.toString()]);
                minPercent = maxPercent;
                first = false;
            }

            if (maxNum < currentEmission) {
                maxNum = currentEmission;
            } else if (minNum > currentEmission) {
                minNum = currentEmission;
            }

            if (currentYear != startYear) {
                if (maxPercent < currentPercentChange) {
                    maxPercent = currentPercentChange;
                } else if (minPercent > currentPercentChange) {
                    minPercent = currentPercentChange;
                }
            }
        }
        firstRow = false;
    }

    return [year_to_state_to_emission, year_to_state_to_percent_change, maxNum, minNum, maxPercent, minPercent];
}

const visualize = function (dataDict, showPercent, globalMax, globalMin, year, mapLayer, projection) {

    if (showPercent && year == '1990') {
        return;
    }

    var globalMean = 0;
    if (!showPercent) {
        globalMean = (globalMax + globalMin) / 2;
    }

    mapLayer.selectAll('path')
            .style('fill', function(d) {
                // return color_picker(state_to_emission[d.properties['STATE_NAME']], globalMin, globalMax, globalMean);
                return color_picker(dataDict[year][d.properties['STATE_NAME']], globalMin, globalMax, globalMean);
            });

}

const color_picker = function(number, globalMin, globalMax, globalMean) {
    if (globalMean == null) {
        globalMean = (globalMax + globalMin) / 2;
    }

    var hueScale = null;

    if (number < globalMean) {
        hueScale = d3.scale.linear()
                        .domain([globalMin, globalMean])
                        .range([250, 170]);
    } else {
        hueScale = d3.scale.linear()
                        .domain([globalMean, globalMax])
                        .range([60, 0]);   
    }

    return d3.hsl(hueScale(number), 1, 0.5);

}
