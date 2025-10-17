import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapComponentProps {
  center: [number, number]
  zoom?: number
  onLocationSelect?: (lat: number, lng: number) => void
  selectedLocation?: [number, number] | null
  height?: string
  className?: string
}

// Componente para manejar clics en el mapa y actualizar la vista
function MapClickHandler({ onLocationSelect, center }: { onLocationSelect?: (lat: number, lng: number) => void, center: [number, number] }) {
  const map = useMap()
  
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })

  // Actualizar la vista cuando cambie el centro
  useEffect(() => {
    if (map) {
      map.setView(center, map.getZoom())
    }
  }, [map, center])

  return null
}

export const MapComponent = ({ 
  center, 
  zoom = 13, 
  onLocationSelect, 
  selectedLocation,
  height = '400px',
  className = ''
}: MapComponentProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center)
  const [key, setKey] = useState(0) // Key para forzar re-render

  useEffect(() => {
    setMapCenter(center)
    setKey(prev => prev + 1) // Forzar re-render cuando cambie el centro
  }, [center])

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <MapContainer
        key={key}
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcador de ubicación seleccionada */}
        {selectedLocation && (
          <Marker position={selectedLocation}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Ubicación seleccionada</p>
                <p className="text-sm text-gray-600">
                  Lat: {selectedLocation[0].toFixed(6)}
                </p>
                <p className="text-sm text-gray-600">
                  Lng: {selectedLocation[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Manejador de clics */}
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} center={mapCenter} />}
      </MapContainer>
    </div>
  )
}

// Componente para mostrar direcciones existentes
interface DirectionsMapProps {
  directions: Array<{
    id: string
    alias: string
    direction: string
    lat: number
    lng: number
  }>
  center: [number, number]
  zoom?: number
  onDirectionClick?: (direction: any) => void
  height?: string
  className?: string
}

export const DirectionsMap = ({ 
  directions, 
  center, 
  zoom = 13, 
  onDirectionClick,
  height = '500px',
  className = ''
}: DirectionsMapProps) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marcadores de direcciones */}
        {directions.map((direction) => (
          <Marker 
            key={direction.id} 
            position={[direction.lat, direction.lng]}
            eventHandlers={{
              click: () => onDirectionClick?.(direction)
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-green-600">{direction.alias}</p>
                <p className="text-sm text-gray-700">{direction.direction}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lat: {direction.lat.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">
                  Lng: {direction.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
