// 登録機能テストスクリプト

import { RegisterUseCase } from './application/use-cases/auth/login';
import { DrizzleAuthRepository } from './infrastructure/repositories/drizzle-auth-repository';

async function testRegister() {
  try {
    console.log('Testing registration...');
    
    const authRepository = new DrizzleAuthRepository();
    const registerUseCase = new RegisterUseCase(authRepository);
    
    const result = await registerUseCase.execute({
      email: 'test2@example.com',
      password: 'password123',
      farmName: 'テスト農場2',
      role: 'farmer'
    });
    
    console.log('Registration result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRegister();
