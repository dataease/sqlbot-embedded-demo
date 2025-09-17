import { request } from '@/utils/request'

export const AuthApi = {
  login: (data: any) => request.post('/login', data)
}
