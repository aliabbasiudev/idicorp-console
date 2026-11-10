import { create } from 'zustand'
import { queryClient } from '../lib/queryClient'

// The access token lives in memory only: it is never written to web storage,
// so a page refresh signs the user out (the HTTP-only cookies stay in the browser).
export const useAuthStore = create((set) => ({
  token: null,
  notice: null,
  setToken: (token) => set({ token, notice: null }),
  logout: (notice = null) => {
    queryClient.clear()
    set({ token: null, notice })
  },
}))
