import { create } from 'zustand'

export type KeyValuePair = {
  id: string
  key: string
  value: string
  description?: string
  enabled: boolean
}

export type ResponseState = {
  status: number
  headers: Record<string, string>
  body: string
  time: number
  size: number
  error?: string
}

type RequestState = {
  id: string
  workspaceId: string
  method: string
  url: string
  headers: KeyValuePair[]
  queryParams: KeyValuePair[]
  body: string
  bodyType: 'none' | 'json' | 'form-data' | 'urlencoded' | 'raw'
  authorization: any // TODO: refine auth schema
  
  // Response State
  response: ResponseState | null
  isExecuting: boolean

  // Actions
  setRequest: (req: Partial<RequestState>) => void
  setMethod: (method: string) => void
  setUrl: (url: string) => void
  
  // KeyValue actions (for headers and params)
  addHeader: () => void
  updateHeader: (id: string, field: keyof KeyValuePair, value: any) => void
  removeHeader: (id: string) => void
  
  addQueryParam: () => void
  updateQueryParam: (id: string, field: keyof KeyValuePair, value: any) => void
  removeQueryParam: (id: string) => void
  
  setBody: (body: string) => void
  setBodyType: (type: RequestState['bodyType']) => void

  executeRequest: () => Promise<void>
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useRequestStore = create<RequestState>((set, get) => ({
  id: '',
  workspaceId: '',
  method: 'GET',
  url: '',
  headers: [],
  queryParams: [],
  body: '',
  bodyType: 'none',
  authorization: {},

  response: null,
  isExecuting: false,

  setRequest: (req) => set((state) => ({ ...state, ...req })),
  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
  
  addHeader: () => set((state) => ({ 
    headers: [...state.headers, { id: generateId(), key: '', value: '', enabled: true }] 
  })),
  updateHeader: (id, field, value) => set((state) => ({
    headers: state.headers.map(h => h.id === id ? { ...h, [field]: value } : h)
  })),
  removeHeader: (id) => set((state) => ({
    headers: state.headers.filter(h => h.id !== id)
  })),
  
  addQueryParam: () => set((state) => ({ 
    queryParams: [...state.queryParams, { id: generateId(), key: '', value: '', enabled: true }] 
  })),
  updateQueryParam: (id, field, value) => set((state) => ({
    queryParams: state.queryParams.map(p => p.id === id ? { ...p, [field]: value } : p)
  })),
  removeQueryParam: (id) => set((state) => ({
    queryParams: state.queryParams.filter(p => p.id !== id)
  })),

  setBody: (body) => set({ body }),
  setBodyType: (bodyType) => set({ bodyType }),

  executeRequest: async () => {
    const state = get()
    if (!state.url) return

    set({ isExecuting: true, response: null })

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: state.id,
          workspaceId: state.workspaceId,
          method: state.method,
          url: state.url,
          headers: state.headers,
          queryParams: state.queryParams,
          body: state.body,
          bodyType: state.bodyType
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
         set({ 
           response: { 
             status: res.status, 
             headers: {}, 
             body: data.error || 'Unknown Error', 
             time: 0, 
             size: 0,
             error: data.error
           },
           isExecuting: false
         })
         return
      }

      set({
        response: {
          status: data.status,
          headers: data.headers || {},
          body: data.body || '',
          time: data.time || 0,
          size: data.size || 0,
          error: data.error
        },
        isExecuting: false
      })

    } catch (err: any) {
      set({ 
        response: { 
          status: 0, 
          headers: {}, 
          body: err.message || 'Execution Failed', 
          time: 0, 
          size: 0,
          error: err.message
        },
        isExecuting: false
      })
    }
  }
}))
