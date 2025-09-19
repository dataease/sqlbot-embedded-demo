import { request } from '@/utils/request'

export const EmbeddedTokenApi = {
  generage: () => request.get('/token')
}
