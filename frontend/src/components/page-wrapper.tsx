import { AppSidebar } from "./app-sidebar";
import PageTitle from "./page-title";
import { SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PageWrapper({ pageTitle, children } : { pageTitle: string, children: React.ReactNode }) {

  const isMobile = useIsMobile();

  return (
    <>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-between">
            {isMobile && <SidebarTrigger />}
            <PageTitle title={pageTitle} />
          </div>
            {children}
        </SidebarInset>
    </>
  )
}
