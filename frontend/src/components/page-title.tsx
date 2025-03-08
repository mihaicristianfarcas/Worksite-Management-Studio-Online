
export default function PageTitle({ title } : { title: string }) {
  return (
    <>
      <h1 className="text-3xl p-4 font-bold">{title}</h1>
      <hr className="w-full" />
    </>
  )
}
