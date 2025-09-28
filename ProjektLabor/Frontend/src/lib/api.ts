import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL as string

export const api = axios.create({ baseURL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pl_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})
