import axios from 'axios'

type Requests = any

const instance = axios.create({
  baseURL: '/api/',
  timeout: 1000,
})

export const getConfig = async () => {
  const { data } = await instance.get<Requests['/config']['GET']['response']>('/config')
  return data
}

export default instance
