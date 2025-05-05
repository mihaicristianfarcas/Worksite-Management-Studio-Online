import { LoginForm } from '@/components/forms/login-form'

export default function Login() {
  return (
    <div
      className='fixed inset-0 flex items-center justify-center bg-cover bg-center'
      style={{ backgroundImage: "url('/login.jpeg')" }}
    >
      <div className='absolute inset-0 bg-black opacity-60'></div>
      <div className='bg-background relative w-full max-w-sm rounded-lg border p-6 shadow-lg'>
        <LoginForm className='max-h-screen' />
      </div>
    </div>
  )
}
