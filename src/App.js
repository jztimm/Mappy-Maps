import React from 'react';

// Imports the map
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

// Format Time
import { formatRelative } from "date-fns";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css"

// Custome Map Style
import mapStyles from './mapStyles'



const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

// Keep the map from rerendering if the map is updated
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

  // Setup Google Script
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  // State to keep track of the Markers & what was currently Selected
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  // Created a callback function so a new function isn't created multiple times
  const onMapClick = React.useCallback((event) => {
    setMarkers((current) => [
      ...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      },
    ]);
    }, [])

    // Creates the map
    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
      mapRef.current = map;
    }, [])

    // Pans to a specified point on the map
    const panTo = React.useCallback(({lat, lng}) => {
      mapRef.current.panTo({lat, lng});
      mapRef.current.setZoom(14);
    }, []);

  if (loadError) return "Error loading maps";
  if(!isLoaded) return "Loading Maps";

  return (
    <div>
      <h1>Jz's Maps 🗺️</h1>

      <Search panTo={panTo}/>
      <Locate panTo={panTo}/>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
        options={options}
        
        onClick={onMapClick}
        onLoad={onMapLoad}
        >
          {markers.map((marker) => (
            <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng}}
            // icon={{
            //   url: '/'
            //   scaledSize: new window.google.maps.Size(30,30),
            //   origin: new window.google.maps.Point(0,0),
            //   anchor: new window.google.maps.Point(15,15),
            // }}
            onClick={() => {
              setSelected(marker);
            }}
            />
          ))}

          {selected ? (
            <InfoWindow position={{lat: selected.lat, lng: selected.lng}}
              onCloseClick={() => {
                setSelected(null)
              }}
            >
            <div>
              <h2>Cocatile Spotted</h2>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>) : null}

        </GoogleMap>
    </div>
  );
}

function Locate({panTo}) {
  return (
    <button className="locate" onClick={() => {
      navigator.geolocation.getCurrentPosition((position) => {
        panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }, () => null);
    }}>
      <img src="compass.svg" alt="compass - locate me"/>
    </button>
  );
}

function Search({panTo}) {
  const {ready, value,
    suggestions: {status, data},
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({
      requestOptions: {
        location: { lat: () => 40.844784, lng: () => -73.864830 },
        radius: 200 * 1000,
      },
    });

  return (
    <div className="search">
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);                  // update state and place w.e was chosen in there
          clearSuggestions()                         // clear suggestions in Search

          try {
            const results = await getGeocode({address});      // call getGeocode
            const { lat, lng } = await getLatLng(results[0]); // get first result
            panTo({lat, lng});
          } catch (error) {
            console.log("error!")
          }
          
          // console.log(address)
        }}>
          <ComboboxInput value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            disabled={!ready}
            placeholder="Enter an Address"
          />
          <ComboboxPopover>
            <ComboboxList>
            {status === "OK" && data.map(({id, description}) => (
              <ComboboxOption key={id} value={description} />
            ))}
            </ComboboxList>
          </ComboboxPopover>
      </Combobox>
    </div>
  )
}



