import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Calendar, Home, Settings, PersonStanding, MapPin, Frame } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// Menu mainItems.
const mainItems = [
  {
    title: "Home",
    icon: Home,
  },
    {
    title: "Workers",
    icon: PersonStanding,
  },
  {
    title: "Worksites",
    icon: MapPin,
  },
  {
    title: "Projects",
    icon: Frame,
  }
];

const additionalItems = [
  {
    title: "Calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    icon: Settings,
  },
];

export function AppSidebar() {

  const isMobile = useIsMobile();

  return (
    <>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
          <span className='text-balance gap-0.5 italic font-thin'> Worksite Management Studio 2025</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      className='cursor-pointer'
                      asChild
                    >
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
                {additionalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      className='cursor-pointer'
                      asChild
                    >
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
        <SidebarFooter className="flex flex-row gap-2 text-xs items-center justify-center font-extralight">
          <ThemeToggle />
          <span>|</span>
          <span>version 0.1</span>
        </SidebarFooter>
      </Sidebar>
      {isMobile && <SidebarTrigger />}
    </>
  );
}