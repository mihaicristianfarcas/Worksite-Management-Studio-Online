import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { useEffect } from 'react'
import { Project } from '@/api/types'

interface ProjectMapProps {
  project: Project
}

const ProjectMap = ({ project }: ProjectMapProps) => {
  const latitude = project.latitude
  const longitude = project.longitude
  const projectName = project.name

  useEffect(() => {
    // Fix for default marker icon
    delete (Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl
    Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    })
  }, [])

  return (
    <div
      className='h-[400px] w-full overflow-hidden rounded-lg border border-gray-200'
      style={{ zIndex: 0 }}
    >
      <MapContainer
        key={`${project.id}-${latitude}-${longitude}`}
        center={[latitude ? latitude : 0, longitude ? longitude : 0]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[latitude ? latitude : 0, longitude ? longitude : 0]}>
          <Popup>
            <strong>{projectName}</strong>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default ProjectMap
