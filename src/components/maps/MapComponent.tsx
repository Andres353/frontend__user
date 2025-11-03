import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapComponentProps {
  center?: [number, number]
  zoom?: number
  onLocationSelect?: (lat: number, lng: number) => void
  selectedLocation?: [number, number] | null
  height?: string
  className?: string
}

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng)
      }
    },
  })

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
  // Centro por defecto: Cochabamba, Bolivia
  const defaultCenter: [number, number] = [-17.3895, -66.1568]
  const [mapCenter, setMapCenter] = useState<[number, number]>(center || defaultCenter)
  const [key, setKey] = useState(0) // Key para forzar re-render
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (center) {
      setMapCenter(center)
      setKey(prev => prev + 1) // Forzar re-render cuando cambie el centro
    }
  }, [center])

  useEffect(() => {
    // Pequeño delay para asegurar que el mapa se renderice correctamente
    const timer = setTimeout(() => {
      setIsMapReady(true)
    }, 500) // Aumentamos el delay para dar más tiempo
    
    return () => clearTimeout(timer)
  }, [])

  // Función para manejar errores del mapa
  const handleMapError = (error: any) => {
    console.error('Error del mapa:', error)
    setIsMapReady(false)
  }

  if (!isMapReady) {
    return (
      <div className={`w-full ${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando mapa...</p>
          <button 
            onClick={() => {
              setIsMapReady(false)
              setTimeout(() => setIsMapReady(true), 100)
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div style={{ height: '100%', width: '100%' }}>
        <MapContainer
          key={key}
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
          whenCreated={() => {
            console.log('Mapa creado correctamente')
          }}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={1}
        />
        
        {/* Marcador de ubicación seleccionada */}
        {selectedLocation && (
          <Marker 
            position={selectedLocation}
            icon={L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">📍 Ubicación seleccionada</p>
                <p className="text-sm text-gray-600">
                  Lat: {selectedLocation[0].toFixed(6)}
                </p>
                <p className="text-sm text-gray-600">
                  Lng: {selectedLocation[1].toFixed(6)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Haz clic en otro lugar para cambiar
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Manejador de clics */}
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
        </MapContainer>
      </div>
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
