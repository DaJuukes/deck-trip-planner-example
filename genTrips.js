const fs = require('fs')
const axios = require('axios');
const token  = "pk.eyJ1IjoiZGFqdXVrZXMiLCJhIjoiY2thcGttNWVyMDczMTJ4bzNyaXB1ampmcCJ9.Uw5wlbUCrKQ0YGHsEiMV8g"
var polyline = require('@mapbox/polyline');
const LOWER_BOUND = [-121.992743, 37.265310]
const UPPER_BOUND = [-121.903954, 37.398528]
let finalData = []

async function roadSnap(){ 
    return new Promise((resolve, reject) => {



    let lng_1 = (Math.random() * (UPPER_BOUND[0] - LOWER_BOUND[0])) + LOWER_BOUND[0]
    let lat_1 = (Math.random() * (UPPER_BOUND[1] - LOWER_BOUND[1])) + LOWER_BOUND[1]
    let lng_2 = (Math.random() * (UPPER_BOUND[0] - LOWER_BOUND[0])) + LOWER_BOUND[0]
    let lat_2 = (Math.random() * (UPPER_BOUND[1] - LOWER_BOUND[1])) + LOWER_BOUND[1]


    let coordString = lng_1 + "," + lat_1 + ";" + lng_2 + "," + lat_2;
    let radiusString="50;50"


    let query = "https://api.mapbox.com/matching/v5/mapbox/driving/"+ coordString + "?radiuses=" + radiusString + "&steps=true&access_token=" + token


    let newCoords = [];



    axios.get(query).then(resp => {

        let data = resp.data

           if (data.message == 'No matching found' || !data.matchings[0]) {
               console.log('no match')
               resolve({});
           } else {

           let encoded = data.matchings[0].geometry;
           newCoords = polyline.decode(encoded)
           
          let waypoints = []
          let timestamps = [];

           for (let i = 0; i < newCoords.length; i++) {
             let x = newCoords[i]
              waypoints.push({ coordinates: [x[1], x[0]] })
              
              timestamps.push(i * (200/newCoords.length)) // todo normalize time taken based on distance
           }
          
        console.log('match found')
         resolve({ waypoints, timestamps })
        }
    });

}); 
}
let p = []
for (let i = 0; i < 15; i++) {
    p.push(roadSnap())
}
Promise.all(p).then((data) => {
    data = data.filter(d => (d!=undefined))
    fs.writeFileSync('./tripData.json', JSON.stringify(data))
}).catch(console.error)