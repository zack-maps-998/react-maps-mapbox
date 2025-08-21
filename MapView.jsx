import Map,{Source,Layer} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMemo,useEffect,useRef } from "react";
import mapboxgl from "mapbox-gl";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({events}) {

    const mapRef=useRef(null);
    const geoJson=useMemo(() => ({
   
        type: "FeatureCollection",
        features: events.map(e => ({
            type: "Feature",
            properties: { id: e.id, title: e.title, description: e.description, link: e.link },
            geometry:{ type: "Point", coordinates: [e.lon, e.lat] }          
    })), 
}), [events]);

useEffect(() => {
    const map = mapRef.current?.getMap?.();
    const feats = geoJson.features;
    if (!map || feats.length === 0) return;

    // initialize bounds with the first point, then extend
    const first = feats[0].geometry.coordinates;
    const bounds = new mapboxgl.LngLatBounds(first, first);
    for (let i = 1; i < feats.length; i++) {
      bounds.extend(feats[i].geometry.coordinates);
    }
    map.fitBounds(bounds, { padding: 60, duration: 600, maxZoom: 8 });
  }, [geoJson]);
  
  return (
    <Map
    //   initialViewState={{ longitude: -122.4194, latitude: 37.7749, zoom: 9 }}
      ref={mapRef}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={TOKEN}
      style={{ width: "100%", height: "100vh" }}
    > {geoJson.features.length > 0 && (
        <Source id="point-src" type="geojson" data={geoJson}>
          <Layer
            id="point-layer"
            type="circle"
            paint={{
              "circle-radius": 6,
              "circle-color": "#3b82f6",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      )}
     </Map>
  );
}
