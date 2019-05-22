function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<p>${new Date(feature.properties.time)}</p>`);

    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: (function (feature, latlng) {
            return L.circleMarker(latlng, {
                fillOpacity: 0.75,
                stroke: false,
                fillColor: circleColor(feature.properties.mag),
                radius: circleSize(feature.properties.mag)
            })
        })
    })
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Dark Map": darkmap,
        "Street Map": streetmap,
        // "Satellite": satmap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map-id", {
        center: [20, 0],
        zoom: 2,
        layers: [darkmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend to display information about our map
    const legend = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    legend.onAdd = function (myMap) {
        const div = L.DomUtil.create("div", "legend");
        const scale = [0, 1, 2, 3, 4, 5]

        // loop to create legend intervals 
        for (let i = 0; i < scale.length; i++) {
            div.innerHTML += '<i style="background:' + circleColor(scale[i] + 1) + '"></i> ' +
                scale[i] + (scale[i + 1] ? '&ndash;' + scale[i + 1] + '<br>' : '+')
        }
        return div;
    };
    // Add the info legend to the map
    legend.addTo(myMap);
}

// function to assign circle (and legend) color based on magnitude
function circleColor(mag) {

    if (mag > 5) {
        return "#f30"
    } else if (mag > 4) {
        return "#f60"
    } else if (mag > 3) {
        return "#f90"
    } else if (mag > 2) {
        return "#fc0"
    } else if (mag > 1) {
        return "#ff0"
    } else {
        return "#9f3"
    }
}

// function to assign size of circle based on magnitude
function circleSize(mag) {
    return mag * 2.5
}

(async function () {
    const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    const data = await d3.json(queryUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
})()