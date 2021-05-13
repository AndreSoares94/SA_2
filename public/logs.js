
const mymap = L.map('localmap').setView([41.1670231326828, -8.611294399071793], 12);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY29ydGF1bmhhcyIsImEiOiJja250bXU1MDcwNGg3MnFydnpxeWNhNXhuIn0.2XxGtaOFN3Q5n52RyfluVg'
}).addTo(mymap);

/* sets de dados para o PieChart de Tipo de Incidente*/
var iconCategory = ['Unknown','Accident','Fog','Dangerous Conditions','Rain','Ice','Jam','Lane Closed','Road Closed',
'Road Works','Wind','Flooding','Broken Down Vehicle'];
var iconCategoryData = [0,0,0,0,0,0,0,0,0,0,0,0,0];


/* sets de dados para o PieChart de Tipo de Delay*/
var magnitudeOfDelaySet = ['Unknown','Minor','Moderate','Major','Undefined'];
var magnitudeOfDelayData = [0,0,0,0,0];


let UnicosMap = new Map();


getData();

/* Criaçao da tabela */
var table = document.getElementById("myTable");
var row_header = table.insertRow(0);
row_header.insertCell(0).outerHTML = "<th>Hora do Scan</th><th>Nº Incidentes</th></th>";

/* cores para os graficos */
var color = Chart.helpers.color;
window.chartColors = {
    red: 'rgb(255, 99, 132)',
    red2: 'rgb(179, 45, 0)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    yellow2: 'rgb(255, 255, 153)',
    green: 'rgb(75, 192, 192)',
    green2: 'rgb(0, 153, 51)',
    blue: 'rgb(54, 162, 235)',
    blue2: 'rgb(0, 0, 255)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    black: 'rgb(0, 0, 0)',
    white: 'rgb(242, 242, 242)'
};

var data_number_incidents = [];

async function getData(){
    // numero de leituras totais
    var numLeituras = 0;
    // numero de incidentes totais
    var numeroTotalIncidentes = 0;
    // sets para guardar info sobre o acidente com maior delay e maior comprimento
    var DelayMaxAci = ['RuaFrom','RuaTo',0,'StartTime','EndTime',0];
    var LengthMaxAci = ['RuaFrom','RuaTo',0,'StartTime','EndTime',0];
    // valor maximo de delay num incidente
    var DelayMaximo = 0;
    // valor maximo de comprimento num incidente
    var LengthMax = 0;
    // valor total de incidentes que nao sao roadWork
    var notRoadWorks = 0;

    var mostIncidents = ['Data',0];

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
        
        numLeituras++;

        //inserir na tabela:
        var row = table.insertRow(1);
        var date = new Date(item.timestamp).toLocaleString("en-US");
        var numberOfIncidents = item.incidents.length;
        var cell_date = row.insertCell(0);
        var cell_numberIncidents = row.insertCell(1);
        cell_date.innerHTML = date;
        cell_numberIncidents.innerHTML = numberOfIncidents;

        if(numberOfIncidents>mostIncidents[1]){
            mostIncidents[0] = new Date(date).toLocaleString("en-GB", {day: "numeric", month: "short", hour: "numeric", minute: "numeric"})
            mostIncidents[1] = numberOfIncidents;
        }

        data_number_incidents.push({
            x: moment(date),
            y: numberOfIncidents
        })

        numeroTotalIncidentes += numberOfIncidents;

        //pontos no mapa:
        for(item of item.incidents){

            //iconCategoryData[item.properties.iconCategory]++;
            if(!UnicosMap.has(item.properties.id)){
                UnicosMap.set(item.properties.id, { delay: item.properties.delay, iconCategory: item.properties.iconCategory,
                    magnitudeOfDelay: item.properties.magnitudeOfDelay, length: item.properties.length});
                
                if(item.properties.iconCategory != 8) notRoadWorks++;

                for(itemzinho of item.properties.events){
                    iconCategoryData[itemzinho.iconCategory]++;
                }
            }
            
                                                
            if(item.properties.length > LengthMax){
                LengthMax = item.properties.length;
                LengthMaxAci[0]=item.properties.from;
                LengthMaxAci[1]=item.properties.to;
                LengthMaxAci[2]=item.properties.delay;
                LengthMaxAci[3]=item.properties.startTime;
                LengthMaxAci[4]=item.properties.endTime;
                LengthMaxAci[5]=item.properties.length;
            } 
            if(item.properties.delay > DelayMaximo){
                DelayMaximo = item.properties.delay;
                DelayMaxAci[0]=item.properties.from;
                DelayMaxAci[1]=item.properties.to;
                DelayMaxAci[2]=item.properties.delay;
                DelayMaxAci[3]=item.properties.startTime;
                DelayMaxAci[4]=item.properties.endTime;
                DelayMaxAci[5]=item.properties.length;
            } 
            //console.log(item);
            /*
            const marker = L.marker([item.geometry.coordinates[0][1], item.geometry.coordinates[0][0]]).addTo(mymap);
            const txt = `Incidente desde: ${item.properties.from} até ${item.properties.to}`;
            marker.bindPopup(txt);*/
        }
        //console.log(item.incidents[1].geometry.coordinates[0][0]);

        /* preencher caminho mapa
        var points = [[item.incidents[0].geometry.coordinates[0][1], item.incidents[0].geometry.coordinates[0][0]],
                        [item.incidents[0].geometry.coordinates[1][1], item.incidents[0].geometry.coordinates[1][0]],
                        [item.incidents[0].geometry.coordinates[2][1], item.incidents[0].geometry.coordinates[2][0]],
                        [item.incidents[0].geometry.coordinates[3][1], item.incidents[0].geometry.coordinates[3][0]]];
        //const path = L.polyline(points ,{color: 'red', weight: 8}).addTo(mymap);*/

        
    }
    
    var delayTotal = 0;
    for (let value of UnicosMap.values()) {
        delayTotal += value.delay;
        //iconCategoryData[value.iconCategory]++;
        magnitudeOfDelayData[value.magnitudeOfDelay]++;
    }

    /** definicao do grafico de incidents **/
    var scatter_data_number_incidents = {
        datasets: [{
           label: 'Incidentes',
           borderColor: window.chartColors.blue,
           backgroundColor: color(window.chartColors.black).alpha(0.9).rgbString(),
           pointRadius: 4,
           data: data_number_incidents
        }]};

    /** grafico de numero incidentes **/
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


    
    /**Configurar pie de tipo de incidentes**/
    var ctx = document.getElementById('pie_chart').getContext('2d');
    var config = {
        type: 'pie',
        data: {
            datasets: [{
                data: iconCategoryData,
                backgroundColor: [
                    color(window.chartColors.red).alpha(0.9).rgbString(),
                    color(window.chartColors.orange).alpha(0.9).rgbString(),
                    color(window.chartColors.blue).alpha(0.9).rgbString(),
                    color(window.chartColors.grey).alpha(0.9).rgbString(),
                    color(window.chartColors.yellow).alpha(0.9).rgbString(),
                    color(window.chartColors.green).alpha(0.9).rgbString(),
                    color(window.chartColors.purple).alpha(0.9).rgbString(),
                    color(window.chartColors.black).alpha(0.9).rgbString(),
                    color(window.chartColors.green2).alpha(0.9).rgbString(),
                    color(window.chartColors.blue2).alpha(0.9).rgbString(),
                    color(window.chartColors.yellow2).alpha(0.9).rgbString(),
                    color(window.chartColors.red2).alpha(0.9).rgbString(),
                    color(window.chartColors.white).alpha(0.9).rgbString(),
                ],
                label: 'Dataset 1'
            }],
            labels: iconCategory
        },
        options: {
            responsive: true,
            animation: {
                animateScale : true
            },
            title: {
                display: true,
                text: 'Causa dos incidentes'
            },
        }
    };
    window.pie_chart = new Chart(ctx, config);

    /**Configurar pie de tipo de incidentes**/
    var ctx_Mag = document.getElementById('pie_chart_Mag').getContext('2d');
    var config_Mag = {
        type: 'pie',
        data: {
            datasets: [{
                data: magnitudeOfDelayData,
                backgroundColor: [
                    color(window.chartColors.red).alpha(0.9).rgbString(),
                    color(window.chartColors.orange).alpha(0.9).rgbString(),
                    color(window.chartColors.blue).alpha(0.9).rgbString(),
                    color(window.chartColors.green).alpha(0.9).rgbString(),
                    color(window.chartColors.yellow).alpha(0.9).rgbString()
                ],
                label: 'Dataset 1'
            }],
            labels: magnitudeOfDelaySet
        },
        options: {
            responsive: true,
            animation: {
                animateScale : true
            },
            title: {
                display: true,
                text: 'Magnitude do Atrasado'
            },
        }
    };
    window.pie_chart_Mag = new Chart(ctx_Mag, config_Mag);

        

    //console.log(delayTotal);
    /* media de delay em segundos excepto em road closures
    //console.log("Numero acidentes Unicos:" + UnicosMap.size);
    console.log("Delay medio:" + delayTotal/UnicosMap.size);
    console.log("Delay medio A:" + delayTotal/notRoadWorks);
    console.log("Total:" + UnicosMap.size);
    console.log("Total A:" + notRoadWorks);
    console.log(data);
    console.log(mostIncidents);*/

    document.getElementById('numberTotalIncidents').textContent = numeroTotalIncidentes;
    document.getElementById('numberUniqueTotalIncidents').textContent = UnicosMap.size;
    document.getElementById('DelayMedio').textContent = (delayTotal/notRoadWorks).toFixed(0);


    document.getElementById('DelayMaximo').textContent = DelayMaximo;
    document.getElementById('DelayMaximoStart').textContent = DelayMaxAci[0];
    document.getElementById('DelayMaximoFinal').textContent = DelayMaxAci[1];
    document.getElementById('DelayMaximoLength').textContent = DelayMaxAci[5].toFixed(2);
    document.getElementById('DelayMaximoSTime').textContent = DelayMaxAci[3];
    document.getElementById('DelayMaximoFTime').textContent = DelayMaxAci[4];

    document.getElementById('LengthMax').textContent = LengthMax.toFixed(2);
    document.getElementById('LengthMaxStart').textContent = LengthMaxAci[0];
    document.getElementById('LengthMaxFinal').textContent = LengthMaxAci[1];
    document.getElementById('LengthMaxDelay').textContent = LengthMaxAci[2];
    document.getElementById('LengthMaxSTime').textContent = LengthMaxAci[3];
    document.getElementById('LengthMaxFTime').textContent = LengthMaxAci[4];

    document.getElementById('numberOfReads').textContent = numLeituras;
    
    document.getElementById('DateMostIncidents').textContent = mostIncidents[0];
    document.getElementById('MostSingleIncidents').textContent = mostIncidents[1];
}


const buttonTable = document.getElementById('tableButton');
buttonTable.addEventListener('click', function(e) {
    var x = document.getElementById("myTable");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
})