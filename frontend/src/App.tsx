import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/providers/theme-provider'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Calendar from './pages/Calendar'
import Projects from './pages/Projects'
import Workers from './pages/Workers'
import Worksites from './pages/Worksites'
import { AppSidebar } from './components/app-sidebar'
import { useIsMobile } from './hooks/use-mobile'
import { Toaster } from 'sonner'

function App() {
  const isMobile = useIsMobile()

  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <Toaster />
      <Routes>
        {/* Login route outside of SidebarProvider */}
        <Route path='/' element={<Login />} />

        {/* All other routes wrapped with SidebarProvider */}
        <Route
          path='/*'
          element={
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                {isMobile && <SidebarTrigger />}
                <div className='mx-auto w-[calc(100%-4rem)]'>
                  <Routes>
                    <Route path='//dashboard' element={<Dashboard />} />
                    <Route path='/calendar' element={<Calendar />} />
                    <Route path='/projects' element={<Projects />} />
                    <Route path='/settings' element={<Settings />} />
                    <Route path='/workers' element={<Workers />} />
                    <Route path='/worksites' element={<Worksites />} />
                  </Routes>
                </div>
              </SidebarInset>
            </SidebarProvider>
          }
        />
      </Routes>
    </ThemeProvider>
  )
}

export default App
