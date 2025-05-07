import { useState } from 'react'
import { MapPin, Frame, PersonStanding, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { Link } from 'react-router-dom'

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate inputs
    if (!username || !email || !password) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      await register({ username, email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <a href='#' className='flex flex-col items-center gap-2 font-medium'>
              <div className='flex flex-row items-center justify-center gap-4 rounded-md'>
                <MapPin size={24} />
                <span>//</span>
                <Frame size={24} />
                <span>//</span>
                <PersonStanding size={24} />
                <span>//</span>
                <Home size={24} />
              </div>
              <span className='sr-only'>Worksite Management</span>
            </a>
            <h1 className='text-l my-1.5 font-bold'>Create Your Account</h1>
            <div className='text-muted-foreground text-center text-xs'>
              Already have an account?{' '}
              <Link to='/' className='underline underline-offset-4'>
                Log in
              </Link>
            </div>
          </div>
          <div className='flex flex-col gap-6'>
            {error && (
              <div className='bg-destructive/15 text-destructive rounded-md p-2 text-sm'>
                {error}
              </div>
            )}
            <div className='grid gap-3'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                type='text'
                placeholder='username'
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-3'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='user@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-3'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder=''
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-3'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                id='confirmPassword'
                type='password'
                placeholder=''
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </div>
        </div>
      </form>
      <div className='text-muted-foreground *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs'>
        By registering, you agree to our <a href='#'>Terms of Service</a> and{' '}
        <a href='#'>Privacy Policy</a>.
      </div>
    </div>
  )
}
