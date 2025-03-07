import { AppSidebar } from "./app-sidebar";
import PageTitle from "./page-title";
import { SidebarInset } from "./ui/sidebar";

export default function PageWrapper({ pageTitle, children } : { pageTitle: string, children: React.ReactNode }) {
  return (
    <>
        <AppSidebar />
            <SidebarInset>
                <PageTitle title={pageTitle} />
                {children}
            </SidebarInset>
    </>
  )
}
