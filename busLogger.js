var http = require('http');
var fs = require('fs');

var csvFile = "busLocations.csv";

var updateLocation = function (response) {
    var data = '';

    response.on('data', function (chunk) {
        data += chunk;
    });

    response.on('end', function() {
        var result = [],
            response = JSON.parse(data);

        // Don't use for..in. The order is arbitrary.
        // Also, some of the response values are numbers so make sure they're
        // strings that you can concatenate
        result.push(response.Id.toString());
        result.push(response.BusNumber.toString());
        result.push(response.Latitude.toString());
        result.push(response.Longitude.toString());
        result.push(response.TimeStamp.toString());
        result.push(response.RotationDegree.toString());

        fs.appendFile(csvFile, result.join(',')+'\n', function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    });
};

var getBusLocations = function (buses) {
    console.log("Getting bus locations");
    for (var i = 0; i < buses.length; i++) {
        http.get("http://www.uml.edu/api/Transportation/BusLocation/" + buses[i],
                 updateLocation).on('error', function(e) {
                    console.log("Got error: " + e.message);
                 });
    }
}

var getBuses = function (response) {
    var data = '';

    response.on('data', function (chunk) {
        data += chunk;
    });

    response.on('end', function() {
        console.log("Getting buses");
        var buses = [];
        var response = JSON.parse(data);

        for (var i = 0; i < response.data.length; i++) {
            for (var j = 0; j < response.data[i]['routes'].length; j++) {
                buses = buses.concat(response.data[i]['routes'][j].buses);
            }
        }

        console.log(buses);

        getBusLocations(buses);
    });
}

setInterval(function() { http.get('http://www.uml.edu/api/Transportation/BusRoutes', getBuses).on('error', function(e) {
                            console.log("Got error: " + e.message);
                        }); }, 15000);
