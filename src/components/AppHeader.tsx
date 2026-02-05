import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { SignOut, FirstAidKit, House, User, List } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface AppHeaderProps {
  currentView?: 'dashboard' | 'profile'
  onNavigate?: (view: 'dashboard' | 'profile') => void
}

export function AppHeader({ currentView = 'dashboard', onNavigate }: AppHeaderProps) {
  const { currentUser, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!currentUser) return null

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase()
  }

  const handleMobileNavigate = (view: 'dashboard' | 'profile') => {
    onNavigate?.(view)
    setMobileMenuOpen(false)
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
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

          {currentUser.role === 'patient' && onNavigate && (
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('dashboard')}
              >
                <House className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentView === 'profile' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {currentUser.role === 'patient' && onNavigate && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <List className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-3 mt-6">
                  <Button
                    variant={currentView === 'dashboard' ? 'secondary' : 'outline'}
                    className="justify-start h-12"
                    onClick={() => handleMobileNavigate('dashboard')}
                  >
                    <House className="w-5 h-5 mr-3" />
                    Dashboard
                  </Button>
                  <Button
                    variant={currentView === 'profile' ? 'secondary' : 'outline'}
                    className="justify-start h-12"
                    onClick={() => handleMobileNavigate('profile')}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}

          <div className="hidden sm:flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(currentUser.email)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-medium">{currentUser.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <SignOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
