import { processItem } from './email-parser'
import { useSettings } from "@/store/use-settings"

type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: Record<string, unknown>
}

export interface EmailAddress {
  id: number
  name: string
  created_at: string
  updated_at: string
  mail_count?: number
  send_count: number
}

interface AddressResponse {
  results: EmailAddress[]
  count: number
}

interface SettingsResponse {
  domains: string[]
  needAuth: boolean
  enableUserCreateEmail: boolean
  enableUserDeleteEmail: boolean
  version: string
}

export interface MailsResponse {
  items: Mail[]
  total: number
}

export class HttpClient {
  private static mailCounts: Record<string, number> = {}
  private static mailCache: Map<string, MailsResponse> = new Map()

  private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const settings = useSettings.getState()
    const baseUrl = settings.apiBaseUrl || process.env.NEXT_PUBLIC_API_BASE_URL
    const authToken = settings.authToken || process.env.NEXT_PUBLIC_AUTH_TOKEN

    // 确保 baseUrl 存在
    if (!baseUrl) {
      throw new Error('API base URL is not configured')
    }

    const url = `${baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken && { 'x-admin-auth': authToken }), // 只在有 token 时添加
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Request failed:', error)
      throw error
    }
  }

  static async getMails(address: string, limit = 20, offset = 0): Promise<MailsResponse> {
    const cacheKey = `${address}-${offset}-${limit}`
    const cached = this.mailCache.get(cacheKey)
    if (cached) {
      return cached
    }
    
    try {
      const response = await this.request<MailResponse>(
        `/admin/mails?limit=${limit}&offset=${offset}&address=${address}`
      )

      if (!response || !response.results) {
        throw new Error('Invalid response structure')
      }

      const processedItems = await Promise.all(
        response.results.map(async (mail) => {
          const processed = await processItem(mail)
          return processed
        })
      )

      // 如果返回了 count，更新存储的总数
      if (response.count !== undefined) {
        this.mailCounts[address] = response.count
      }

      const result = {
        items: processedItems,
        total: this.mailCounts[address] || 0
      }

      this.mailCache.set(cacheKey, result)
      return result
    } catch (error) {
      console.error('HttpClient.getMails: Error:', error)
      throw error
    }
  }

  static async getMail(id: string, address: string) {
    try {
      const response = await this.getMails(address)
      const mail = response.items.find(item => item.id.toString() === id)
      
      if (!mail) {
        throw new Error('Mail not found')
      }

      return mail
    } catch (error) {
      console.error('HttpClient.getMail: Error:', error)
      throw error
    }
  }

  static async getAddresses() {
    try {
      const response = await this.request<AddressResponse>(
        '/admin/address?limit=100&offset=0'
      )
      return response.results
    } catch (error) {
      console.error('HttpClient.getAddresses: Error:', error)
      throw error
    }
  }

  static async getSettings() {
    try {
      const response = await this.request<SettingsResponse>('/open_api/settings')
      return response
    } catch (error) {
      console.error('HttpClient.getSettings: Error:', error)
      throw error
    }
  }

  static async createAddress(prefix: string, domain: string) {
    try {
      const response = await this.request<EmailAddress>(
        '/admin/new_address',
        {
          method: 'POST',
          body: {
            enablePrefix: true,
            name: prefix,
            domain: domain
          }
        }
      )
      return response
    } catch (error) {
      console.error('HttpClient.createAddress: Error:', error)
      throw error
    }
  }

  static async deleteAddress(id: number) {
    try {
      await this.request(
        `/admin/delete_address/${id}`,
        {
          method: 'DELETE'
        }
      )
    } catch (error) {
      console.error('HttpClient.deleteAddress: Error:', error)
      throw error
    }
  }

  static async getAllMails(limit = 20, offset = 0): Promise<MailsResponse> {
    try {
      const response = await this.request<MailResponse>(
        `/admin/mails?limit=${limit}&offset=${offset}`
      )

      if (!response || !response.results) {
        throw new Error('Invalid response structure')
      }

      const processedItems = await Promise.all(
        response.results.map(async (mail) => {
          const processed = await processItem(mail)
          return processed
        })
      )

      return {
        items: processedItems,
        total: response.count || 0
      }
    } catch (error) {
      console.error('HttpClient.getAllMails: Error:', error)
      throw error
    }
  }
}

// 类型定义
export interface Mail {
  id: number
  message_id: string
  source: string
  address: string
  raw: string
  created_at: string
  subject?: string
  from?: string
  to?: string[]
  cc?: string[]
  content?: string
  text?: string
  message?: string
  attachments?: Array<{
    id: string
    filename: string
    size: string | number
    url: string
    blob: Blob
  }>
}

interface MailResponse {
  results: Mail[]
  count?: number  // 修改为可选属性
} 