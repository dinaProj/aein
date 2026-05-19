'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Admin Login
              </CardTitle>

              <CardDescription>
                Enter your credentials to access the admin panel
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">

                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>

                    <Input
                      id="username"
                      type="text"
                      placeholder="admin"
                      required
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">
                      Password
                    </Label>

                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? 'Signing in...'
                      : 'Sign In'}
                  </Button>

                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}