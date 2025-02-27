import axios from 'axios'
import { Requests } from 'types/requests'

const instance = axios.create({
  baseURL: import.meta.env.API_ROOT || '/api/',
  timeout: 1000,
})

export const getConfig = async () => {
  const { data } = await instance.get<Requests['/config']['GET']['response']>('/config')
  return data
}

export default instance
