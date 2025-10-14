/// <reference types="vue/macros-global" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vite環境変数の型定義
declare const __VUE_OPTIONS_API__: boolean
declare const __VUE_PROD_DEVTOOLS__: boolean

// webpack DefinePluginで注入される環境変数の型定義
declare namespace NodeJS {
  interface ProcessEnv {
    readonly LOG_LEVEL?: string
    readonly APP_VERSION?: string
  }
}