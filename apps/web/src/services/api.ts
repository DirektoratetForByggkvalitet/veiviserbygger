import axios from 'axios'
import { Requests } from 'types/requests'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_ROOT || '/api/',
  timeout: 1000,
})

export const getConfig = async () => {
  const { data } = await instance.get<Requests['/config']['GET']['response']>('/config')
  return data
}

export const getFile = async (path: string) => {
  const { data } = await instance.get<Requests['/storage/:path']['GET']['response']>(
    `/storage/${encodeURIComponent(path)}`,
    { responseType: 'blob' }, // Consider increasing the { timeout: 1000 } here if wizard duplication failes
  )

  return data
}

export default instance
