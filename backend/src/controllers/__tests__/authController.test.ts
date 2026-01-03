import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../server.js'

describe('Auth Controller - Register', () => {
    it('should create a new user', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                name: 'Test User',
                email: `test${Date.now()}@test.com`,
                password: '123456',
                role: 'OPERATOR'
            })
            .expect(201)
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('email')
        expect(response.body).not.toHaveProperty('password')
    })
})