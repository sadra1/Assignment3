// This script demonstrates some simple things one can do with leaflet.js


var map = L.map('map').setView([40.71,-73.93], 11);

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);

// add in OSM Mapnik tiles
var OSMMapnikTiles = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution: 'Map Data and Tiles &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
});
// do not add to the map just yet, but add varible to the layer switcher control 

// add in MapQuest Open Aerial layer
/*
var MapQuestAerialTiles = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',{
  attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
});
*/


// add our geojson to the map with L.geoJson
// remember that var neighborhoods, subwayLines and pawnShops were
// set in the their .geojson files

// now let's add popups and styling 
// neighborhood choropleth map
// let's use % in poverty to color the neighborhood map

var povertyStyle = function (feature){
    var value = feature.properties.PovertyPer;
    var fillColor = null;
    if(value >= 0 && value <=0.1){
        fillColor = "#fee5d9";
    }
    if(value >0.1 && value <=0.15){
        fillColor = "#fcbba1";
    }
    if(value >0.15 && value<=0.2){
        fillColor = "#fc9272";
    }
    if(value > 0.2 && value <=0.3){
        fillColor = "#fb6a4a";
    }
    if(value > 0.3 && value <=0.4) { 
        fillColor = "#de2d26";
    }
    if(value > 0.4) { 
        fillColor = "#a50f15";
    }

    var style = {
        weight: 1,
        opacity: .1,
        color: 'white',
        fillOpacity: 0.75,
        fillColor: fillColor
    };

    return style;
}

var povertyClick = function (feature, layer) {
    var percent = feature.properties.PovertyPer * 100;
    percent = percent.toFixed(0);
    // let's bind some feature properties to a pop up
    layer.bindPopup("<strong>Neighborhood:</strong> " + feature.properties.NYC_NEIG + "<br /><strong>Percent in Poverty: </strong>" + percent + "%");
}

var neighborhoodsGeoJSON = L.geoJson(neighborhoods, {
    style: povertyStyle,
    onEachFeature: povertyClick
}).addTo(map);


// subway lines
/*var subwayStyle = {
	"color": "#a5a5a5",
    "weight": 2,
    "opacity": 0.80
};

var subwayClick = function (feature, layer) {
	// let's bind some feature properties to a pop up
	layer.bindPopup(feature.properties.Line);
}

var subwayLinesGeoJSON = L.geoJson(subwayLines, {
    style: subwayStyle,
    onEachFeature: subwayClick
}).addTo(map);
*/


// pawn shop dots
function fillColor(d) {
    return d === "A" ? '#00FF00' :
           d === "B" ? '#66FFCC' :
           d === "C" ? '#FFCC00' :
           d === "D"  ? '#FF3300' :
           d === "F"  ? '#990000' :
                        '#000';
}


function radius(d) {
    return d > 5000 ? 16 :
           d > 2200 ? 12 :
           d > 1200 ? 8  :
           d > 700 ? 6  :
           d > 400 ? 4  :
                      2 ;
}


var elemSchoolsPointToLayer = function (feature, latlng){
	var elemSchoolsMarker = L.circleMarker(latlng, {
		stroke: false,
		fillColor: fillColor(feature.properties.Overall_Gr),
		fillOpacity: 1,
        radius: radius(feature.properties.CAPACITY)
	});
	
	return elemSchoolsMarker;	
}

var elemSchoolsClick = function (feature, layer) {
	// let's bind some feature properties to a pop up
	layer.bindPopup("<strong>School Name:</strong> " + feature.properties.Name + "<br /><strong>Principal's Name:</strong> " + feature.properties.Principal + "<br/><strong>School Overall Quality: </strong>"+ feature.properties.Overall_Gr);
}

var elemSchoolsGeoJSON = L.geoJson(elemSchools, {
	pointToLayer: elemSchoolsPointToLayer,
	onEachFeature: elemSchoolsClick
}).addTo(map);


// adding in new data with leaflet.omnivore
//omnivore.csv('../csv/CheckCashing.csv').addTo(map);

// lets add these data with some styling base on two data attributes 
// and have a popup show up on hovering instead of clicking

// lets set up some global functions for setting styles for the dots
// we'll use these again in the legend

/*
function fillColor(d) {
    return d > 500000 ? '#006d2c' :
           d > 250000 ? '#31a354' :
           d > 100000 ? '#74c476' :
           d > 50000  ? '#a1d99b' :
           d > 10000  ? '#c7e9c0' :
                        '#edf8e9';
}

function radius(d) {
    return d > 9000 ? 20 :
           d > 7000 ? 12 :
           d > 5000 ? 8  :
           d > 3000 ? 6  :
           d > 1000 ? 4  :
                      2 ;
}


// first we need to define how we would like the layer styled
var checkCashingStyle = function (feature, latlng){

    var checkCashingMarker = L.circleMarker(latlng, {
        stroke: false,
        fillColor: fillColor(feature.properties.amount),
        fillOpacity: 1,
        radius: radius(feature.properties.customers)
    });
    
    return checkCashingMarker;
    
}

var checkCashingInteraction = function(feature,layer){    
    var highlight = {
        stroke: true,
        color: '#ffffff', 
        weight: 3,
        opacity: 1,
    };

    var clickHighlight = {
        stroke: true,
        color: '#f0ff00', 
        weight: 3,
        opacity: 1,
    };

    var noHighlight = {
        stroke: false,
    };
    
    //add on hover -- same on hover and mousemove for each layer
    layer.on('mouseover', function(e) {
        //highlight point
        layer.setStyle(highlight);

        // ensure that the dot is moved to the front
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        
    });
        
    layer.on('mouseout', function(e) {
        // reset style
        layer.setStyle(noHighlight); 
                        
    });
    
    // on click 
    layer.on("click",function(e){
        // bind popup and open on the map
        layer.bindPopup('<div class="popupStyle"><h3>' + feature.properties.name + '</h3><p>'+ feature.properties.address + '<br /><strong>Amount:</strong> $' + feature.properties.amount + '<br /><strong>Customers:</strong> ' + feature.properties.customers + '</p></div>').openPopup();

        // set new style for clicked point
        layer.setStyle(clickHighlight); 
    });
    
    
}


// next, we'll create a shell L.geoJson for omnivore to use to apply styling and interaction
var checkCashingCustomStuff = L.geoJson(null, {
    pointToLayer: checkCashingStyle,
    onEachFeature: checkCashingInteraction
});

// lastly, we'll call omnivore to grab the CSV and apply the styling and interaction
var checkCashingLayer = omnivore.csv('../csv/CheckCashing.csv', null, checkCashingCustomStuff).addTo(map);
*/



// add in layer controls
var baseMaps = {
    "CartoDB": CartoDBTiles,
    "OSM Mapnik": OSMMapnikTiles,
    //"Mapquest Aerial": MapQuestAerialTiles
};

var overlayMaps = {
    "Elementary Schools": elemSchoolsGeoJSON,
    //"Check Cashing": checkCashingLayer,
    //"Subway Lines": subwayLinesGeoJSON,
    "Povery Map": neighborhoodsGeoJSON
};

// add control
L.control.layers(baseMaps, overlayMaps).addTo(map);



// add in a legend to make sense of it all
// create a container for the legend and set the location
/*
var legend = L.control({position: 'bottomright'});

// using a function, create a div element for the legend and return that div
legend.onAdd = function (map) {

    // a method in Leaflet for creating new divs and setting classes
    var div = L.DomUtil.create('div', 'legend'),
        amounts = [0, 10000, 50000, 100000, 250000, 500000],
        customers = [0, 1000, 3000, 5000, 7000, 9000];

        div.innerHTML += '<p><strong>Amounts</strong></p>';

        for (var i = 0; i < amounts.length; i++) {
            div.innerHTML +=
                '<i style="background:' + fillColor(amounts[i] + 1) + '"></i> ' +
                amounts[i] + (amounts[i + 1] ? '&ndash;' + amounts[i + 1] + '<br />' : '+<br />');
        }

        div.innerHTML += '<p><strong>Customers</strong></p>';

        for (var i = 0; i < customers.length; i++) {
            var borderRadius = radius(customers[i] + 1);
            var widthHeight = borderRadius * 2;
            div.innerHTML +=
                '<i class="circle" style="width:' + widthHeight + 'px; height:' + widthHeight + 'px; -webkit-border-radius:' + borderRadius + 'px; -moz-border-radius:' + borderRadius + 'px; border-radius:' + borderRadius + 'px;"></i> ' +
                customers[i] + (customers[i + 1] ? '&ndash;' + customers[i + 1] + '<br />' : '+<br />');
        }

    return div;
};

function fillColor(d) {
    return d > 500000 ? '#006d2c' :
           d > 250000 ? '#31a354' :
           d > 100000 ? '#74c476' :
           d > 50000  ? '#a1d99b' :
           d > 10000  ? '#c7e9c0' :
                        '#edf8e9';
}

function radius(d) {
    return d > 9000 ? 20 :
           d > 7000 ? 12 :
           d > 5000 ? 8  :
           d > 3000 ? 6  :
           d > 1000 ? 4  :
                      2 ;
}

// add the legend to the map
legend.addTo(map);
*/



