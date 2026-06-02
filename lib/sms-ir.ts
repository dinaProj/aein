interface SmsIrVerifyResponse {
  status: number
  message: string
  data?: {
    messageId: number
    cost: number
  }
}

export async function sendSmsIrVerifyCode(phone: string, code: string) {
  const apiKey = process.env.SMSIR_API_KEY
  const templateId = process.env.SMSIR_TEMPLATE_ID
  const codeParameterName = process.env.SMSIR_CODE_PARAMETER || 'CODE'
  const now = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())

  if (!apiKey || !templateId) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`SMS.ir dev verification code for ${phone}: ${code}`)
      return { skipped: true }
    }

    throw new Error('SMS.ir configuration is missing')
  }

  const payload = {
    mobile: phone,
    templateId: Number(templateId),
    parameters: [
      { name: 'PHONE', value: phone },
      { name: codeParameterName, value: code },
      { name: 'TIME', value: now },
    ],
  }

  console.log('[SMS.ir] Sending verification code', {
    phone,
    templateId,
    timestamp: new Date().toISOString(),
  })

  let response: Response | null = null
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      response = await fetch('https://api.sms.ir/v1/send/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-KEY': apiKey,
          'User-Agent': 'Mozilla/5.0 (Node.js)',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (timeoutOrFetchError) {
      clearTimeout(timeoutId)
      throw timeoutOrFetchError
    }
  } catch (fetchError) {
    const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError)
    const isTimeout = errorMsg.includes('abort') || errorMsg.includes('timeout')
    
    console.error('[SMS.ir] Fetch error (network/connectivity issue):', {
      message: errorMsg,
      isTimeout,
      url: 'https://api.sms.ir/v1/send/verify',
      nodeEnv: process.env.NODE_ENV,
    })
    
    // FALLBACK: If in production and SMS.ir fails, log the code for manual verification
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[SMS.ir FALLBACK] Verification code for ${phone}: ${code}`)
      console.warn('[SMS.ir FALLBACK] Unable to send SMS, code logged for manual verification')
      return { fallback: true, message: 'SMS service temporarily unavailable' }
    }
    
    if (isTimeout) {
      throw new Error(`SMS.ir request timeout (15s): Service not responding quickly`)
    }
    throw new Error(
      `Unable to connect to SMS.ir service: ${errorMsg}`
    )
  }

  let text = ''
  try {
    text = await response.text()
  } catch (readError) {
    console.error('[SMS.ir] Error reading response:', readError)
    throw new Error('Failed to read SMS.ir response')
  }

  let data: SmsIrVerifyResponse | null = null
  try {
    data = JSON.parse(text) as SmsIrVerifyResponse
  } catch (parseError) {
    console.error('[SMS.ir] Response not JSON:', { text, status: response.status })
    throw new Error(`SMS.ir returned invalid response: ${text.substring(0, 100)}`)
  }

  if (!response.ok) {
    console.error('[SMS.ir] HTTP error:', { status: response.status, message: data?.message })
    throw new Error((data && data.message) || `SMS.ir HTTP ${response.status}`)
  }

  if (!data || data.status !== 1) {
    console.error('[SMS.ir] API error:', data)
    throw new Error((data && data.message) || 'SMS.ir verification send failed')
  }

  console.log('[SMS.ir] Verification code sent successfully', { phone, messageId: data.data?.messageId })
  return data
}
