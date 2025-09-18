import { defineStore } from 'pinia'
import { store } from './index'
import { SettingApi } from '@/api/setting'
interface SettingState {
  domain: string
  base_assistant_id: string
  advanced_assistant_id: string
  embedded_app_id: string
  embedded_app_secret: string
  loaded: boolean
}

export const SettingStore = defineStore('setting', {
  state: (): SettingState => {
    return {
      domain: '',
      base_assistant_id: '',
      advanced_assistant_id: '',
      embedded_app_id: '',
      embedded_app_secret: '',
      loaded: false
    }
  },
  getters: {
    getDomain(): string {
      return this.domain
    },
    getBaseAssistantId(): string {
      return this.base_assistant_id
    },
    getAdvancedAssistantId(): string {
      return this.advanced_assistant_id
    },
    getEmbeddedAppId(): string {
      return this.embedded_app_id
    },
    getEmbeddedAppSecret(): string {
      return this.embedded_app_secret
    },
    getLoaded(): boolean {
      return this.loaded
    },
    getData(): any {
      return {
        domain: this.domain,
        base_assistant_id: this.base_assistant_id,
        advanced_assistant_id: this.advanced_assistant_id,
        embedded_app_id: this.embedded_app_id,
        embedded_app_secret: this.embedded_app_secret,
        loaded: this.loaded
      }
    }
  },
  actions: {
    async init(data?: any) {
      if (!data) {
        const res = await SettingApi.query()
        data = res.data
      }
      if (!data) {
        this.loaded = true
        return
      }
      this.domain = data.domain
      this.base_assistant_id = data.base_assistant_id
      this.advanced_assistant_id = data.advanced_assistant_id
      this.embedded_app_id = data.embedded_app_id
      this.embedded_app_secret = data.embedded_app_secret
      this.loaded = true
    },
    clear() {
      this.$reset()
    },
  },
})

export const useSettingStore = () => {
  return SettingStore(store)
}
