let EARTH_R_m = 6371000; // m

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



console.log(shiftCoord([47.2291184, 16.6187625], 45, 1000))

