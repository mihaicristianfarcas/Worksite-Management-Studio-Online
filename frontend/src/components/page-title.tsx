export default function PageTitle({ title }: { title: string }) {
  return (
    <>
      <h1 className='text-nowrap p-6 text-3xl font-bold'>{title}</h1>
      <hr className='w-full' />
    </>
  )
}
