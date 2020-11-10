import React from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { formatRelative } from "date-fns";

import "@reach/combobox/styles.css"
import mapStyles from './mapStyles'



const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center = {
  lat: 40.844784,
  lng: -73.864830
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
}


export default function App() {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [markers, setMarkers] = React.useState([]);

  if (loadError) return "Error loading maps";
  if(!isLoaded) return "Loading Maps";

  return (
    <div>
      <h1>Jz's Maps 🗺️</h1>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
        options={options}
        
        onClick={(event) => {
          setMarkers((current) => [
            ...current,
            {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
              time: new Date(),
            },
          ]);
          }}
        >
          {markers.map((marker) => (
            <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng}} />
          ))}

        </GoogleMap>
    </div>
  );
}