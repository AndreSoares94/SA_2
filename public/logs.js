/*
 (c) 2014, Vladimir Agafonkin
 simpleheat, a tiny JavaScript library for drawing heatmaps with Canvas
 https://github.com/mourner/simpleheat
*/
!function(){"use strict";function t(i){return this instanceof t?(this._canvas=i="string"==typeof i?document.getElementById(i):i,this._ctx=i.getContext("2d"),this._width=i.width,this._height=i.height,this._max=1,void this.clear()):new t(i)}t.prototype={defaultRadius:25,defaultGradient:{.4:"blue",.6:"cyan",.7:"lime",.8:"yellow",1:"red"},data:function(t,i){return this._data=t,this},max:function(t){return this._max=t,this},add:function(t){return this._data.push(t),this},clear:function(){return this._data=[],this},radius:function(t,i){i=i||15;var a=this._circle=document.createElement("canvas"),s=a.getContext("2d"),e=this._r=t+i;return a.width=a.height=2*e,s.shadowOffsetX=s.shadowOffsetY=200,s.shadowBlur=i,s.shadowColor="black",s.beginPath(),s.arc(e-200,e-200,t,0,2*Math.PI,!0),s.closePath(),s.fill(),this},gradient:function(t){var i=document.createElement("canvas"),a=i.getContext("2d"),s=a.createLinearGradient(0,0,0,256);i.width=1,i.height=256;for(var e in t)s.addColorStop(e,t[e]);return a.fillStyle=s,a.fillRect(0,0,1,256),this._grad=a.getImageData(0,0,1,256).data,this},draw:function(t){this._circle||this.radius(this.defaultRadius),this._grad||this.gradient(this.defaultGradient);var i=this._ctx;i.clearRect(0,0,this._width,this._height);for(var a,s=0,e=this._data.length;e>s;s++)a=this._data[s],i.globalAlpha=Math.max(a[2]/this._max,t||.05),i.drawImage(this._circle,a[0]-this._r,a[1]-this._r);var n=i.getImageData(0,0,this._width,this._height);return this._colorize(n.data,this._grad),i.putImageData(n,0,0),this},_colorize:function(t,i){for(var a,s=3,e=t.length;e>s;s+=4)a=4*t[s],a&&(t[s-3]=i[a],t[s-2]=i[a+1],t[s-1]=i[a+2])}},window.simpleheat=t}(),/*
 (c) 2014, Vladimir Agafonkin
 Leaflet.heat, a tiny and fast heatmap plugin for Leaflet.
 https://github.com/Leaflet/Leaflet.heat
*/
L.HeatLayer=(L.Layer?L.Layer:L.Class).extend({initialize:function(t,i){this._latlngs=t,L.setOptions(this,i)},setLatLngs:function(t){return this._latlngs=t,this.redraw()},addLatLng:function(t){return this._latlngs.push(t),this.redraw()},setOptions:function(t){return L.setOptions(this,t),this._heat&&this._updateOptions(),this.redraw()},redraw:function(){return!this._heat||this._frame||this._map._animating||(this._frame=L.Util.requestAnimFrame(this._redraw,this)),this},onAdd:function(t){this._map=t,this._canvas||this._initCanvas(),t._panes.overlayPane.appendChild(this._canvas),t.on("moveend",this._reset,this),t.options.zoomAnimation&&L.Browser.any3d&&t.on("zoomanim",this._animateZoom,this),this._reset()},onRemove:function(t){t.getPanes().overlayPane.removeChild(this._canvas),t.off("moveend",this._reset,this),t.options.zoomAnimation&&t.off("zoomanim",this._animateZoom,this)},addTo:function(t){return t.addLayer(this),this},_initCanvas:function(){var t=this._canvas=L.DomUtil.create("canvas","leaflet-heatmap-layer leaflet-layer"),i=L.DomUtil.testProp(["transformOrigin","WebkitTransformOrigin","msTransformOrigin"]);t.style[i]="50% 50%";var a=this._map.getSize();t.width=a.x,t.height=a.y;var s=this._map.options.zoomAnimation&&L.Browser.any3d;L.DomUtil.addClass(t,"leaflet-zoom-"+(s?"animated":"hide")),this._heat=simpleheat(t),this._updateOptions()},_updateOptions:function(){this._heat.radius(this.options.radius||this._heat.defaultRadius,this.options.blur),this.options.gradient&&this._heat.gradient(this.options.gradient),this.options.max&&this._heat.max(this.options.max)},_reset:function(){var t=this._map.containerPointToLayerPoint([0,0]);L.DomUtil.setPosition(this._canvas,t);var i=this._map.getSize();this._heat._width!==i.x&&(this._canvas.width=this._heat._width=i.x),this._heat._height!==i.y&&(this._canvas.height=this._heat._height=i.y),this._redraw()},_redraw:function(){var t,i,a,s,e,n,h,o,r,d=[],_=this._heat._r,l=this._map.getSize(),m=new L.Bounds(L.point([-_,-_]),l.add([_,_])),c=void 0===this.options.max?1:this.options.max,u=void 0===this.options.maxZoom?this._map.getMaxZoom():this.options.maxZoom,f=1/Math.pow(2,Math.max(0,Math.min(u-this._map.getZoom(),12))),g=_/2,p=[],v=this._map._getMapPanePos(),w=v.x%g,y=v.y%g;for(t=0,i=this._latlngs.length;i>t;t++)if(a=this._map.latLngToContainerPoint(this._latlngs[t]),m.contains(a)){e=Math.floor((a.x-w)/g)+2,n=Math.floor((a.y-y)/g)+2;var x=void 0!==this._latlngs[t].alt?this._latlngs[t].alt:void 0!==this._latlngs[t][2]?+this._latlngs[t][2]:1;r=x*f,p[n]=p[n]||[],s=p[n][e],s?(s[0]=(s[0]*s[2]+a.x*r)/(s[2]+r),s[1]=(s[1]*s[2]+a.y*r)/(s[2]+r),s[2]+=r):p[n][e]=[a.x,a.y,r]}for(t=0,i=p.length;i>t;t++)if(p[t])for(h=0,o=p[t].length;o>h;h++)s=p[t][h],s&&d.push([Math.round(s[0]),Math.round(s[1]),Math.min(s[2],c)]);this._heat.data(d).draw(this.options.minOpacity),this._frame=null},_animateZoom:function(t){var i=this._map.getZoomScale(t.zoom),a=this._map._getCenterOffset(t.center)._multiplyBy(-i).subtract(this._map._getMapPanePos());L.DomUtil.setTransform?L.DomUtil.setTransform(this._canvas,a,i):this._canvas.style[L.DomUtil.TRANSFORM]=L.DomUtil.getTranslateString(a)+" scale("+i+")"}}),L.heatLayer=function(t,i){return new L.HeatLayer(t,i)};
// CENAS PARA HEATMAP ACIMA DISTO https://github.com/Leaflet/Leaflet.heat

const mymap = L.map('localmap').setView([41.1670231326828, -8.611294399071793], 12);

const mysecondmap = L.map('maptotal').setView([41.1670231326828, -8.611294399071793], 12);

const myheatMapTotal = L.map('heatMapTotal').setView([41.1670231326828, -8.611294399071793], 12);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY29ydGF1bmhhcyIsImEiOiJja250bXU1MDcwNGg3MnFydnpxeWNhNXhuIn0.2XxGtaOFN3Q5n52RyfluVg'
}).addTo(mymap);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY29ydGF1bmhhcyIsImEiOiJja250bXU1MDcwNGg3MnFydnpxeWNhNXhuIn0.2XxGtaOFN3Q5n52RyfluVg'
}).addTo(mysecondmap);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY29ydGF1bmhhcyIsImEiOiJja250bXU1MDcwNGg3MnFydnpxeWNhNXhuIn0.2XxGtaOFN3Q5n52RyfluVg'
}).addTo(myheatMapTotal);


/* sets de dados para o PieChart de Tipo de Incidente*/
var iconCategory = ['Desconhecido','Acidente','Nevoeiro','Condições Perigosas','Chuva','Gelo','Transito','Via Fechada','Rua Fechada',
'Obras','Vento','Cheias','Veículo Avariado'];
var iconCategoryData = [0,0,0,0,0,0,0,0,0,0,0,0,0];


/* sets de dados para o PieChart de Tipo de Delay*/
var magnitudeOfDelaySet = ['Desconhecido','Baixo','Moderado','Alto','Não Definido'];
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

/* Icones de carro e rua fechada: */
var roadClosedIcon = L.icon({
    iconUrl: 'roadclosed.png',
    iconSize: [20, 20],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});
var jamIcon = L.icon({
    iconUrl: 'car.png',
    iconSize: [20, 20],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
});

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
    console.log(data_inc);
    for (item of data_inc.incidents){
        if(item.properties.iconCategory == 8){
            const markerClosed = L.marker([item.geometry.coordinates[0][1], item.geometry.coordinates[0][0]], {icon: roadClosedIcon}).addTo(mymap);
            const txtClosed = `Rua Fechada: ${item.properties.from} até ${item.properties.to}`;
            markerClosed.bindPopup(txtClosed);
        }
        else{
            const marker = L.marker([item.geometry.coordinates[0][1], item.geometry.coordinates[0][0]],{icon: jamIcon}).addTo(mymap);
            const txt = `Incidente desde: ${item.properties.from} até ${item.properties.to}, 
                        Magnitude Atraso: ${magnitudeOfDelaySet[item.properties.magnitudeOfDelay]},
                        Causa Incidente: ${iconCategory[item.properties.iconCategory]}`;
            marker.bindPopup(txt);
        }
        
    }

    var heatmapPoints = [];
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
            mostIncidents[0] = new Date(date).toLocaleString("pt-BR", {day: "numeric", month: "short", hour: "numeric", minute: "numeric"})
            mostIncidents[1] = numberOfIncidents;
        }

        data_number_incidents.push({
            x: moment(date),
            y: numberOfIncidents
        })

        numeroTotalIncidentes += numberOfIncidents;

        //pontos no mapa:
        for(item of item.incidents){
            var pointsRoadClosed = [];
            var pointsOthers = [];

            //iconCategoryData[item.properties.iconCategory]++;
            if(!UnicosMap.has(item.properties.id)){
                UnicosMap.set(item.properties.id, { delay: item.properties.delay, iconCategory: item.properties.iconCategory,
                    magnitudeOfDelay: item.properties.magnitudeOfDelay, length: item.properties.length});
                
                /* numero de incidentes que nao sao de ruasfechadas */
                if(item.properties.iconCategory != 8) notRoadWorks++;
                
                for(itemzinho of item.properties.events){
                    iconCategoryData[itemzinho.iconCategory]++;
                }

                /* Heat Map */
                for(itemgeo of item.geometry.coordinates){
                    if(item.properties.iconCategory == 8) pointsRoadClosed.push([itemgeo[1],itemgeo[0]]);
                    else pointsOthers.push([itemgeo[1],itemgeo[0]]);
                    heatmapPoints.push([itemgeo[1],itemgeo[0],0.09]);
                    //console.log(itemgeo);
                    //console.log(points);
                }
                const path2 = L.polyline(pointsOthers ,{color: 'blue', weight: 3}).addTo(mysecondmap);
                const path = L.polyline(pointsRoadClosed ,{color: 'red', weight: 4}).addTo(mysecondmap);
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
                        [item.incidents[0].geometry.coordinates[3][1], item.incidents[0].geometry.coordinates[3][0]]];*/
    }
    //console.log(heatmapPoints);
    var heat = L.heatLayer(heatmapPoints).addTo(myheatMapTotal);
    
    
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
                text: 'Magnitude do Atraso'
            },
        }
    };
    window.pie_chart_Mag = new Chart(ctx_Mag, config_Mag);

        

    //console.log(delayTotal);
    /* media de delay em segundos excepto em road closures */
    //console.log("Numero acidentes Unicos:" + UnicosMap.size);
    console.log("Delay medio:" + delayTotal/UnicosMap.size);
    console.log("Delay medio A:" + delayTotal/notRoadWorks);
    console.log("Total:" + UnicosMap.size);
    console.log("Total A:" + notRoadWorks);
    console.log(data);
    console.log(mostIncidents);

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

    document.getElementById('incidentesAtuais').textContent = data_inc.incidents.length;
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
