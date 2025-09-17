import { defineStore } from 'pinia'
import { useCache } from '@/utils/useCache'
import { store } from './index'
import { user_list, fixed_pwd } from '@/utils/entity'
const { wsCache } = useCache()
const token_key = 'sqlbot-embedded-token'

interface UserState {
  uid: number
  token: string
  account: string
  name: string
  role: string
  online: boolean
}

export const UserStore = defineStore('user', {
  state: (): UserState => {
    return {
      uid: 0,
      token: '',
      account: '',
      name: '',
      role: '',
      online: false
    }
  },
  getters: {
    getUid(): number {
      return this.uid
    },
    getToken(): string {
      return this.token
    },
    getAccount(): string {
      return this.account
    },
    getName(): string {
      return this.name
    },
    getRole(): string {
      return this.role
    },
    getOnline(): boolean {
      return this.online
    }
  },
  actions: {
    init() {
      const localToken = wsCache.get(token_key)
      this.setToken(localToken)
      if (!localToken) {
        this.clear()
        return
      }
      const userObj = JSON.parse(window.atob(localToken))
      const currentUser = user_list.find(item => item.account === userObj.account)
      this.setAccount(userObj.account)
      this.setName(currentUser?.name || '')
      this.setRole(currentUser?.role || '')
      this.setUid(currentUser?.uid || 0)
      this.setOnline(true)
    },
    login(account: string, password:string) {
      if (!account) {
        throw Error('账号不能为空！')
      }
      const currentUser = user_list.find(item => item.account === account)
      if (!currentUser) {
        throw Error('账号错误！')
      }
      if (password !== fixed_pwd) {
        throw Error('密码错误！')
      }
      const param = { account, password }
      const parseToken = window.btoa(JSON.stringify(param))
      wsCache.set(token_key, parseToken)
      this.init()
    },

    logout() {
      this.clear()
      location.reload()
    },

    setUid(uid: number) {
      this.uid = uid
    },
    setToken(token: string) {
      this.token = token
    },
    setAccount(account: string) {
      this.account = account
    },
    setName(name: string) {
      this.name = name
    },
    setOnline(online: boolean) {
      this.online = online
    },
    setRole(role: string) {
      this.role = role
    },
    clear() {
      wsCache.delete(token_key)
      this.$reset()
    },
  },
})

export const useUserStore = () => {
  return UserStore(store)
}
