import React , {useState} from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import './MyMap.css'

const MyMap = (props) => {
  const [markerPos,setMarkerPos]=useState(null);
  const position = [props.coordinates.lat, props.coordinates.lng]; 

  return (
    <Map center={position} zoom={16} style={{ height: '400px', width: '100%' }} onClick={event=>setMarkerPos([event.latlng.lat,event.latlng.lng])}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {markerPos &&(<Marker position={markerPos}>
        <Popup>
             Clicked location <br />
             {markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}
        </Popup>
      </Marker>)}
      <Marker position={position}>
        <Popup>Free map marker </Popup>
      </Marker>
    </Map>
  );
};

export default MyMap;