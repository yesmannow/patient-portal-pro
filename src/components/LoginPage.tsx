import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { UserRole } from '@/lib/types'
import { SignIn, FirstAidKit } from '@phosphor-icons/react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('patient')
  const { setCurrentUser } = useAuth()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setCurrentUser({
        id: `user-${Date.now()}`,
        email,
        role,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mx-auto">
            <FirstAidKit className="w-8 h-8 text-primary" weight="duotone" />
          </div>
          <CardTitle className="text-2xl text-center">Medical Practice Portal</CardTitle>
          <CardDescription className="text-center">
            Secure patient-provider communication platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Login As</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="provider">Healthcare Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" size="lg">
              <SignIn className="w-5 h-5 mr-2" />
              Sign In to Portal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
