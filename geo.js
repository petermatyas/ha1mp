var myPosLat = 0
var myPosLon = 0
var myPosAcc = 0

let hamRepeaters = [
  {'name':'Szombathely', 'lat':47.2376, 'lon':16.5857},
  {'name':'Győr (Nyúl-hegy)', 'lat':47.58179, 'lon':17.6586},
  {'name':'Zalaegerszeg ', 'lat':46.81357, 'lon':16.81226}
]



function getLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(showPosition)
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
}

function showPosition(position) {
    console.log(position)
    myPosLat = position.coords.latitude;
    myPosLon = position.coords.longitude;
    myPosAcc = position.coords.accuracy;

    let x = document.getElementById("mypos");
    x.innerHTML = "Latitude: " + myPosLat +"<br>Longitude: " + myPosLon + "<br>Pontosság: " + myPosAcc;

    var locator = LatLng2Loc(myPosLat, myPosLon, 6)
    console.log('locator', locator)
    document.getElementById("mylocator").innerHTML = locator;



  }

function LatLng2Loc(y, x, num) {
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

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI/180; // φ, λ in radians
  const phi2 = lat2 * Math.PI/180;
  const dphi = (lat2-lat1) * Math.PI/180;
  const d_lambda = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dphi/2) * Math.sin(dphi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(d_lambda/2) * Math.sin(d_lambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c / 1000; // in km
  return d
}

function getDirection(lat1, lon1, lat2, lon2) {
  const y = Math.sin(lon2-lon1) * Math.cos(lat2);
  const x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
  const θ = Math.atan2(y, x);
  const brng = (θ*180/Math.PI + 360) % 360; // in degrees
  return brng
}

function selectGateway(location) {
  lat = parseFloat(location.split(",")[0])
  lon = parseFloat(location.split(",")[1])

  distance = getDistance(myPosLat, myPosLon, lat, lon).toFixed(2);
  direction = getDirection(myPosLat, myPosLon, lat, lon).toFixed(2);
  document.getElementById("dist_dir").innerHTML = "távolság:" + distance + " km<br>irány:" + direction + "°";
}
  

function changeTarget(data) {
  console.log('data', data)  
}