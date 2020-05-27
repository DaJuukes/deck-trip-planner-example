
data = [
    {
        waypoints: [
        ]
    }
]

let filler = new deck.TripsLayer({
    id: 'trips-layer',
    data,
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
  mapboxApiAccessToken: 'pk.eyJ1IjoiZGFqdXVrZXMiLCJhIjoiY2thcGttNWVyMDczMTJ4bzNyaXB1ampmcCJ9.Uw5wlbUCrKQ0YGHsEiMV8g',
  mapStyle: 'mapbox://styles/mapbox/light-v9',
  container: 'container',
  initialViewState: {
    longitude: -122.45,
    latitude: 37.8,
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
    opacity: 0.8,
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
  console.log(newLayer)
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
