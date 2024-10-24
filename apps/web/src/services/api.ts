import axios from 'axios'
import { Requests } from 'types'

const instance = axios.create({
  baseURL: '/api/',
  timeout: 1000,
})

export default instance
