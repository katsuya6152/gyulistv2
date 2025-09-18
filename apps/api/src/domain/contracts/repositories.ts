// リポジトリ契約

import type { Cow } from "../entities/cow";
import type { Farm } from "../entities/farm";
import type { User } from "../entities/user";
import type { UserId } from "../types/auth";
import type { FarmId } from "../types/auth";
import type { AuthError, AuthenticationError, Result } from "../types/auth";
import type { Email } from "../value-objects/email";

// ユーザーリポジトリ契約
export interface UserRepository {
  save(user: User): Promise<Result<User, AuthenticationError>>;
  findById(id: UserId): Promise<Result<User | null, AuthenticationError>>;
  findByEmail(email: Email): Promise<Result<User | null, AuthenticationError>>;
  findByFarmId(farmId: FarmId): Promise<Result<User[], AuthenticationError>>;
  delete(id: UserId): Promise<Result<void, AuthenticationError>>;
  exists(email: Email): Promise<Result<boolean, AuthenticationError>>;
}

// 農場リポジトリ契約
export interface FarmRepository {
  save(farm: Farm): Promise<Result<Farm, AuthenticationError>>;
  findById(id: FarmId): Promise<Result<Farm | null, AuthenticationError>>;
  findByName(name: string): Promise<Result<Farm | null, AuthenticationError>>;
  delete(id: FarmId): Promise<Result<void, AuthenticationError>>;
  exists(name: string): Promise<Result<boolean, AuthenticationError>>;
}

// 母牛リポジトリ契約
export interface CowRepository {
  findById(id: string): Promise<Result<Cow | null, AuthError>>;
  findByFarmId(farmId: string): Promise<Result<Cow[], AuthError>>;
  save(cow: Cow): Promise<Result<Cow, AuthError>>;
  update(cow: Cow): Promise<Result<Cow, AuthError>>;
  delete(id: string): Promise<Result<void, AuthError>>;
}

// 認証リポジトリ契約（複合操作）
export interface AuthRepository {
  findUserByEmail(email: Email): Promise<Result<User | null, AuthenticationError>>;
  findUserWithFarm(
    userId: UserId
  ): Promise<Result<{ user: User; farm: Farm } | null, AuthenticationError>>;
  saveUserWithFarm(
    user: User,
    farm: Farm
  ): Promise<Result<{ user: User; farm: Farm }, AuthenticationError>>;
}
