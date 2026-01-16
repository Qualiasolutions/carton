const GHL_API_URL = 'https://services.leadconnectorhq.com'

export interface GHLContact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  tags: string[]
  customFields: Array<{ id: string; value: string }>
  dateAdded: string
}

export async function getContacts(locationId: string, tag?: string) {
  const params = new URLSearchParams({
    locationId,
    limit: '100'
  })

  if (tag) {
    params.append('query', tag)
  }

  const response = await fetch(`${GHL_API_URL}/contacts/?${params}`, {
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28'
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GHL API error: ${error}`)
  }

  const data = await response.json()
  return data.contacts as GHLContact[]
}

export async function getContact(contactId: string) {
  const response = await fetch(`${GHL_API_URL}/contacts/${contactId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Version': '2021-07-28'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get contact')
  }

  return response.json() as Promise<{ contact: GHLContact }>
}
