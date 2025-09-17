// リポジトリ契約

import { User } from '../entities/user';
import { UserId } from '../types/auth';
import { Farm } from '../entities/farm';
import { FarmId } from '../types/auth';
import { Email } from '../value-objects/email';
import { Result, AuthenticationError } from '../types/auth';

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

// 認証リポジトリ契約（複合操作）
export interface AuthRepository {
  findUserByEmail(email: Email): Promise<Result<User | null, AuthenticationError>>;
  findUserWithFarm(userId: UserId): Promise<Result<{ user: User; farm: Farm } | null, AuthenticationError>>;
  saveUserWithFarm(user: User, farm: Farm): Promise<Result<{ user: User; farm: Farm }, AuthenticationError>>;
}
