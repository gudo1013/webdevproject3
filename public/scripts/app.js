let app;
let map;
let markers = L.layerGroup();
let crimeIcon = L.icon({
    iconUrl: '../imgs/map-pin.png',
    iconSize:     [40, 40], // size of the icon
});

let firstTable;
let thirdTable;

let neighborhood_markers = 
[
    {location: [44.942068, -93.020521], marker: null},
    {location: [44.977413, -93.025156], marker: null},
    {location: [44.931244, -93.079578], marker: null},
    {location: [44.956192, -93.060189], marker: null},
    {location: [44.978883, -93.068163], marker: null},
    {location: [44.975766, -93.113887], marker: null},
    {location: [44.959639, -93.121271], marker: null},
    {location: [44.947700, -93.128505], marker: null},
    {location: [44.930276, -93.119911], marker: null},
    {location: [44.982752, -93.147910], marker: null},
    {location: [44.963631, -93.167548], marker: null},
    {location: [44.973971, -93.197965], marker: null},
    {location: [44.949043, -93.178261], marker: null},
    {location: [44.934848, -93.176736], marker: null},
    {location: [44.913106, -93.170779], marker: null},
    {location: [44.937705, -93.136997], marker: null},
    {location: [44.949203, -93.093739], marker: null}
];

const codeMap = new Map();
codeMap.set('Homicide/Murder', [100,110,120]);
codeMap.set('Rape', [210,220]);
codeMap.set('Robbery', [300,311,312,313,314,321,322,323,324,331,333,334,341,342,343,344,351,352,353,354,361,363,364,371,372,373,374]);
codeMap.set('Aggravated Assault', [400,410,411,412,420,421,422,430,431,432,440,441,442,450,451,452,453]);
codeMap.set('Burglary', [500,510,511,513,515,516,520,521,523,525,526,530,531,533,535,536,540,541,543,545,546,550,551,553,555,556,560,561,563,565,566]);
codeMap.set('Theft', [600,603,611,612,613,614,621,622,623,630,631,632,633,640,641,642,643,651,652,653,661,662,663,671,672,673,681,682,683,691,692,693]);
codeMap.set('Motor Theft', [700,710,711,712,720,721,722]);
codeMap.set('Assault', [810,861,862,863]);
codeMap.set('Arson', [900,901,903,905,911,913,915,921,922,923,925,931,933,941,942,951,961,971,972,975,981,982]);
codeMap.set('Damages', [1400,1401,1410,1415,1416,1420,1425,1426,1430,1435,1436]);
codeMap.set('Narcotics', [1800,1810,1811,1812,1813,1814,1815,1820,1822,1823,1824,1825,1830,1835,1840,1841,1842,1843,1844,1845,1850,1855,1860,1865,1870,1880,1885]);
codeMap.set('Other', [2619,3100,9954,9959,9986]);

const neighborhoodMap = new Map();
neighborhoodMap.set('Conway/Battlecreek/Highwood', 1);
neighborhoodMap.set('Greater East Side', 2);
neighborhoodMap.set('West Side', 3);
neighborhoodMap.set('Dayton\'s Bluff', 4);
neighborhoodMap.set('Payne/Phalen', 5);
neighborhoodMap.set('North End', 6);
neighborhoodMap.set('Thomas/Dale(Frogtown)', 7);
neighborhoodMap.set('Summit/University',8);
neighborhoodMap.set('West Seventh', 9);
neighborhoodMap.set('Como',10);
neighborhoodMap.set('Hamline/Midway',11);
neighborhoodMap.set('St. Anthony',12);
neighborhoodMap.set('Union Park', 13);
neighborhoodMap.set('Macalester-Groveland', 14);
neighborhoodMap.set('Highland', 15);
neighborhoodMap.set('Summit Hill',16);
neighborhoodMap.set('Capitol River',17);

function init() {

    let crime_url = 'http://localhost:8000';

    app = new Vue({
        el: '#app',
        data: {
            map: {
                center: {
                    lat: 44.955139,
                    lng: -93.102222,
                    address: ""
                },
                zoom: 12,
                bounds: {
                    nw: {lat: 45.008206, lng: -93.217977},
                    se: {lat: 44.883658, lng: -92.993787}
                }
            }
        }
    });
    firstTable = new Vue({
        el: '#firstTable',
        data: {
            headers: ["case_number", "incident", "neighborhood_name", "block", "data", "time"],
            rows: []
        },
        methods:{
            updateData: function(crimes){
                Vue.set(this.rows, 0, crimes);
            },
            addMarker: function(crime){
                console.log('clicked');
                console.log(crime);
                updateCrimeMarkers(crime);
            }
        }
    });

    map = L.map('leafletmap').setView([app.map.center.lat, app.map.center.lng], app.map.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 11,
        maxZoom: 18
    }).addTo(map);
    map.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);
    
    let district_boundary = new L.geoJson();
    district_boundary.addTo(map);

    getJSON('data/StPaulDistrictCouncil.geojson').then((result) => {
        // St. Paul GeoJSON
        $(result.features).each(function(key, value) {
            district_boundary.addData(value);
        });
    }).catch((error) => {
        console.log('Error:', error);
    });

    let visibleNeighborhoods = [];
    //Update lat/lon on pan
    map.on('moveend', function(){
        updateCoordinates(map.getCenter().lat, map.getCenter().lng);
        visibleNeighborhoods=[];
        for(let i = 0; i < neighborhood_markers.length; i++){
            if(map.getBounds().contains(neighborhood_markers[i].location))
            {
                visibleNeighborhoods.push(i+1);
            }
        }
       updateCrimes(visibleNeighborhoods);
       
    });

    //Create the markers
    createMarkers();
    let temp;
    //Default to getting the first 1000 records
    getJSON('/incidents').then((result) => {
        updateMarkers(result);
        firstTable.updateData(result);
        
    }).catch((error) => {
        console.error('Error:' + error);
    });

}

function getJSON(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            dataType: "json",
            url: url,
            success: function(data) {
                resolve(data);
            },
            error: function(status, message) {
                reject({status: status.status, message: status.statusText});
            }
        });
    });
}

async function updateCrimes(visibleNeighborhoods){
    let hold = 'code=';
    let url = '/incidents?';
    let boxes = document.querySelectorAll('.codes');
    boxes.forEach( curr => {
        if(curr.checked){
            prevCond = true;
            hold += codeMap.get(curr.id).join(',') + ',';
        }
    });
    if(hold !== 'code='){
        hold = hold.substring(0, hold.length - 1);
        url += hold + '&';
    }

    hold = 'neighborhood=';
    boxes = document.querySelectorAll('.neigh');
    let boxChecked = false;
    let addedQuery = false;
    boxes.forEach( curr => {
        if(curr.checked){ boxChecked = true;}
    })
    boxes = document.querySelectorAll('.neigh');
    if(boxChecked){
        boxes.forEach( curr => {
            if(curr.checked){
                if(visibleNeighborhoods == undefined){
                    prevCond = true;
                    hold += neighborhoodMap.get(curr.id) + ',';
                    addedQuery = true;
                }
                else if(visibleNeighborhoods != undefined && visibleNeighborhoods.includes(neighborhoodMap.get(curr.id))){
                    prevCond = true;
                    hold += neighborhoodMap.get(curr.id) + ',';
                    addedQuery = true;
                }
            }
        });
    }
    else { //no checked boxes, only display what is visible
        boxes.forEach( curr => {
            if(visibleNeighborhoods == undefined){
                prevCond = true;
                hold += neighborhoodMap.get(curr.id) + ',';
                addedQuery = true;
            }
            else if(visibleNeighborhoods != undefined && visibleNeighborhoods.includes(neighborhoodMap.get(curr.id))){
                prevCond = true;
                hold += neighborhoodMap.get(curr.id) + ',';
                addedQuery = true;
            }
        });
    }
    if(!addedQuery){
        hold += "18,";
    }
    if(hold !== 'neighborhood='){
        hold = hold.substring(0, hold.length - 1);
        url += hold + '&';
    }

    let date = document.getElementById('start_date').value;
    if(date){
        url += 'start_date=' + date + '&';
    }
    date = document.getElementById('end_date').value;
    if(date){
        url += 'end_date=' + date + '&';
    }

    let time = document.getElementById('start_time').value;
    if(time){
        url+= 'start_time=' + time + '&';
    }
    time = document.getElementById('end_time').value;
    if(time){
        url += 'end_time=' + time + '&';
    }

    let limit = document.getElementById('limit').value;
    if(limit){
        url += 'limit=' + limit + '&';
    }

    url = url.substring(0, url.length - 1);
    console.log(url);
    let crimes = await getJSON(url);
    //console.log(result);

    console.log(crimes);
    //Vue.set(firstTable.data.rows, 0, crimes);

    firstTable.updateData(crimes)

    // updateTableRows(crimes);
    updateMarkers(crimes);
    //tableUpdate(crimes);
    //updateCrimeMarkers(crimes);
}

function locationLookupController(address, lat, lon){
    if(address != ""){
        searchAddress(address).then((result)=> {
            updateMap(result[0], result[1]);
        }).catch((error)=> {
            alert("Address does not turn up a valid search");
            console.log("Error: " + error);
        });
    }
    else{ //No address, must have lat/lon cords
        updateMap(lat, lon);
    }
}

function updateMap(lat, lon){
    map.setView([lat, lon], 17);
    console.log("map updated");
    return false;
}

function updateCoordinates(lat, lon){
    $('#latform').val(lat);
    $('#lonform').val(lon);
}

function searchAddress(address){
    return new Promise((resolve, reject) => {
    if(!isNaN(address[0])){
        let i = 1;
        while(!isNaN(address[i]) || address[i] === 'X'){    
            if(address[i] === 'X'){
                address = address.replace('X', '0');
            }
            i++;
        }
    }
    getJSON("https://nominatim.openstreetmap.org/search?q=" + address.replace(/ /g, '+') + ",Saint+Paul,MN&format=json&polygon_geojson=1&addressdetails=1").then((result)=> {
        if(result[0] != undefined){
            resolve([result[0].lat, result[0].lon]);
        }
        else{
            reject("Address Search Failed");
        }
        }).catch((error)=> {
            console.log(error);
        });
    });
}

function createMarkers(){
    let i = 0;
    for(const key of neighborhoodMap.keys()){
        let marker = L.marker([neighborhood_markers[i].location[0], neighborhood_markers[i].location[1]], {title: key});
        neighborhood_markers[i].marker = marker;
        neighborhood_markers[i].marker.bindPopup( key + " Number of Crimes: 0");
        neighborhood_markers[i].marker.addTo(map);
        i++;
    }
}

function updateMarkers(data){
    let totalCrimes = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for(let i = 0; i < data.length; i++){
        totalCrimes[data[i].neighborhood_number-1]++;
    }
    //Update markers
    let i = 0;
    for(const key of neighborhoodMap.keys()){
        neighborhood_markers[i].marker.bindPopup(key + " Number of Crimes: " + totalCrimes[i]);
        i++;
    }
    
}

function updateCrimeMarkers(data){
    markers = L.layerGroup();
    searchAddress(data.block).then((result) => {
        //{title: data[i].date + " " + data[i].time + " " + data[i].incident}      title: ("" + data[i].date + " " + data[i].time + " " + data[i].incident),
        
        let marker = L.marker([result[0], result[1]], {icon: crimeIcon});
        let deleteButton = document.createElement('button');
        let span = document.createElement('span');
        span.innerText = "" + data.date + " " + data.time + " " + data.incident + " | ";
        deleteButton.innerText = 'Delete Marker';
        deleteButton.onclick = function() {
            map.removeLayer(marker);
        }
        span.appendChild(deleteButton);
        let popup = L.popup();
        marker.bindPopup(span);
        marker.addTo(markers);
    }).catch((error)=> {
        alert("Address does not turn up a valid search");
        console.log("Error: " + error);
    });
    markers.addTo(map);
}

function codeType(code)
{
    if(codeMap.get('Homicide/Murder').includes(row.code)){
        newRow.style = 'background-color: lightgreen;';
    }
    else if(codeMap.get('Rape').includes(row.code)){
        newRow.style = 'background-color: cyan;';
    }
    else if(codeMap.get('Robbery').includes(row.code)){
        newRow.style = 'background-color: purple;';
    }
    else if(codeMap.get('Aggravated Assault').includes(row.code)){
        newRow.style = 'background-color: darkgray;';
    }
    else if(codeMap.get('Burglary').includes(row.code)){
        newRow.style = 'background-color: yellow;';
    }
    else if(codeMap.get('Theft').includes(row.code)){
        newRow.style = 'background-color: orange;';
    }
    else if(codeMap.get('Motor Theft').includes(row.code)){
        newRow.style = 'background-color: lightblue;';
    }
    else if(codeMap.get('Assault').includes(row.code)){
        newRow.style = 'background-color: magenta;';
    }
    else if(codeMap.get('Arson').includes(row.code)){
        newRow.style = 'background-color: red;';
    }
    else if(codeMap.get('Damages').includes(row.code)){
        newRow.style = 'background-color: green;';
    }
    else if(codeMap.get('Narcotics').includes(row.code)){
        newRow.style = 'background-color: coral;'; 
    }
    else if(codeMap.get('Other').includes(row.code)){
        newRow.style = 'background-color: greenyellow;'; 
    }
}

function removeTableRows(){
    let parent = document.getElementById('body');
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
}

function updateTableRows(data){
    removeTableRows();

    let tbody = document.getElementById('body');
    data.forEach(row =>{
        let newRow = tbody.insertRow();
        let newCell = newRow.insertCell();
        newCell.textContent = row.case_number;
        newRow.insertCell().textContent = row.incident_type;
        newRow.insertCell().textContent = row.neighborhood_name;
        newRow.insertCell().textContent = row.block;
        newRow.insertCell().textContent = row.date;
        newRow.insertCell().textContent = row.time;
        
        if(codeMap.get('Homicide/Murder').includes(row.code)){
            newRow.style = 'background-color: lightgreen;';
        }
        else if(codeMap.get('Rape').includes(row.code)){
            newRow.style = 'background-color: cyan;';
        }
        else if(codeMap.get('Robbery').includes(row.code)){
            newRow.style = 'background-color: purple;';
        }
        else if(codeMap.get('Aggravated Assault').includes(row.code)){
            newRow.style = 'background-color: darkgray;';
        }
        else if(codeMap.get('Burglary').includes(row.code)){
            newRow.style = 'background-color: yellow;';
        }
        else if(codeMap.get('Theft').includes(row.code)){
            newRow.style = 'background-color: orange;';
        }
        else if(codeMap.get('Motor Theft').includes(row.code)){
            newRow.style = 'background-color: lightblue;';
        }
        else if(codeMap.get('Assault').includes(row.code)){
            newRow.style = 'background-color: magenta;';
        }
        else if(codeMap.get('Arson').includes(row.code)){
            newRow.style = 'background-color: red;';
        }
        else if(codeMap.get('Damages').includes(row.code)){
            newRow.style = 'background-color: green;';
        }
        else if(codeMap.get('Narcotics').includes(row.code)){
            newRow.style = 'background-color: coral;'; 
        }
        else if(codeMap.get('Other').includes(row.code)){
            newRow.style = 'background-color: greenyellow;'; 
        }
    });
}
