import Home from '@/pages/Home'
import Calendar from '@/pages/Calendar'
import Settings from '@/pages/Settings'
import Workers from '@/pages/Workers'
import Projects from '@/pages/Projects'
import Worksites from '@/pages/Worksites'

// Component mapping
const sectionComponents: Record<string, React.ComponentType> = {
  home: Home,
  calendar: Calendar,
  settings: Settings,
  workers: Workers,
  projects: Projects,
  worksites: Worksites
}

export default function ActivePage({ section }: { section: string }) {
  const SectionComponent = sectionComponents[section.toLowerCase()]

  return <SectionComponent />
}
