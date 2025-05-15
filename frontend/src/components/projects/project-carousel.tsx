import { Project } from '@/api/model/project'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useCallback } from 'react'

interface ProjectCarouselProps {
  projects: Project[]
  loadingState: 'idle' | 'loading' | 'error'
  onEditProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  carouselApiCallback: (api: CarouselApi | null) => void
}

// Carousel component that displays project cards and handles navigation
const ProjectCarousel = ({
  projects,
  loadingState,
  onEditProject,
  onDeleteProject,
  carouselApiCallback
}: ProjectCarouselProps) => {
  const handleCarouselChange = useCallback(
    (api: CarouselApi | null) => {
      if (!api) return

      carouselApiCallback(api)
    },
    [carouselApiCallback]
  )

  return (
    <Carousel className='mx-auto w-[90%]' setApi={handleCarouselChange}>
      <CarouselContent>
        {loadingState === 'loading' ? (
          <CarouselItem>
            <Card>
              <CardContent className='flex h-40 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </CardContent>
            </Card>
          </CarouselItem>
        ) : projects.length > 0 ? (
          projects.map(project => (
            <CarouselItem key={project.id}>
              <div className='p-1'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-xl'>{project.name}</CardTitle>
                    <div className='flex items-center space-x-2'>
                      <Button variant='ghost' size='icon' onClick={() => onEditProject(project)}>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => onDeleteProject(project)}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm'>{project.description}</p>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Status:</span>
                        <span className='text-sm capitalize'>{project.status}</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Start Date:</span>
                        <span className='text-sm'>
                          {project.start_date ? format(new Date(project.start_date), 'PPP') : '-'}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>End Date:</span>
                        <span className='text-sm'>
                          {project.end_date ? format(new Date(project.end_date), 'PPP') : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))
        ) : (
          <CarouselItem>
            <div className='p-1'>
              <Card>
                <CardContent className='flex h-40 items-center justify-center'>
                  <p className='text-muted-foreground'>No projects found.</p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        )}
      </CarouselContent>
      {projects.length > 1 && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  )
}

export default ProjectCarousel
