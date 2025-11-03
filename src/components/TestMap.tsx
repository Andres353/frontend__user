import { MapComponent } from './maps/MapComponent'

export const TestMap = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Prueba del Mapa</h2>
      <div className="h-96 border border-gray-300 rounded-lg">
        <MapComponent
          center={[-17.3895, -66.1568]} // Cochabamba, Bolivia
          zoom={13}
          onLocationSelect={(lat, lng) => {
            console.log('Ubicación seleccionada:', lat, lng)
          }}
        />
      </div>
    </div>
  )
}

