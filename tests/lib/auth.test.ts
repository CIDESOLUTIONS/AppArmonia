import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth'

describe('Auth utilities', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })
  })

  describe('comparePassword', () => {
    it('should validate correct password', async () => {
      const password = 'testpassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await comparePassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await comparePassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = { userId: '123', email: 'test@example.com' }
      const token = generateToken(payload)
      
      const verified = verifyToken(token)
      expect(verified).toBeTruthy()
      expect(verified.userId).toBe(payload.userId)
      expect(verified.email).toBe(payload.email)
    })

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here'
      
      const verified = verifyToken(invalidToken)
      expect(verified).toBeNull()
    })
  })
})