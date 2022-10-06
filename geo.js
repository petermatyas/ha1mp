let EARTH_R_m = 6371000; // m


var myPos = {'coord':[]};
var repeaterPos = {'coord':[]};
var targetPos = {'coord':[]};


let hamRepeaters = [
  {'name':'none', 'lat':null, 'lon':null},
  {'name':'Szombathely', 'lat':47.2376, 'lon':16.5857},
  {'name':'Győr (Nyúl-hegy)', 'lat':47.58179, 'lon':17.6586},
  {'name':'Zalaegerszeg ', 'lat':46.81357, 'lon':16.81226}
]


var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




function getLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(showPosition)
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
}

function showPosition(position) {
    //console.log(position)
    myPos.coord[0] = position.coords.latitude;
    myPos.coord[1] = position.coords.longitude;
    myPos.acc = position.coords.accuracy;
    refreshScreenData();
  }



window.onload = function() {
    let x = document.getElementById("mypos");
    console.log('--', x)
    getLocation()

    for (var i=0; i<hamRepeaters.length; i++) {
        var repeater = document.getElementById("repeaters");
        var option = document.createElement("option");
        option.value = hamRepeaters[i].lat + ',' + hamRepeaters[i].lon
        option.text = hamRepeaters[i].name;
        repeater.add(option); 
    }
};



function selectGateway(location) {
  repeaterPos.coord[0] = parseFloat(location.split(",")[0])
  repeaterPos.coord[1] = parseFloat(location.split(",")[1])

  refreshScreenData()
  }
  

var input = document.getElementById("target");
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {

    if (isValidLocator(input.value)) {
      targetPos.coord = locatorToLatLon(input.value).coord
    } else {
      fetch(`https://nominatim.openstreetmap.org/search/`+input.value+`?format=json&limit=1`)
        .then((response) => response.json())
        .then((data) => {
          targetPos.coord[0] = parseFloat(data[0].lat);
          targetPos.coord[1] = parseFloat(data[0].lon);
        });
    }
    refreshScreenData()
  }
}); 

var repeaters = document.getElementById("repeaters");
repeaters.addEventListener('change', function(event) {
    repeaterPos.coord[0] = parseFloat(event.target.value.split(',')[0])
    repeaterPos.coord[1] = parseFloat(event.target.value.split(',')[1])

    if (repeaterPos.marker != null) {
      console.log('repeater marker remove')
      map.removeLayer(repeaterPos.marker)
    }

    if (!isNaN(repeaterPos.coord[0]) || !isNaN(repeaterPos.coord[1])) {
      console.log('--> not null', repeaterPos.coord)
      repeaterPos.marker = L.marker(repeaterPos.coord, {draggable:true}).addTo(map);
    }
    refreshScreenData()
})


//function getDistance(lat1, lon1, lat2, lon2) {
function getDistance(coord1, coord2) {
  // https://www.movable-type.co.uk/scripts/latlong.html
  /*const lat1 = degToRad(coord1[0]);
  const lon1 = degToRad(coord1[1]);
  const lat2 = degToRad(coord2[0]);
  const lon2 = degToRad(coord2[1]);*/
  const lat1 = coord1[0];
  const lon1 = coord1[1];
  const lat2 = coord2[0];
  const lon2 = coord2[1];

  //const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI/180; // φ, λ in radians
  const phi2 = lat2 * Math.PI/180;
  const dphi = (lat2-lat1) * Math.PI/180;
  const d_lambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dphi/2) * Math.sin(dphi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(d_lambda/2) * Math.sin(d_lambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = EARTH_R_m * c; // in km
  return d
}

//function getDirection(lat1, lon1, lat2, lon2) {
function getDirection(coord1, coord2) {
  // https://www.movable-type.co.uk/scripts/latlong.html

  const lat1 = degToRad(coord1[0]);
  const lon1 = degToRad(coord1[1]);
  const lat2 = degToRad(coord2[0]);
  const lon2 = degToRad(coord2[1]);

  const y = Math.sin(lon2-lon1) * Math.cos(lat2);
  const x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
  const res = Math.atan2(y, x);
  return radToDeg(res);
  //const brng = (θ*180/Math.PI + 360) % 360; // in degrees
  //return brng
}

function isLetter(data) {
  var res = true;
  for (var i=0; i<data.length; i++) {
      if (!((data[i] >= "a" && data[i] <= "x") || (data[i] >= "A" && data[i] <= "X"))) {
          res = false
      } 
  }
  return res
}

function isNumber(data) {
  return (!isNaN(parseInt(data))) 
}

function isValidLocator(data) {
  var res = true;
  if (data.length%2==0 && data.length >= 4 && data.length <= 10) {
      for (var i=0; i<data.length/2; i++) {
          if (i%2==0) {
              //console.log('letter? ',data.slice(i*2, (i+1)*2), isLetter(data.slice(i*2, (i+1)*2)))
              if (!isLetter(data.slice(i*2, (i+1)*2))) {
                  res = false;
              }
          } else {
              //console.log('number? ',data.slice(i*2, (i+1)*2), isNumber(data.slice(i*2, (i+1)*2)))
              if (!isNumber(data.slice(i*2, (i+1)*2))) {
                  res = false;
              }
          }
      }
  } else {
      res = false;
  }
  return res
}

function locatorToLatLon(locatorStr) {
  var lon = 0
  var lat = 0
  var lon2 = 0
  var lat2 = 0

  locatorStr = locatorStr.toLowerCase()

  lon = (locatorStr[0].charCodeAt(0)-97) * 20;
  lat = (locatorStr[1].charCodeAt(0)-97) * 10;
  //console.log('1', lon-180, lat-90)

  if (locatorStr.length > 2) {  
      lon = lon + Number.parseInt(locatorStr[2]) * 2;
      lat = lat + Number.parseInt(locatorStr[3]);
      lon2 = lon + 2;
      lat2 = lat + 1;
      //console.log('2', lon-180, lat-90)
  }
  if (locatorStr.length > 4) {    
      lon = lon + (locatorStr[4].charCodeAt(0)-97) / 12;
      lat = lat + (locatorStr[5].charCodeAt(0)-97) / 24;
      lon2 = lon + 1/12;
      lat2 = lat + 1/24;
      //console.log('3', lon-180, lat-90)
  }
  if (locatorStr.length > 6) {    
      lon = lon + Number.parseInt(locatorStr[6]) / 120;
      lat = lat + Number.parseInt(locatorStr[7]) / 240;
      lon2 = lon + 1/120;
      lat2 = lat + 1/240;
      //console.log('4', lon-180, lat-90)
  }
  if (locatorStr.length > 8) {    
      lon = lon + (locatorStr[8].charCodeAt(0)-97) / 2880;
      lat = lat + (locatorStr[9].charCodeAt(0)-97) / 5760;
      lon2 = lon + 1/2880;
      lat2 = lat + 1/5760;
      //console.log('5', lon-180, lat-90)
  }

  lat = lat - 90;
  lon = lon - 180;
  lat2 = lat2 - 90;
  lon2 = lon2 - 180;
  return {'coord':[lat+(lat2-lat)/2, lon+(lon2-lon)/2], 'square':[[lat, lon], [lat2, lon2]]}
}

function LatLonToLocator(coord, num) {
  x = coord[1]
  y = coord[0]
  if (x<-180) {x=x+360;}
  if (x>180) {x=x-360;}
  var yqth, yi, yk, ydiv, yres, ylp, y;
  var ycalc = new Array(0,0,0);
  var yn    = new Array(0,0,0,0,0,0,0);

  var ydiv_arr=new Array(10, 1, 1/24, 1/240, 1/240/24);
  ycalc[0] = (x + 180)/2;
  ycalc[1] =  y +  90;

  for (yi = 0; yi < 2; yi++) {
    for (yk = 0; yk < 5; yk++) {
        ydiv = ydiv_arr[yk];
        yres = ycalc[yi] / ydiv;
        ycalc[yi] = yres;
        if (ycalc[yi] > 0) ylp = Math.floor(yres); else ylp = Math.ceil(yres);
        ycalc[yi] = (ycalc[yi] - ylp) * ydiv;
        yn[2*yk + yi] = ylp;
    }
  }

  var qthloc="";
  if (num >= 2) qthloc+=String.fromCharCode(yn[0] + 0x41) + String.fromCharCode(yn[1] + 0x41);
  if (num >= 4) qthloc+=String.fromCharCode(yn[2] + 0x30) + String.fromCharCode(yn[3] + 0x30);
  if (num >= 6) qthloc+=String.fromCharCode(yn[4] + 0x41) + String.fromCharCode(yn[5] + 0x41);
  if (num >= 8) qthloc+=' ' + String.fromCharCode(yn[6] + 0x30) + String.fromCharCode(yn[7] + 0x30);
  if (num >= 10) qthloc+=String.fromCharCode(yn[8] + 0x61) + String.fromCharCode(yn[9] + 0x61);
  
  return qthloc;
  
}


function degToRad(deg) {
  return deg * Math.PI/180
}

function radToDeg(rad) {
  return rad * (180/Math.PI)
}

function shiftCoord(point, bearing, distance) {
  // http://www.movable-type.co.uk/scripts/latlong.html
  var lat = degToRad(point[0])
  var lon = degToRad(point[1])
  bearing = degToRad(bearing)
  const lat2 = Math.asin(Math.sin(lat)*Math.cos(distance/EARTH_R_m) + 
                         Math.cos(lat)*Math.sin(distance/EARTH_R_m)*Math.cos(bearing))
  const dlon2 = Math.atan2(Math.sin(bearing)*Math.sin(distance/EARTH_R_m)*Math.cos(lat),
                           Math.cos(distance/EARTH_R_m)-Math.sin(lat)*Math.sin(lat2))
  const lon2 = lon + dlon2

  return [radToDeg(lat2), radToDeg(lon2)]
}

function getCoordsLine(startCoord, bearing, distance, nr) {
  var currentCoord = startCoord;
  var resArr = [];
  resArr.push(currentCoord)
  for (var i=0; i<nr; i++) {
    var res = shiftCoord(currentCoord, bearing, distance);
    resArr.push(res);
    currentCoord = res;
  }
  return resArr;
}

function getPointsBetweenCoords(startCoord, endCoord) {
  const nrOfPoints = 100;
  var distance = getDistance(startCoord, endCoord);
  var bearing = getDirection(startCoord, endCoord);
  console.log('startCoord: ', startCoord, 'endCoord: ', endCoord)
  console.log('distance:', distance, 'bearing: ', bearing)
  return getCoordsLine(startCoord, bearing, distance/nrOfPoints, nrOfPoints)
}

function getHeights(coords) {
  var apiCoords = ''
  for (var i=0; i< coords.length; i++) {
    apiCoords += coords[i][0] + ',' + coords[i][1] + '|'
  }
  //console.log('-->', apiCoords.slice(0, -1))

  fetch(`https://api.open-elevation.com/api/v1/lookup?locations=`+apiCoords.slice(0, -1))
        .then((response) => response.json())
        .then((data) => {
          console.log('response:', data.results)
          var result = [];
          var sumDistance = 0;
          for (var i=1; i<data.results.length; i++) {
            const currentPos = [data.results[i].latitude, data.results[i].longitude];
            const prevPos = [data.results[i-1].latitude, data.results[i-1].longitude];

            const dist = getDistance(prevPos, currentPos);
            sumDistance += dist;
            result.push([sumDistance, data.results[i].elevation]);
            //console.log('-', data.results[i].elevation)
          }

          google.charts.load('current',{packages:['corechart']});
          google.charts.setOnLoadCallback(drawChart);

        });
}

function drawChart() {
  // Set Data
  var rawData = ['Magasság', 'Távolság'];
  rawData.push([50,7],[60,8],[70,8],[80,9],[90,9],[100,9],[110,10],[120,11],[130,14],[140,14],[150,15])
  var data = google.visualization.arrayToDataTable([rawData]);
  // Set Options
  var options = {
    title: 'Szintmetszet',
    hAxis: {title: 'Távolság [km]'},
    vAxis: {title: 'Magasság [m]'},
    legend: 'none'
  };
  // Draw Chart
  var chart = new google.visualization.LineChart(document.getElementById('elevationGraph'));
  chart.draw(data, options);
  }

function refreshScreenData() {
  if (!isNaN(myPos.coord[0])) {
    let mypos = document.getElementById("mypos");
    mypos.innerHTML = "coord: " + myPos.coord + "<br>accuracy" + myPos.acc;

    var locator = LatLonToLocator(myPos.coord, 6)
    console.log('locator', locator)
    document.getElementById("mylocator").innerHTML = locator;

    var latLon = L.latLng(myPos.coord[0], myPos.coord[1]);
    map.setView(latLon, 11, { animation: true });   
    
    myPos.marker = L.marker(myPos.coord, {draggable:true}).addTo(map);
  }
  
  if (!isNaN(targetPos.coord[0])) {
    if (targetPos.marker != null) {
      map.removeLayer(targetPos.marker)
    }
    targetPos.marker = L.marker(targetPos.coord, {draggable:true}).addTo(map);

    document.getElementById('targetData')
  }


  if (!isNaN(myPos.coord[0]) && !isNaN(repeaterPos[0])) {
    var distance = getDistance(myPos.coord, repeaterPos.coord).toFixed(2);
    var direction = getDirection(myPos.coord, repeaterPos.coord).toFixed(2);
    document.getElementById("dist_dir").innerHTML = "távolság:" + distance + " km<br>irány:" + direction + "°";
  }

  if (!isNaN(myPos.coord[0]) && !isNaN(targetPos.coord[0])) {
    var coords = getPointsBetweenCoords(myPos.coord, targetPos.coord);
    console.log('points -->', coords)
    
    for (var i=0; i<coords.length; i++) {
      L.marker(coords[i]).addTo(map);
    }
    getHeights(coords);
  }

} 