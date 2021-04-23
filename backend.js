/** THIS IS THE SERVER, HOSTS STATIC FILES WHICH HAPPENS TO BE index.html
  * SAVE TO DATABASE
  * AUTHENTICATION
  */

// express is used to build web services, importing express:
const { request, response } = require('express');
const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');

//create app
const app = express();

// listen at port:
app.listen(3000, () => console.log('listening at 3000'));

/**
 * objetive: serve webpage: index.html that is the public folder
 */
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

// Create and load database:
const database = new Datastore('database.db');
database.loadDatabase();

/** insert things in database:
 * database.insert({name: 'Andre', status: 'rainbow'});
 * database.insert({name: 'Soares', status: 'test'});
*/

/**
 * Setting up the GET
 */
app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        response.json(data);
    });
});

/**
 * Setting up api to the client send data, he going to get the data (POST) in /api
 * request is what the client send us
 * response is our response to the client (sending back the info in json)
 */
app.post('/api', (request, response) => {
   const data = request.body;
   const timestamp = Date.now();
   data.timestamp = timestamp;
   database.insert(data);
   response.json(data);
});


app.get('/incidents', async (request, response) => {

    const incidents_url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=3Nx9dow0fimxs9gM5UrALAJnu2r1RWon&bbox=-8.447704018864206,41.53338260648846,-8.396748291176934,41.56865075758634&fields=%7Bincidents%7Btype,geometry%7Btype,coordinates%7D,properties%7Bid,iconCategory,magnitudeOfDelay,events%7Bdescription,code,iconCategory%7D,startTime,endTime,from,to,length,delay,roadNumbers,aci%7BprobabilityOfOccurrence,numberOfReports,lastReportTime%7D%7D%7D%7D&language=en-GB`;
    const incidents_response = await fetch(incidents_url);
    const incidents_data = await incidents_response.json();
    //console.log(incidents_data);

    /*
    const data = {
        incidents: incidents_data
    };*/
    response.json(incidents_data);
});