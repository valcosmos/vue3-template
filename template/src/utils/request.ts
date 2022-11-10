import HttpRequest from './axios'
import { baseUrl } from '@/config'
const baseURL = baseUrl

const axios = new HttpRequest(baseURL)

export default axios
