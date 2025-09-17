import { request } from '@/utils/request'

export const SettingApi = {
  query: () => request.get('/setting'),
  save: (data: any) => request.post('/setting', data)
}
