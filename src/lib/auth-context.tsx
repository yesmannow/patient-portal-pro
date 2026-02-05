import { createContext, useContext, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, ProviderRole } from './types'

interface AuthContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  logout: () => void
  providerRole: ProviderRole | null
  setProviderRole: (role: ProviderRole | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [providerRole, setProviderRole] = useKV<ProviderRole | null>('provider-role', null)

  const logout = () => {
    setCurrentUser(null)
    setProviderRole(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser: currentUser ?? null, setCurrentUser, logout, providerRole: providerRole ?? null, setProviderRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

