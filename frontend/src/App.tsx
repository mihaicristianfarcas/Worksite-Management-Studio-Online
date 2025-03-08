import { SidebarProvider } from '@/components/ui/sidebar'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'

import Settings from './pages/Settings'
import Home from './pages/Home'
import Login from './pages/Login'
import Calendar from './pages/Calendar'
import Projects from './pages/Projects'
import Workers from './pages/Workers'
import Worksites from './pages/Worksites'

function App() {
  return (
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <Routes>
        <Route path='/' element={<Login />} />
      </Routes>
      <SidebarProvider>
        <Routes>
          <Route path='/home' element={<Home />} />
          <Route path='/calendar' element={<Calendar />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/workers' element={<Workers />} />
          <Route path='/worksites' element={<Worksites />} />
        </Routes>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App
