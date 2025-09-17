// ユーザー登録ドメインサービス

import { type Farm, createFarm } from "../entities/farm";
import { type User, createUser } from "../entities/user";
import type { Result, UserRole } from "../types/auth";
import { AuthenticationError } from "../types/auth";
import { createEmail } from "../value-objects/email";
import type { Email } from "../value-objects/email";
import { createPassword } from "../value-objects/password";
import type { Password } from "../value-objects/password";
import type { DateTimeProvider } from "./date-time";
import type { IdGenerator } from "./id-generator";

// ユーザー登録サービス（純粋関数）
export interface UserRegistrationService {
  registerUser(
    email: string,
    password: string,
    farmName: string,
    role: UserRole
  ): Result<{ user: User; farm: Farm }, AuthenticationError>;

  // ビジネスルール: メールアドレス重複チェック
  validateEmailUniqueness(
    email: Email,
    existingUser: User | null
  ): Result<true, AuthenticationError>;

  // ビジネスルール: ユーザー登録の完全な検証
  validateRegistrationRequest(
    email: string,
    password: string,
    farmName: string,
    role: UserRole
  ): Result<
    { email: Email; password: Password; farmName: string; role: UserRole },
    AuthenticationError
  >;
}

// ヘルパー関数
const validateEmailUniqueness = (
  _email: Email,
  existingUser: User | null
): Result<true, AuthenticationError> => {
  if (existingUser) {
    return {
      success: false,
      error: new AuthenticationError("Email already exists", "INVALID_CREDENTIALS"),
    };
  }
  return { success: true, data: true };
};

const validateRegistrationRequest = (
  email: string,
  password: string,
  farmName: string,
  role: UserRole
): Result<
  { email: Email; password: Password; farmName: string; role: UserRole },
  AuthenticationError
> => {
  // メールアドレス検証
  const emailResult = createEmail(email);
  if (!emailResult.success) {
    return { success: false, error: emailResult.error };
  }

  // パスワード検証・ハッシュ化
  const passwordResult = createPassword(password);
  if (!passwordResult.success) {
    return { success: false, error: passwordResult.error };
  }

  // 農場名検証
  if (!farmName || farmName.trim().length === 0) {
    return {
      success: false,
      error: new AuthenticationError("Farm name is required", "INVALID_CREDENTIALS"),
    };
  }

  if (farmName.length > 200) {
    return {
      success: false,
      error: new AuthenticationError("Farm name is too long", "INVALID_CREDENTIALS"),
    };
  }

  return {
    success: true,
    data: {
      email: emailResult.data,
      password: passwordResult.data,
      farmName: farmName.trim(),
      role,
    },
  };
};

// ユーザー登録実装
export const createUserRegistrationService = (
  idGenerator: IdGenerator,
  dateTimeProvider: DateTimeProvider
): UserRegistrationService => ({
  registerUser: (
    email: string,
    password: string,
    farmName: string,
    role: UserRole = "farmer"
  ): Result<{ user: User; farm: Farm }, AuthenticationError> => {
    // 1. 登録リクエストの検証
    const validationResult = validateRegistrationRequest(email, password, farmName, role);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error };
    }

    const {
      email: validatedEmail,
      password: validatedPassword,
      farmName: validatedFarmName,
      role: validatedRole,
    } = validationResult.data;

    // 2. 農場作成
    const farmResult = createFarm(validatedFarmName, idGenerator, dateTimeProvider);
    if (!farmResult.success) {
      return { success: false, error: farmResult.error };
    }

    // 3. ユーザー作成
    const user = createUser(
      validatedEmail,
      validatedPassword,
      validatedRole,
      farmResult.data.id,
      idGenerator,
      dateTimeProvider
    );

    return {
      success: true,
      data: { user, farm: farmResult.data },
    };
  },

  validateEmailUniqueness,

  validateRegistrationRequest,
});
