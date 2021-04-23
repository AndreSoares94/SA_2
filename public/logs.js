
const mymap = L.map('localmap').setView([41.551057618862046, -8.422994320451291], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY29ydGF1bmhhcyIsImEiOiJja250bXU1MDcwNGg3MnFydnpxeWNhNXhuIn0.2XxGtaOFN3Q5n52RyfluVg'
}).addTo(mymap);

getData();

var table = document.getElementById("myTable");
var row_header = table.insertRow(0);
row_header.insertCell(0).outerHTML = "<th>Hora do Scan</th><th>Nº Incidentes</th></th>";

async function getData(){
    const response = await fetch('/api');
    const data = await response.json();

    for(item of data){
        //console.log(item);
        var row = table.insertRow(1);
        var date = new Date(item.timestamp).toLocaleString("en-US");
        var numberOfIncidents = item.incidents.length;
        var cell_date = row.insertCell(0);
        var cell_numberIncidents = row.insertCell(1);
        cell_date.innerHTML = date;
        cell_numberIncidents.innerHTML = numberOfIncidents;

        for(item of item.incidents){

            //console.log(item);
            const marker = L.marker([item.geometry.coordinates[0][1], item.geometry.coordinates[0][0]]).addTo(mymap);
            const txt = `Incidente desde: ${item.properties.from} até ${item.properties.to}`;
            marker.bindPopup(txt);
        }
        //console.log(item.incidents[1].geometry.coordinates[0][0]);

        /*var points = [[item.incidents[0].geometry.coordinates[0][1], item.incidents[0].geometry.coordinates[0][0]],
                        [item.incidents[0].geometry.coordinates[1][1], item.incidents[0].geometry.coordinates[1][0]],
                        [item.incidents[0].geometry.coordinates[2][1], item.incidents[0].geometry.coordinates[2][0]],
                        [item.incidents[0].geometry.coordinates[3][1], item.incidents[0].geometry.coordinates[3][0]]];
        //const path = L.polyline(points ,{color: 'red', weight: 8}).addTo(mymap);*/

        
    }
    console.log(data);
}