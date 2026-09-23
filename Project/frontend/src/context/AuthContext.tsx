import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  apiGetMe,
  apiLogin,
  apiRegister,
  apiUpdateProfile,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../api'
import type { AuthUser, ProfileUpdateForm, RegisterForm, UserProfile } from '../types'

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (form: RegisterForm) => Promise<void>
  logout: () => void
  updateProfile: (form: ProfileUpdateForm) => Promise<UserProfile>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: if a token exists in localStorage, re-validate it
  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    apiGetMe()
      .then((p) => {
        setProfile(p)
        setUser({
          userId: p.id,
          email: p.email,
          username: p.username,
          role: p.role,
          displayName: p.displayName,
          avatarUrl: p.avatarUrl,
        })
      })
      .catch(() => {
        // Token invalid or expired — clear it silently
        clearStoredToken()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password)
    setStoredToken(response.token)
    setUser({
      userId: response.userId,
      email: response.email,
      username: response.username,
      role: response.role,
      displayName: response.displayName,
      avatarUrl: response.avatarUrl,
    })
    // Fetch full profile after login
    const p = await apiGetMe()
    setProfile(p)
  }, [])

  const register = useCallback(async (form: RegisterForm) => {
    const response = await apiRegister(form)
    setStoredToken(response.token)
    setUser({
      userId: response.userId,
      email: response.email,
      username: response.username,
      role: response.role,
      displayName: response.displayName,
      avatarUrl: response.avatarUrl,
    })
    const p = await apiGetMe()
    setProfile(p)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(async (form: ProfileUpdateForm) => {
    const updated = await apiUpdateProfile(form)
    setProfile(updated)
    setUser((prev) =>
      prev
        ? {
            ...prev,
            displayName: updated.displayName,
            avatarUrl: updated.avatarUrl,
          }
        : prev
    )
    return updated
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!getStoredToken()) return
    const p = await apiGetMe()
    setProfile(p)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, login, register, logout, updateProfile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
