mapboxgl.accessToken = 'pk.eyJ1IjoiZGFqdXVrZXMiLCJhIjoiY2thcGttNWVyMDczMTJ4bzNyaXB1ampmcCJ9.Uw5wlbUCrKQ0YGHsEiMV8g';
const token  = "pk.eyJ1IjoiZGFqdXVrZXMiLCJhIjoiY2thcGttNWVyMDczMTJ4bzNyaXB1ampmcCJ9.Uw5wlbUCrKQ0YGHsEiMV8g" // NOTE: This is okay because its a free public key. No harm in leaving it open

let filler = new deck.TripsLayer({
    id: 'trips-layer',
    data: [{waypoints:[]}],
    getPath: d => d.waypoints.map(p => p.coordinates),
    // deduct start timestamp from each data point to avoid overflow
    getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 5,
    rounded: true,
    trailLength: 200,
    currentTime: 100
  });


  let newDeck = new deck.DeckGL({
  mapboxApiAccessToken: token,
  mapStyle: 'mapbox://styles/dajuukes/ckapv37b982vd1jnsrkvgf5uf',
  container: 'container',
  initialViewState: {
    longitude: -121.8863,
    latitude: 37.3382,
    zoom: 12
  },
  controller: true,
  layers: [
    filler
  ],
  onClick: (info) => {
      updateMap(info.coordinate[0], info.coordinate[1])
  }
   })


   function updateMap(long, lat) {
    let count = newDeck.props.layers.length
    const layer = new deck.ScatterplotLayer({
    id: 'scatterplot-layer' + count,
    data: [{coordinates: [long, lat]}],
    pickable: true,
    opacity: 1.2,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 10,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.exits),
    getFillColor: d => [255, 140, 0],
    getLineColor: d => [0, 0, 0]
  });
    arr = newDeck.props.layers.concat([layer]);

    updateTrips(arr)
   }

   function updateTrips(layers) {
    let waypoints = layers.filter(p => (p.id != 'trips-layer')).map(p => { return {coordinates: p.props.data[0]["coordinates"]}})

    let newData = [{waypoints}]

    newLayer = new deck.TripsLayer({
    id: 'trips-layer',
    data: newData,
    getPath: d => d.waypoints.map(p => p.coordinates),
    // deduct start timestamp from each data point to avoid overflow
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 5,
    rounded: true,
    trailLength: 200,
    currentTime: 100
  });

  //find and replace old triplayer
  let oldLayers = arr;
  let newLayers = []
  for (let i = 0; i < oldLayers.length; i++) {
      let x = oldLayers[i]
      
      if (x.id != 'trips-layer') {
        newLayers.push(x)
      } else {
        newLayers.push(newLayer)
      }
  }
  newDeck.setProps({layers: newLayers})
   }

function roadSnap(){ 
    
    let coordinates = newDeck.props.layers.filter(p => (p.id != 'trips-layer')).map(p => { return p.props.data[0]})

    if (coordinates.length  < 2) return;
      let coordString = ""
      let radiusString=""

      for (let i  = 0; i < coordinates.length; i++) {
          let x = coordinates[i].coordinates
          if (i != coordinates.length - 1){
           coordString += x[0] + "," + x[1] + ";"
           radiusString += "50;"
         }
          else {
              coordString += x[0] + "," + x[1]
              radiusString += "25"
          }
          
      }

      let query = "https://api.mapbox.com/matching/v5/mapbox/driving/"+ coordString + "?radiuses=" + radiusString + "&steps=true&access_token=" + token

      const http = new XMLHttpRequest();

      let newCoords = [];

      http.open("GET", query);
      http.send();

      http.onreadystatechange = (e) => {
          if (http.readyState == 4 && http.status == 200) {

             
             let resp = JSON.parse(http.responseText)
             if (resp.message == 'No matching found') {
                 alert("Route too far offroad - try splitting it up into smaller legs");
                 return;
             }
             else if (!resp.matchings[0]) {
                alert("Unspecified error - check to make sure the terrain has roads nearby");
                return;
             }

             let encoded = resp.matchings[0].geometry;
             newCoords = L.Polyline.fromEncoded(encoded).getLatLngs();

            let waypoints = []

             for (let x of newCoords) {
                waypoints.push({ coordinates: [x.lng, x.lat] })
             }

             let trip = new deck.TripsLayer({
                id: 'trips-layer',
                data: [{waypoints}],
                getPath: d => d.waypoints.map(p => p.coordinates),
                // deduct start timestamp from each data point to avoid overflow
                //getTimestamps: d => d.waypoints.map(p => p.timestamp - 1554772579000),
                getColor: [16, 195, 16],
                opacity: 2,
                widthMinPixels: 10,
                rounded: true,
                trailLength: 200,
                currentTime: 100
              });

              let startPoint = new deck.ScatterplotLayer({
                id: 'scatterplot-layer-start',
                data: [{coordinates: [newCoords[0].lng, newCoords[0].lat]}],
                pickable: true,
                opacity: 2,
                stroked: true,
                filled: true,
                radiusScale: 8,
                radiusMinPixels: 5,
                radiusMaxPixels: 25,
                lineWidthMinPixels: 1,
                getPosition: d => d.coordinates,
                getRadius: d => Math.sqrt(d.exits),
                getFillColor: d => [0, 0, 0],
                getLineColor: d => [0, 0, 0]
              });

              let endPoint = new deck.ScatterplotLayer({
                id: 'scatterplot-layer-end',
                data: [{coordinates: [newCoords[newCoords.length -1].lng, newCoords[newCoords.length -1].lat]}],
                pickable: true,
                opacity: 2,
                stroked: true,
                filled: true,
                radiusScale: 8,
                radiusMinPixels: 5,
                radiusMaxPixels: 25,
                lineWidthMinPixels: 1,
                getPosition: d => d.coordinates,
                getRadius: d => Math.sqrt(d.exits),
                getFillColor: d => [0, 0, 0],
                getLineColor: d => [0, 0, 0]
              });
 
              showDirections(resp.matchings[0])
              newDeck.setProps({layers: [startPoint, endPoint, trip]})
          } 
      }

    
  }

  function showDirections(data) {
    let directions = document.getElementById('directions');
    let legs = data.legs
    let tripDirections = []

    for (var i = 0; i < legs.length; i++) {
        var steps = legs[i].steps;
        for (var j = 0; j < steps.length; j++) {
          tripDirections.push('<br><li>' + steps[j].maneuver.instruction) + '</li>';
        }
      }
      directions.innerHTML = '<br><h2>Trip duration: ' + Math.floor(data.duration / 60) + ' min.</h2>' + tripDirections;
  }

  function clearMap() {
    newDeck.setProps({layers: [new deck.TripsLayer({
        id: 'trips-layer',
        data: [{waypoints:[]}],
        getPath: d => d.waypoints.map(p => p.coordinates),
        // deduct start timestamp from each data point to avoid overflow
        getColor: [253, 128, 93],
        opacity: 0.8,
        widthMinPixels: 5,
        rounded: true,
        trailLength: 200,
        currentTime: 100
      })]})
      document.getElementById('directions').innerHTML = ""
  }

