import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  // SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar'

import {
  Calendar,
  Settings,
  PersonStanding,
  MapPin,
  Frame,
  LayoutDashboard,
  LogOut
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Link, useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback } from './ui/avatar'

// Menu mainItems.
const mainPages = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard'
  },
  {
    title: 'Workers',
    icon: PersonStanding,
    path: '/workers'
  },
  {
    title: 'Worksites',
    icon: MapPin,
    path: '/worksites'
  },
  {
    title: 'Projects',
    icon: Frame,
    path: '/projects'
  }
]

const additionalPages = [
  {
    title: 'Calendar',
    icon: Calendar,
    path: '/calendar'
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings'
  }
]

export function AppSidebar() {
  const isMobile = useIsMobile()
  const { logout, user } = useAuth()
  const location = useLocation()

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return 'U'
    const nameParts = user.username.split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return user.username.substring(0, 2).toUpperCase()
  }

  // Function to check if a route is active
  const isRouteActive = (path: string) => {
    return location.pathname === path || location.pathname === path.toLowerCase()
  }

  return (
    <>
      <Sidebar collapsible='icon' variant='floating'>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>User</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <p className='text-sm font-medium'>{user?.username}</p>
                      <p className='text-muted-foreground text-xs'>{user?.email}</p>
                      <p className='text-muted-foreground text-xs capitalize'>Role: {user?.role}</p>
                    </div>
                  </div>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className='text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer'
                    tooltip='Logout'
                    onClick={logout}
                  >
                    <LogOut className='h-8 w-8' />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainPages.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className='cursor-pointer'
                      asChild
                      isActive={isRouteActive(item.path)}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
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
                    <SidebarMenuButton
                      className='cursor-pointer'
                      asChild
                      isActive={isRouteActive(item.path)}
                      tooltip={item.title}
                    >
                      <Link to={item.path}>
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
