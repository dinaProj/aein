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

  const response = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      mobile: phone,
      templateId: Number(templateId),
      parameters: [
        {
          name: 'PHONE',
          value: phone,
        },
        {
          name: codeParameterName,
          value: code,
        },
        {
          name: 'TIME',
          value: now,
        },
      ],
    }),
  })

  const data = (await response.json()) as SmsIrVerifyResponse

  if (!response.ok || data.status !== 1) {
    throw new Error(data.message || 'SMS.ir verification send failed')
  }

  return data
}
