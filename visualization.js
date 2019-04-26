
// used for the title, acts as "memory" to prevent a title switch in the case of when the user wants to see different stats
var oldQualifer = 'Summary';

// used to make the legend and choose colors
const redList = ['rgb(139,0,0)', 'rgb(163,3,3)', 'rgb(173,34,34)',
                    'rgb(178,57,57)', 'rgb(145,40,40)', 'rgb(163,55,55)', 'rgb(183,73,73)',
                    'rgb(165,81,81)', 'rgb(183,115,115)', 'rgb(183,134,134)', 'rgb(219,173,173)'];

// used to make the legend and choose colors
const blueList = ['rgb(0,30,160)', 'rgb(7,40,181)', 'rgb(20,51,188)', 'rgb(35,63,183)',
                    'rgb(61,100,198)', 'rgb(48,88,196)', 'rgb(69,107,204)', 'rgb(86,124,188)',
                    'rgb(94,140,186)', 'rgb(100,166,196)', 'rgb(145,213,224)', 'rgb(170,217,224)', 'rgb(205,241,247)'];

// Load map data
d3.json('dataViz/usa2.json', function (error, mapData) {
    var result = displayBaseMap(mapData);
    var mapLayer = result[0];
    var projection = result[1];
    var width = result[2];
    var height = result[3];

    var showPercents = false;

    var toDisplay = 'dataViz/summary_cleaned.csv';
    displayCSV(toDisplay, mapLayer, projection, width, height, showPercents, 'Summary');

    $(document).ready(function () {
        $(".dropdown-toggle").dropdown('toggle');
        $('.in,.open').removeClass('in open');
        $(".dropdown-menu li a").click(function () {
            // modify toDisplay in here
            const click = $(this).text();
            console.log('Clicked ' + click);

            var qualifier = oldQualifer;
            if (click == 'Raw Number') {
                showPercents = false;
            } else if (click == 'Percent Change Since 1990') {
                showPercents = true;
            } else {
                toDisplay = menuToCSV(click);
                qualifier = click;
                oldQualifer = click;
            }
            displayCSV(toDisplay, mapLayer, projection, width, height, showPercents, qualifier);
            $('.in,.open').removeClass('in open');
        });
    });
});

var menuToCSV = function (menuName) {
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

    var width = 1200;
    var height = 500;

    var projection = d3.geo.mercator()
        .scale(600)
        .center([-99, 39])
        .translate([width / 2, height / 2 + 25]);

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
            .classed("text", true)
            .attr("x", (width / 2))
            .attr("y", 60)
            .attr("text-anchor", "middle")
            .style("font-size", "30px")
            .style("font-family", "Arial")
            .text("USA CO2 Visualizations");


    mapLayer.selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke');

    console.log("done rendering base map!");

    return [mapLayer, projection, width, height];
}

const displayCSV = function (csv, mapLayer, projection, width, height, showPercents, qualifier) {
    // monitors slider
    var data = null;
    var year_to_state_to_emission = {};
    var year_to_state_to_percent_change = {};
    var maxNum = 0;
    var minNum = 0;
    var meanNum = 0;
    var maxPercent = 0;
    var minPercent = 0;

    d3.csv(csv, function (error, d) {

        const result = initializeDicts(d);
        year_to_state_to_emission = result[0];
        year_to_state_to_percent_change = result[1];
        maxNum = result[2]
        minNum = result[3];
        meanNum = result[4];
        maxPercent = result[5];
        minPercent = result[6];

        // Legend
        if (showPercents) {
            createLegend(mapLayer, width, height, maxPercent, minPercent, meanNum, showPercents);
        } else {
            createLegend(mapLayer, width, height, maxNum, minNum, meanNum, showPercents);
        }

        const year = document.getElementById('yearSlider').value;

        // colors the countries
        if (showPercents) {
            visualize(year_to_state_to_percent_change, showPercents, maxPercent, minPercent, meanNum, year, mapLayer, projection);
        } else {
            visualize(year_to_state_to_emission, showPercents, maxNum, minNum, meanNum, year, mapLayer, projection);
        }

    });


    document.getElementById('yearSlider').oninput = function () {
        const year = document.getElementById('yearSlider').value;

        var displayTitle = null;
        if (showPercents) {
            displayTitle = '[' + qualifier + ']' + ' Percent Change in CO2 from 1990 to ' + year;
        } else {
            displayTitle = '[' + qualifier + ']' + ' CO2 Emissions in Millions of Tons for ' + year;
        }

        mapLayer.selectAll('text').remove();
        mapLayer.append("text")
            .attr("x", (width / 2))
            .attr("y", 60)
            .attr("text-anchor", "middle")
            .style("font-size", "30px")
            .text(displayTitle);

        if (showPercents) {
            visualize(year_to_state_to_percent_change, showPercents, maxPercent, minPercent, meanNum, year, mapLayer, projection);
        } else {
            visualize(year_to_state_to_emission, showPercents, maxNum, minNum, meanNum, year, mapLayer, projection);
        }
    }
}

const initializeDicts = function (data) {
    const startYear = 1990;
    const endYear = 2016;

    var maxNum = 0;
    var minNum = 0;
    var meanNum = 0;
    var count = 0;
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
                currentPercentChange = parseFloat(data[row]['Percent_Change_' + currentYear.toString() + '_' + startYear.toString()]);
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
                maxPercent = parseFloat(data[row]['Percent_Change_' + ((startYear + 1).toString()) + '_' + startYear.toString()]);
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
            meanNum += currentEmission;
            count++;
        }
        firstRow = false;
    }
    meanNum = meanNum / count;
    return [year_to_state_to_emission, year_to_state_to_percent_change, maxNum, minNum, meanNum, maxPercent, minPercent];
}

const createLegend = function(mapLayer, width, height, maxNum, minNum, meanNum, showPercents) {
    
    if (showPercents) {
        meanNum = 0;
    }

    const indexToColor = function(min, max, mean, num) {
        if (num <= mean) {
            const hueScale = d3.scale.quantize()
                                .domain([min, mean])
                                .range(blueList);
            return hueScale(num);
        } else {
            const hueScale = d3.scale.quantize()
                                .domain([max, mean])
                                .range(redList);
            return hueScale(num);
        }
    }

    const boxes = 10;
    var domain = [];
    var range = [];
    for (var i = 0; i < boxes / 2; i++) {
        const lowerBound = (meanNum - minNum) / (boxes / 2) * i + minNum;
        const upperBound = (meanNum - minNum) / (boxes / 2) * (i + 1) + minNum;
        const num = (lowerBound + upperBound) / 2;
        domain.push(lowerBound.toString().slice(0, 5) + " to " + upperBound.toString().slice(0, 5));
        range.push(indexToColor(minNum, maxNum, meanNum, num));
    }
    for (var i = 0; i < boxes / 2; i++) {
        const lowerBound = (maxNum - meanNum) / (boxes / 2) * i + meanNum;
        const upperBound = (maxNum - meanNum) / (boxes / 2) * (i + 1) + meanNum;
        const num = (lowerBound + upperBound) / 2;
        domain.push(lowerBound.toString().slice(0, 5) + " to " + upperBound.toString().slice(0, 5));
        range.push(indexToColor(minNum, maxNum, meanNum, num));
    }

    const quant = d3.scale.ordinal()
                            .domain(domain)
                            .range(range);

    mapLayer.select('g').remove();
    const legend = mapLayer.append("g")
                            .attr("class", "quantize")
                            .attr("transform", "translate(" + width / 9 + "," + height / 2 + ")")
                            .style('font-family', 'Garamond')
                            .style('font-size', '16')
                            .style('position', 'absolute');

    const legendQuant = d3.legend.color()
                                    .title("Color Legend")
                                    .labelFormat(d3.format('.0f'))
                                    .scale(quant);

    legend.call(legendQuant);
}

const visualize = function (dataDict, showPercent, globalMax, globalMin, globalMean, year, mapLayer, projection) {
    // no difference!
    if (showPercent && year == '1990') {
        return;
    }

    if (showPercent) {
        globalMean = 0;
    }

    mapLayer.selectAll('path')
        .style('fill', function (d) {
            return color_picker(dataDict[year][d.properties['STATE_NAME']], globalMin, globalMax, globalMean);
        });

}

const color_picker = function (number, globalMin, globalMax, globalMean) {
    
    var hueScale = null;

    // const combinedList = blueList.concat(redList.reverse());
    
    if (number < globalMean) {
        hueScale = d3.scale.quantize()
                            .domain([globalMin, globalMean])
                            .range(blueList);
    } else {
        hueScale = d3.scale.quantize()
                            .domain([globalMax, globalMean])
                            .range(redList);
    }

    return hueScale(number);

}
