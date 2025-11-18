import { POST } from '@/app/api/orders/route'

describe('POST /api/orders', () => {
  it('creates an order successfully', async () => {
    const mockRequest = {
      json: async () => ({
        accountName: 'Harley',
        accountNumber: '1234567890',
        phone: '9876543210',
        address: 'West Bengal',
        pin: '713301',
        paymentMethod: 'UPI',
        payment: 1000,
        products: [{ id: 'p1', name: 'Test Product', price: 1000, quantity: 1, imageUrl: 'https://picsum.photos/200' }],
      }),
    } as Request

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.accountName).toBe('Harley')
    expect(data.products.length).toBe(1)
  })
})
