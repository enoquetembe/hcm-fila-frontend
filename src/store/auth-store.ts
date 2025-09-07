import { Usuario } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: Usuario | null
  isAuthenticated: boolean
  login: (token: string, user: Usuario) => void
  logout: () => void
  updateUser: (user: Usuario) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({ 
          token, 
          user, 
          isAuthenticated: true 
        }),
      logout: () =>
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        }),
      updateUser: (user) =>
        set({ user }),
    }),
    {
      name: 'hcm-auth-storage',
    }
  )
)