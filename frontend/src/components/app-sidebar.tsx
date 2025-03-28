import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  // SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar'

import { Calendar, Settings, PersonStanding, MapPin, Frame, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Link } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'

// Menu mainItems.
const mainPages = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Workers',
    icon: PersonStanding
  },
  {
    title: 'Worksites',
    icon: MapPin
  },
  {
    title: 'Projects',
    icon: Frame
  }
]

const additionalPages = [
  {
    title: 'Calendar',
    icon: Calendar
  },
  {
    title: 'Settings',
    icon: Settings
  }
]

export function AppSidebar() {
  const isMobile = useIsMobile()

  return (
    <>
      <Sidebar collapsible='icon' variant='floating'>
        {/* <SidebarHeader>Worksite Management Studio
        </SidebarHeader> */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainPages.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton className='cursor-pointer' asChild>
                      <Link to={`/${item.title.toLowerCase()}`}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {additionalPages.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton className='cursor-pointer' asChild>
                      <Link to={`/${item.title.toLowerCase()}`}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className='fixed bottom-2 left-[0.43rem] items-center justify-center'>
          {!isMobile && <SidebarTrigger />}
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
