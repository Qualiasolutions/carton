const VAPI_API_URL = 'https://api.vapi.ai'

export interface CreateCallParams {
  assistantId: string
  phoneNumberId: string
  customerNumber: string
  assistantOverrides?: {
    variableValues?: Record<string, string>
  }
}

export async function createOutboundCall(params: CreateCallParams) {
  const response = await fetch(`${VAPI_API_URL}/call`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: params.assistantId,
      phoneNumberId: params.phoneNumberId,
      customer: {
        number: params.customerNumber
      },
      assistantOverrides: params.assistantOverrides
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`VAPI call failed: ${error}`)
  }

  return response.json()
}

export async function getCall(callId: string) {
  const response = await fetch(`${VAPI_API_URL}/call/${callId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get call')
  }

  return response.json()
}
