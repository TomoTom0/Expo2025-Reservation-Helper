import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

// Piniaインスタンスを作成・設定
export const pinia = createPinia()
pinia.use(createPersistedState())

// グローバルでPiniaを設定
if (typeof window !== 'undefined') {
  (window as any).__pinia__ = pinia
}