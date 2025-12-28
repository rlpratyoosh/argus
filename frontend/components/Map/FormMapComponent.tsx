'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useMemo, useEffect } from 'react';

const DefaultIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  pos?: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
}

function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMapEvents({});
  useEffect(() => {
    // When pos changes, fly to it
    map.flyTo([center.lat, center.lng], 16, { duration: 1.5 });
  }, [center, map]);
  return null;
}

function DraggableMarker({ pos, onDrag }: { pos: { lat: number, lng: number }, onDrag: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState(pos);
  
  useEffect(() => {
    setPosition(pos);
  }, [pos]);

  const eventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lng });
          onDrag(lat, lng);
        }
      },
    }),
    [onDrag],
  );

  return (
    <Marker 
      draggable={true} 
      eventHandlers={eventHandlers} 
      position={position} 
      autoPan={true}
    />
  );
}

export default function FormMapComponent({ pos, onPositionChange }: MapProps) {
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };
  const center = pos || defaultCenter;

  return (
    <div className="h-full w-full relative z-0 bg-black">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={pos ? 16 : 5}
        zoomControl={false} // We hid zoom controls for cleaner UI
        scrollWheelZoom={true}
        className="h-full w-full outline-none"
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {pos && (
          <>
            <MapUpdater center={pos} />
            <DraggableMarker pos={pos} onDrag={onPositionChange} />
          </>
        )}
      </MapContainer>
    </div>
  );
}