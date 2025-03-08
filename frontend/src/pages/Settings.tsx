import PageWrapper from '@/components/page-wrapper'

export default function Settings() {
  return (
    <PageWrapper pageTitle='Settings'>
      <div className='flex h-full flex-col items-center justify-center space-y-4'>
        <img
          src='/vite.svg'
          alt='Vite Logo'
          className='animate-spin-slow h-32 w-32'
        />
        <h1 className='text-2xl font-bold'>Welcome to Settings Section</h1>
      </div>
    </PageWrapper>
  )
}
