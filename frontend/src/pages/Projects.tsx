import PageWrapper from "@/components/page-wrapper";

export default function Projects() {
  return (
    <PageWrapper pageTitle="Projects">
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <img
              src="/vite.svg"
              alt="Vite Logo"
              className="w-32 h-32 animate-spin-slow"
            />
            <h1 className="text-2xl font-bold">Welcome to Projects Section</h1>
          </div>
    </PageWrapper>
  )
}
