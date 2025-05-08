import { RegisterForm } from '@/components/register-form'

export default function Register() {
  return (
    <div
      className='fixed inset-0 flex items-center justify-center bg-cover bg-center'
      style={{ backgroundImage: "url('/login.jpeg')" }}
    >
      <div className='absolute inset-0 bg-black opacity-60'></div>
      <div className='bg-background relative w-full max-w-sm rounded-lg border p-6 shadow-lg'>
        <RegisterForm className='max-h-screen' />
      </div>
    </div>
  )
}
