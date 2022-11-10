import { publicPath } from '@/config'

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Canceler
} from 'axios'

import { useError } from '@/composables/use-error'

interface HttpResponse<T = any> extends AxiosResponse {
  errorCode: string
  errorMsg: string
  resultData: T
  status: number
}

class HttpRequest {
  private baseURL: string
  private pending: Record<string, Canceler>
  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.pending = {}
  }

  getConfig() {
    const config = {
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
      // timeout: 10000
    }
    return config
  }

  removePending(key: string, isRequest = false) {
    if (this.pending[key] && isRequest) {
      this.pending[key]('取消重复请求')
    }
    delete this.pending[key]
  }

  interceptors(instance: AxiosInstance) {
    instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        let isPublic = false
        console.log(config.url)

        publicPath.forEach((p) => {
          isPublic = isPublic || p.test(config.url as string)
        })

        const token = localStorage.getItem('token')

        if (!isPublic && token) {
          const auth = {
            // Authorization: 'Bearer ' + token
            token
          }
          config.headers = auth
        }
        const key = `${config.url}&${config.method}`
        this.removePending(key, true)
        config.cancelToken = new axios.CancelToken((c) => {
          this.pending[key] = c
        })
        return config
      },
      (err: AxiosError) => {
        useError(err)
        return Promise.reject(err)
      }
    )

    instance.interceptors.response.use(
      (res: AxiosResponse) => {
        const key = `${res.config.url}&${res.config.method}`
        this.removePending(key)
        if (res.status === 200) return Promise.resolve(res.data)
        return Promise.reject(res)
      },
      (err: AxiosError) => {
        useError(err)
        return Promise.reject(err)
      }
    )
  }

  request<T = any>(options: AxiosRequestConfig): Promise<HttpResponse> {
    const instance = axios.create()
    const newOptions = Object.assign(this.getConfig(), options)
    this.interceptors(instance)
    // return instance(newOptions)

    return new Promise((resolve, reject) => {
      instance
        .request<any, HttpResponse<T>>(newOptions)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<HttpResponse<T>> {
    const options = Object.assign({ method: 'GET', url }, config)
    return this.request<T>(options)
  }

  post<T = any>(url: string, data: any): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'POST', url, data })
  }

  put<T = any>(url: string, data: any): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data })
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<HttpResponse<T>> {
    const options = Object.assign({ method: 'DELETE', url }, config)
    return this.request<T>(options)
  }
}

export default HttpRequest
