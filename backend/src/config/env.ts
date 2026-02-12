import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().transform(Number),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET has to be at least 32 characters'),
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional()
})
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erro na validação das variáveis de ambiente:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      process.exit(1)
    }
    throw error
  }
}


export const env = validateEnv()
