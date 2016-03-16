var GoogleMapsAPI = require('googlemaps');
var http = require('http');
var parse = require('url').parse;
var SERVER = "127.0.0.1";
var PORT = 8080;
/*
 * Create a googlemaps API object
 */
var mapConfig = {
    key: "AIzaSyB6ky0s6kmaxH15hsxsNHKuZeI6n_OG2eA",
    encoding_policy: false,
    secure: true
};

var gmAPI = new GoogleMapsAPI(mapConfig);
var server = http.createServer( function(req, res){
    var param = parse(req.url, true);
    if ( param.pathname == '/calculate') {
        if ( param.query.origin !== undefined  && param.query.dest !== undefined) {
            // should check aerospike DB for the source and distance. 
            // If it exists return the distance and time from DB.
            // Else invoke google API and return the results.
            var params = {
                origins: param.query.origin,
                destinations: param.query.dest
            };
            console.log(params);
            var requestProcessed = false;
            gmAPI.distance(params, function(err, result){
                if (err && !requestProcessed) {
                    console.log("error called for first time");
                    requestProcessed = true;
                    console.log("error " + err);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Error in retrieving route ' + err);
                    
                }
                else{
                    if (result['rows'][0]['elements'][0]['status'] === "OK") {
                        dist = result['rows'][0]['elements'][0]['distance']['text'];
                        dur = result['rows'][0]['elements'][0]['duration']['text'];
                        org = result['origin_addresses'][0];
                        dest = result['destination_addresses'][0];
                        console.log(org, dest, dist, dur);
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        output = "The distance between " + org + " and " + dest + " : " + dist +
                            " \nThe duration to travel the distance : " + dur;
                        res.write(output);
                        res.end();
                    }
                    else {
                        res.writeHead(400, {'Content-Type':'text/plain'});
                        res.end('Results ' + result['rows'][0]['elements'][0]['status'])
                    }
                }
            });
        }  
        else {
            res.writeHead(400, {'Content-Type': 'text/plain'});
            res.end('Malformed URL');
        }
    }
    else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        var html = "<html> " +
                    "<body>" +
                    "<form action = \"calculate\">" +
                        "Origin :<br>" +
                        "<input type=\"text\" name=\"origin\"><br>" +
                        "Destination:<br>" +
                        "<input type=\"text\" name=\"dest\">" +
                        "<input type=\"submit\" value=\"Submit\">" +
                    "</form>" + 
                    "</body>" + 
                    "</html>";
            res.write(html);
            res.end();
    }
            
}).listen(PORT, SERVER);

console.log('server running at http://' + SERVER + ":" + PORT + '/')
