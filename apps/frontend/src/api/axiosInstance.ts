import axios from 'axios'

import { store } from '@/store/store'
import { requestStarted, requestFinished } from '@/store/loadingSlice'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
})

axiosInstance.interceptors.request.use(
  (config) => {
    store.dispatch(requestStarted())
    return config
  },
  (error) => {
    store.dispatch(requestFinished())
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    store.dispatch(requestFinished())
    return response
  },
  (error) => {
    store.dispatch(requestFinished())

    return Promise.reject(error)
  }
)

export default axiosInstance
