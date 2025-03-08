export default function PageTitle({ title }: { title: string }) {
  return (
    <>
      <h1 className='p-4 text-3xl font-bold'>{title}</h1>
      <hr className='w-full' />
    </>
  )
}
