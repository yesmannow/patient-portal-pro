import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { SignOut, FirstAidKit } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function AppHeader() {
  const { currentUser, logout } = useAuth()

  if (!currentUser) return null

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <FirstAidKit className="w-5 h-5 text-primary" weight="duotone" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Medical Practice Portal</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              <Badge variant="secondary" className="text-xs py-0 h-5">
                {currentUser.role === 'patient' ? 'Patient' : 'Provider'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(currentUser.email)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{currentUser.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <SignOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
