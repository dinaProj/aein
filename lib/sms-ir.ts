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
    response = await fetch('https://api.sms.ir/v1/send/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(payload),
    })
  } catch (fetchError) {
    console.error('[SMS.ir] Fetch error (network/connectivity issue):', {
      message: fetchError instanceof Error ? fetchError.message : String(fetchError),
      url: 'https://api.sms.ir/v1/send/verify',
    })
    throw new Error(
      `Unable to connect to SMS.ir service: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`
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
