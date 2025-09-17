// src/services/request.ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type CancelTokenSource,
} from 'axios'

import { useCache } from '@/utils/useCache'
import { ElMessage } from 'element-plus'
const token_key = 'sqlbot-embedded-token'
const { wsCache } = useCache()
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
  success: boolean
  [key: string]: any // Allow additional fields
}

// Extended request options
export interface RequestOptions {
  silent?: boolean // Silent mode (no error alerts)
  rawResponse?: boolean // Return raw Axios response
  customError?: boolean // Custom error handling
  retryCount?: number // Number of retry attempts
}

// Merged request configuration
export interface FullRequestConfig extends AxiosRequestConfig {
  requestOptions?: RequestOptions
}

// Custom error type
export interface RequestError<T = any> extends Error {
  config: FullRequestConfig
  code?: string
  request?: any
  response?: AxiosResponse<T>
  isAxiosError: boolean
}

class HttpService {
  private instance: AxiosInstance
  private cancelTokenSource: CancelTokenSource

  constructor(config?: AxiosRequestConfig) {
    this.cancelTokenSource = axios.CancelToken.source()
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 100000,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      ...config,
    })

    this.setupInterceptors()
  }


  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = wsCache.get(token_key)
        if (token && config.headers) {
          config.headers[token_key] = `Bearer ${token}`
        }
       
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        
        if ((response.config as FullRequestConfig).requestOptions?.rawResponse) {
          return response
        }

        if (response.data?.code === 0) {
          return response.data.data
        } else if (response.data?.code) {
          return Promise.reject(response.data)
        }
        return response.data
      },
      async (error: AxiosError) => {
        const config = error.config as FullRequestConfig & { __retryCount?: number }
        const requestOptions = config?.requestOptions || {}

        const shouldRetry =
          error.response?.status === 502 &&
          (config.__retryCount || 0) < (requestOptions.retryCount || 3)

        if (shouldRetry) {
          config.__retryCount = (config.__retryCount || 0) + 1

          await new Promise((resolve) => setTimeout(resolve, 1000 * (config.__retryCount || 1)))

          return this.instance.request(config)
        }

        if (!requestOptions.customError && !requestOptions.silent) {
          this.handleError(error)
        }

        return Promise.reject(error)
      }
    )
  }

  private handleError(error: AxiosError) {
    let errorMessage = 'Request error'

    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = 'Invalid request parameters'
          break
        case 401:
          errorMessage = error.response?.data
            ? error.response.data.toString()
            : 'Unauthorized, please login again'
          // Redirect to login page if needed
          ElMessage({
            message: errorMessage,
            type: 'error',
            showClose: true,
          })
          setTimeout(() => {
            wsCache.delete(token_key)
            window.location.reload()
          }, 2000)
          return
        // break
        case 403:
          errorMessage = 'Access denied'
          break
        case 404:
          errorMessage = 'Resource not found'
          break
        case 500:
          errorMessage = 'Server error'
          break
        default:
          errorMessage = `Server responded with error: ${error.response.status}`
      }
      if (error?.response?.data) {
        errorMessage = error.response.data.toString()
      }
    } else if (error.request) {
      errorMessage = 'No response from server'
    } else if (axios.isCancel(error)) {
      errorMessage = 'Request canceled'
      return // Skip showing cancel messages
    } else {
      errorMessage = error['message'] || 'Unknown error'
    }

    // Show error using UI library (e.g., Element Plus, Ant Design)
    console.error(errorMessage)
    /* if (errorMessage?.includes('Invalid license key salt')) {
      showLicenseKeyError()
    } */
    // ElMessage.error(errorMessage)
    ElMessage({
      message: errorMessage,
      type: 'error',
      showClose: true,
    })
  }

  // Cancel all pending requests
  public cancelRequests(message?: string) {
    this.cancelTokenSource.cancel(message)
    // Create new token source for future requests
    this.cancelTokenSource = axios.CancelToken.source()
  }

  // Base request method
  public request<T = any>(config: FullRequestConfig): Promise<T> {
    return this.instance.request({
      cancelToken: this.cancelTokenSource.token,
      ...config,
    })
  }

  // GET request
  public get<T = any>(url: string, config?: FullRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET', url })
  }

  // POST request
  public post<T = any>(url: string, data?: any, config?: FullRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST', url, data })
  }


  // PUT request
  public put<T = any>(url: string, data?: any, config?: FullRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  // DELETE request
  public delete<T = any>(url: string, config?: FullRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE', url })
  }

  // PATCH request
  public patch<T = any>(url: string, data?: any, config?: FullRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PATCH', url, data })
  }

  // File upload
  public upload<T = any>(
    url: string,
    file: File,
    fieldName = 'file',
    config?: FullRequestConfig
  ): Promise<T> {
    const formData = new FormData()
    formData.append(fieldName, file)

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    })
  }

  // Download file
  public download(url: string, config?: FullRequestConfig): Promise<Blob> {
    return this.request<Blob>({
      ...config,
      method: 'GET',
      url,
      responseType: 'blob',
    })
  }

  public loadRemoteScript(url: string, id?: string, cb?: any): Promise<HTMLElement> {
    if (!url) {
      return Promise.reject(new Error('URL is required to load remote script'))
    }
    if (id && document.getElementById(id)) {
      return Promise.resolve(document.getElementById(id) as HTMLElement)
    }
    if (url.startsWith('/')) {
      const real_url = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
      url = real_url + url
    }
    return new Promise<HTMLElement>((resolve, reject) => {
      // 改用传统的script标签加载方式
      const script = document.createElement('script')
      script.src = url
      script.id = id || `remote-script-${Date.now()}`

      script.onload = () => {
        if (cb) cb()
        resolve(script)
      }

      script.onerror = (error) => {
        console.error(`Failed to load script from ${url}:`, error)
        reject(new Error(`Failed to load script from ${url}`))
      }

      document.head.appendChild(script)
    })
  }
}

// Create singleton instance
export const request = new HttpService({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})
