
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

/* cores para os graficos */
var color = Chart.helpers.color;
window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

var data_number_incidents= [];

async function getData(){
    /* GET /api ou seja data da base de dados (tds os incidentes recolhidos) */
    const response = await fetch('/api');
    const data = await response.json();
    
    /* GET /incidents ou seja data atual (incidentes atuais) */
    const response_inc = await fetch('/incidents');
    const data_inc = await response_inc.json();

    //colocar pontos dos incidentes atuais no mapa:
    for (item of data_inc.incidents){
        const marker = L.marker([item.geometry.coordinates[0][1], item.geometry.coordinates[0][0]]).addTo(mymap);
        const txt = `Incidente desde: ${item.properties.from} até ${item.properties.to}`;
        marker.bindPopup(txt);
    }

    //preencher tabela com data da base de dados:
    for(item of data){
        //console.log(item);
        var row = table.insertRow(1);
        var date = new Date(item.timestamp).toLocaleString("en-US");
        var numberOfIncidents = item.incidents.length;
        var cell_date = row.insertCell(0);
        var cell_numberIncidents = row.insertCell(1);
        cell_date.innerHTML = date;
        cell_numberIncidents.innerHTML = numberOfIncidents;

        data_number_incidents.push({
            x: moment(date),
            y: numberOfIncidents
        })

        /** definicao do grafico de temperatura **/
        var scatter_data_number_incidents = {
            datasets: [{
               label: 'Incidentes',
               borderColor: window.chartColors.blue,
               backgroundColor: color(window.chartColors.black).alpha(0.9).rgbString(),
               pointRadius: 4,
               data: data_number_incidents
            }]};

        /** grafico de temperatura **/
        var chart_incidents = document.getElementById('canvas_incidents').getContext('2d');
        window.scatter_temp = new Chart(chart_incidents, {
            type: 'scatter',
            data: scatter_data_number_incidents,
            options: {
                title: {
                    display: true,
                    text: 'Gráfico do Numero de Incidentes'
                },
                scales: {
                    xAxes: [{
                        ticks: {callback: (value) => {return new Date(value).toLocaleString("en-US", {day: "numeric", month: "short", hour: "numeric"});}}
                    }]
                },
                tooltips:{
                    callbacks: {
                        label: (tooltipItem, data) => {return new Date(tooltipItem.xLabel).toLocaleString("en-US", {day: "numeric", month: "short", hour: "numeric", minute: "numeric"}) + ' , '+tooltipItem.yLabel;}
                    }
                }
            }
        });

        /*
        //pontos no mapa:
        for(item of item.incidents){

            //console.log(item);
            const marker = L.marker([item.geometry.coordinates[0][1], item.geometry.coordinates[0][0]]).addTo(mymap);
            const txt = `Incidente desde: ${item.properties.from} até ${item.properties.to}`;
            marker.bindPopup(txt);
        }
        //console.log(item.incidents[1].geometry.coordinates[0][0]);

        /* preencher caminho mapa
        var points = [[item.incidents[0].geometry.coordinates[0][1], item.incidents[0].geometry.coordinates[0][0]],
                        [item.incidents[0].geometry.coordinates[1][1], item.incidents[0].geometry.coordinates[1][0]],
                        [item.incidents[0].geometry.coordinates[2][1], item.incidents[0].geometry.coordinates[2][0]],
                        [item.incidents[0].geometry.coordinates[3][1], item.incidents[0].geometry.coordinates[3][0]]];
        //const path = L.polyline(points ,{color: 'red', weight: 8}).addTo(mymap);*/

        
    }
    console.log(data);
}