import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL || typeof baseURL !== 'string' || baseURL.trim() === '') {
  throw new Error('VITE_API_BASE_URL environment variable is not set. Please define it in your environment.');
}

export const api = axios.create({ baseURL });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pl_token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})
