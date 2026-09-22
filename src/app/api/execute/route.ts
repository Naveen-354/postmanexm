import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Maximum response size we're willing to proxy (e.g. 5MB)
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { method, url, headers, queryParams, body: requestBody, bodyType } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Build the final URL with query params
    let finalUrl = url
    try {
      const urlObj = new URL(url)
      if (queryParams && Array.isArray(queryParams)) {
        queryParams.forEach((param: any) => {
          if (param.key && param.enabled) {
            urlObj.searchParams.append(param.key, param.value)
          }
        })
      }
      finalUrl = urlObj.toString()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Protection: Disallow local networks/SSRF here if needed
    // (In a full prod app, we'd block localhost, 169.254.x.x, 10.x.x.x, etc.)

    // Build headers
    const fetchHeaders = new Headers()
    if (headers && Array.isArray(headers)) {
      headers.forEach((h: any) => {
        if (h.key && h.enabled) {
          fetchHeaders.append(h.key, h.value)
        }
      })
    }

    // Auto content-type for JSON if not explicitly set
    if (bodyType === 'json' && !fetchHeaders.has('Content-Type')) {
      fetchHeaders.set('Content-Type', 'application/json')
    }

    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: fetchHeaders,
    }

    if (method !== 'GET' && method !== 'HEAD' && requestBody) {
      fetchOptions.body = requestBody
    }

    const startTime = performance.now()
    let response: Response
    let timeoutId: NodeJS.Timeout | undefined

    try {
      const controller = new AbortController()
      timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
      fetchOptions.signal = controller.signal

      response = await fetch(finalUrl, fetchOptions)
    } catch (error: any) {
      clearTimeout(timeoutId)
      return NextResponse.json({
        error: error.name === 'AbortError' ? 'Request Timeout (30s)' : `Network Error: ${error.message}`,
        status: 0,
        time: Math.round(performance.now() - startTime),
      })
    }
    
    clearTimeout(timeoutId)
    const endTime = performance.now()
    const time = Math.round(endTime - startTime)

    // Extract headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Safely parse body
    const contentType = response.headers.get('content-type') || ''
    
    // Check size limit from content-length if available
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      return NextResponse.json({
        status: response.status,
        headers: responseHeaders,
        body: `Response too large (exceeds ${MAX_RESPONSE_SIZE / 1024 / 1024}MB limit).`,
        time,
        size: parseInt(contentLength, 10),
      })
    }

    // Read the body buffer
    const arrayBuffer = await response.arrayBuffer()
    const size = arrayBuffer.byteLength

    if (size > MAX_RESPONSE_SIZE) {
       return NextResponse.json({
        status: response.status,
        headers: responseHeaders,
        body: `Response too large (${Math.round(size / 1024)}KB). Trucated for safety.`,
        time,
        size,
      })
    }

    let responseData = ''
    try {
      // Decode as UTF-8 string. (If it's an image, this will be mangled, but we return raw string for now)
      const decoder = new TextDecoder('utf-8')
      responseData = decoder.decode(arrayBuffer)
    } catch (e) {
      responseData = '[Binary Data]'
    }

    // Save to history (if we have a request_id passed in the payload)
    const { requestId, workspaceId } = body
    if (requestId && workspaceId) {
      // Async fire-and-forget so we don't delay the API response
      supabase.from('history').insert({
        request_id: requestId,
        workspace_id: workspaceId,
        url: finalUrl,
        method: fetchOptions.method,
        status: response.status,
        time_ms: time,
        response_size: size,
        response_body: responseData.slice(0, 10000) // only store up to 10kb of history body to save space
      }).then(({ error }) => {
        if (error) console.error("Failed to save history:", error)
      })
    }

    return NextResponse.json({
      status: response.status,
      headers: responseHeaders,
      body: responseData,
      time,
      size,
    })

  } catch (error: any) {
    console.error('Execute Request Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

