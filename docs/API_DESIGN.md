# ギュウリスト API 設計ドキュメント

## 1. 概要

### 1.1 目的
和牛繁殖農家向けプロダクト「ギュウリスト」のAPIを、DDD（ドメイン駆動設計）+ 関数型ドメインモデリング + オニオンアーキテクチャで設計する。

### 1.2 アーキテクチャ原則
- **ドメイン駆動設計（DDD）**: ビジネスロジックをドメイン層に集約
- **関数型ドメインモデリング**: 不変性と純粋関数を重視したドメインモデル
- **オニオンアーキテクチャ**: 依存関係の逆転による保守性の向上

### 1.3 技術スタック
- **フレームワーク**: Hono
- **言語**: TypeScript
- **データベース**: PostgreSQL
- **ORM**: Drizzle ORM
- **バリデーション**: Zod

## 2. ドメイン分析

### 2.1 コアドメイン
和牛繁殖農家の繁殖記録管理システム

### 2.2 サブドメイン
- **個体管理**: 母牛・子牛の登録・管理
- **出荷管理**: 出荷記録の管理
- **認証・認可**: ユーザー認証とアクセス制御
- **ダッシュボード**: 総合的な経営状況の可視化
- **分析・レポート**: 繁殖成績の分析

## 3. エンティティとバリューオブジェクト

### 3.1 個体管理ドメイン

#### エンティティ
- **Cow（母牛）**
  - ID: CowId
  - 個体番号: IndividualNumber
  - 名前: Name
  - 生年月日: BirthDate
  - 農場ID: FarmId

- **Calf（子牛）**
  - ID: CalfId
  - 個体番号: IndividualNumber
  - 名号: CalfName
  - 血統情報: PedigreeInfo
    - 父牛: SirePedigree
    - 母の父: MaternalGrandsire
    - 母の祖父: MaternalGreatGrandsire
    - 母の母の祖父: MaternalGreatGreatGrandsire
  - 種付年月日: MatingDate
  - 出産予定日: ExpectedBirthDate
  - 生年月日: BirthDate
  - せり年月日: AuctionDate
  - 種付け間隔: MatingInterval
  - 体重: Weight
  - 日齢: AgeInDays
  - 性別: Gender
  - 価格: Price
  - 購買者: Buyer
  - 備考: Remarks
  - 母牛ID: CowId
  - 農場ID: FarmId

#### バリューオブジェクト
- **IndividualNumber**: 個体番号（不変）
- **Name**: 名前（不変）
- **CalfName**: 子牛名号（不変）
- **PedigreeInfo**: 血統情報（不変）
  - **SirePedigree**: 父牛血統（不変）
  - **MaternalGrandsire**: 母の父血統（不変）
  - **MaternalGreatGrandsire**: 母の祖父血統（不変）
  - **MaternalGreatGreatGrandsire**: 母の母の祖父血統（不変）
- **MatingDate**: 種付年月日（不変）
- **ExpectedBirthDate**: 出産予定日（不変）
- **BirthDate**: 生年月日（不変）
- **AuctionDate**: せり年月日（不変）
- **MatingInterval**: 種付け間隔（不変）
- **Weight**: 体重（不変）
- **AgeInDays**: 日齢（不変）
- **Gender**: 性別（不変）
- **Price**: 価格（不変）
- **Buyer**: 購買者（不変）
- **Remarks**: 備考（不変）
- **HealthStatus**: 健康状態（不変）

### 3.2 認証・認可ドメイン

#### エンティティ
- **User（ユーザー）**
  - ID: UserId
  - メールアドレス: Email
  - パスワードハッシュ: PasswordHash
  - ロール: Role
  - 農場ID: FarmId

- **Farm（農場）**
  - ID: FarmId
  - 農場名: FarmName
  - 住所: Address
  - 電話番号: PhoneNumber

#### バリューオブジェクト
- **Email**: メールアドレス（不変）
- **PasswordHash**: パスワードハッシュ（不変）
- **Role**: ロール（不変）
- **FarmName**: 農場名（不変）
- **Address**: 住所（不変）

## 4. オニオンアーキテクチャ

### 4.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│  (Hono Routes, Controllers, DTOs, Validation)          │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  (Use Cases, Application Services, Command/Query)       │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                      Domain Layer                       │
│  (Entities, Value Objects, Domain Services, Functions)  │
└─────────────────────────────────────────────────────────┘
                                ▲
                                │
┌─────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                  │
│  (Database, External APIs, File System)                 │
└─────────────────────────────────────────────────────────┘
```

### 4.2 依存関係の方向
- **外側のレイヤーは内側のレイヤーに依存**
- **内側のレイヤーは外側のレイヤーに依存しない**
- **Infrastructure層はDomain層のインターフェースを実装**
- **依存関係の逆転（Dependency Inversion Principle）を適用**

#### 正しい依存関係
- Presentation → Application → Domain
- Infrastructure → Domain（インターフェース経由）
- Application → Infrastructure（インターフェース経由）

### 4.3 依存関係の逆転の具体例

```typescript
// Domain層: インターフェースを定義
interface CowRepository {
  save(cow: Cow): Promise<Result<Cow, RepositoryError>>;
  findById(id: CowId): Promise<Result<Cow | null, RepositoryError>>;
  findAll(): Promise<Result<Cow[], RepositoryError>>;
}

// Application層: インターフェースに依存
class CreateCowUseCase {
  constructor(private cowRepository: CowRepository) {}
  
  async execute(input: CreateCowInput): Promise<Result<Cow, UseCaseError>> {
    // ビジネスロジック
  }
}

// Infrastructure層: インターフェースを実装
class DrizzleCowRepository implements CowRepository {
  constructor(private db: Database) {}
  
  async save(cow: Cow): Promise<Result<Cow, RepositoryError>> {
    // データベース実装
  }
}
```

この設計により：
- **Domain層**は外部の詳細（データベース、API等）に依存しない
- **Infrastructure層**はDomain層のインターフェースを実装
- **Application層**は抽象（インターフェース）に依存し、具象（実装）に依存しない

## 5.1 関数型ドメインモデリングの詳細設計

### 5.1.1 domainフォルダ内の各フォルダの役割

#### entities/ - エンティティ（集約ルート）
```typescript
// 集約ルートとしてのエンティティ
export interface Cow {
  readonly id: CowId;
  readonly individualNumber: IndividualNumber;
  readonly name: Name;
  readonly birthDate: BirthDate;
  readonly pedigreeId: PedigreeId;
  readonly healthStatus: HealthStatus;
  readonly farmId: FarmId;
}

export interface Calf {
  readonly id: CalfId;
  readonly individualNumber: IndividualNumber;
  readonly calfName: CalfName;
  readonly pedigreeInfo: PedigreeInfo;
  readonly matingDate: MatingDate;
  readonly expectedBirthDate: ExpectedBirthDate;
  readonly birthDate: BirthDate;
  readonly auctionDate: AuctionDate;
  readonly matingInterval: MatingInterval;
  readonly weight: Weight;
  readonly ageInDays: AgeInDays;
  readonly gender: Gender;
  readonly price: Price;
  readonly buyer: Buyer;
  readonly remarks: Remarks;
  readonly cowId: CowId;
  readonly pedigreeId: PedigreeId;
  readonly healthStatus: HealthStatus;
  readonly farmId: FarmId;
}

// エンティティの作成関数（純粋関数）
export const createCow = (
  individualNumber: IndividualNumber,
  name: Name,
  birthDate: BirthDate,
  pedigreeId: PedigreeId,
  farmId: FarmId
): Cow => ({
  id: generateCowId(),
  individualNumber,
  name,
  birthDate,
  pedigreeId,
  healthStatus: 'HEALTHY' as const,
  farmId
});

export const createCalf = (
  individualNumber: IndividualNumber,
  calfName: CalfName,
  pedigreeInfo: PedigreeInfo,
  matingDate: MatingDate,
  expectedBirthDate: ExpectedBirthDate,
  birthDate: BirthDate,
  auctionDate: AuctionDate,
  matingInterval: MatingInterval,
  weight: Weight,
  ageInDays: AgeInDays,
  gender: Gender,
  price: Price,
  buyer: Buyer,
  remarks: Remarks,
  cowId: CowId,
  pedigreeId: PedigreeId,
  farmId: FarmId
): Calf => ({
  id: generateCalfId(),
  individualNumber,
  calfName,
  pedigreeInfo,
  matingDate,
  expectedBirthDate,
  birthDate,
  auctionDate,
  matingInterval,
  weight,
  ageInDays,
  gender,
  price,
  buyer,
  remarks,
  cowId,
  pedigreeId,
  healthStatus: 'HEALTHY' as const,
  farmId
});
```

#### value-objects/ - バリューオブジェクト（不変データ）
```typescript
// 不変なバリューオブジェクト
export interface IndividualNumber {
  readonly value: string;
}

export interface CalfName {
  readonly value: string;
}

export interface PedigreeInfo {
  readonly sirePedigree: SirePedigree;
  readonly maternalGrandsire: MaternalGrandsire;
  readonly maternalGreatGrandsire: MaternalGreatGrandsire;
  readonly maternalGreatGreatGrandsire: MaternalGreatGreatGrandsire;
}

export interface MatingDate {
  readonly value: Date;
}

export interface ExpectedBirthDate {
  readonly value: Date;
}

export interface AuctionDate {
  readonly value: Date;
}

export interface MatingInterval {
  readonly value: number; // 日数
}

export interface Weight {
  readonly value: number; // kg
}

export interface AgeInDays {
  readonly value: number;
}

export interface Gender {
  readonly value: 'MALE' | 'FEMALE' | 'CASTRATED';
}

export interface Price {
  readonly value: number; // 円
}

export interface Buyer {
  readonly value: string;
}

export interface Remarks {
  readonly value: string;
}

export const createIndividualNumber = (value: string): Result<IndividualNumber, ValidationError> => {
  if (!value || value.length < 3) {
    return { success: false, error: 'Invalid individual number' };
  }
  return { success: true, data: { value } };
};

export const createCalfName = (value: string): Result<CalfName, ValidationError> => {
  if (!value || value.trim().length === 0) {
    return { success: false, error: 'Calf name is required' };
  }
  return { success: true, data: { value: value.trim() } };
};

export const createWeight = (value: number): Result<Weight, ValidationError> => {
  if (value <= 0) {
    return { success: false, error: 'Weight must be positive' };
  }
  return { success: true, data: { value } };
};

export const createAgeInDays = (value: number): Result<AgeInDays, ValidationError> => {
  if (value < 0) {
    return { success: false, error: 'Age in days must be non-negative' };
  }
  return { success: true, data: { value } };
};

export const createGender = (value: string): Result<Gender, ValidationError> => {
  if (value !== 'MALE' && value !== 'FEMALE' && value !== 'CASTRATED') {
    return { success: false, error: 'Gender must be MALE, FEMALE, or CASTRATED' };
  }
  return { success: true, data: { value: value as 'MALE' | 'FEMALE' | 'CASTRATED' } };
};

export const createPrice = (value: number): Result<Price, ValidationError> => {
  if (value < 0) {
    return { success: false, error: 'Price must be non-negative' };
  }
  return { success: true, data: { value } };
};

// バリューオブジェクトの比較関数
export const equals = (a: IndividualNumber, b: IndividualNumber): boolean => 
  a.value === b.value;
```

#### services/ - ドメインサービス（純粋関数）
```typescript
// 血統係数計算サービス
export const calculateInbreedingCoefficient = (
  sirePedigree: Pedigree,
  damPedigree: Pedigree
): InbreedingCoefficient => {
  // 純粋関数として血統係数を計算
  const coefficient = computeCoefficient(sirePedigree, damPedigree);
  return { value: coefficient };
};

// 繁殖適性判定サービス
export const assessBreedingEligibility = (
  cow: Cow,
  bull: Bull
): BreedingEligibility => {
  // 純粋関数として繁殖適性を判定
  const age = calculateAge(cow.birthDate);
  const healthScore = assessHealth(cow.healthStatus);
  
  return {
    isEligible: age >= 18 && healthScore >= 80,
    reason: age < 18 ? 'Too young' : healthScore < 80 ? 'Poor health' : 'Eligible'
  };
};
```

#### functions/ - ドメイン関数（ビジネスロジック）
```typescript
// 繁殖記録作成関数
export const createBreedingRecord = (
  cowId: CowId,
  bullId: BullId,
  matingDate: MatingDate
): BreedingRecord => ({
  id: generateBreedingRecordId(),
  cowId,
  bullId,
  matingDate,
  status: 'MATING' as const,
  createdAt: new Date()
});

// 妊娠確認関数
export const confirmPregnancy = (
  record: BreedingRecord,
  confirmationDate: PregnancyConfirmationDate
): BreedingRecord => ({
  ...record,
  pregnancyConfirmationDate: confirmationDate,
  status: 'PREGNANT' as const,
  updatedAt: new Date()
});

// 出荷記録作成関数
export const createShipment = (
  individualId: IndividualId,
  shipmentDate: ShipmentDate,
  destination: Destination,
  weight: Weight,
  price: Price
): Shipment => ({
  id: generateShipmentId(),
  individualId,
  shipmentDate,
  destination,
  weight,
  price,
  createdAt: new Date()
});
```

#### types/ - ドメイン型（型定義）
```typescript
// ドメイン型の定義
export type CowId = string & { readonly __brand: 'CowId' };
export type CalfId = string & { readonly __brand: 'CalfId' };
export type ShipmentId = string & { readonly __brand: 'ShipmentId' };
export type AuctionId = string & { readonly __brand: 'AuctionId' };
export type EventId = string & { readonly __brand: 'EventId' };

// ドメインの状態型
export type HealthStatus = 'HEALTHY' | 'SICK' | 'RECOVERING' | 'QUARANTINE';
export type ShipmentType = 'BEEF' | 'BREEDING' | 'DAIRY';
export type EventType = 'MATING' | 'BIRTH' | 'SHIPMENT' | 'AUCTION' | 'HEALTH_CHECK';

// 結果型（Either型）
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

#### events/ - ドメインイベント
```typescript
// ドメインイベントの定義
export interface DomainEvent {
  readonly id: string;
  readonly occurredAt: Date;
  readonly eventType: string;
}

export interface CowBirthEvent extends DomainEvent {
  readonly eventType: 'CowBirth';
  readonly calfId: CalfId;
  readonly cowId: CowId;
  readonly birthDate: BirthDate;
}

export interface ShipmentEvent extends DomainEvent {
  readonly eventType: 'Shipment';
  readonly shipmentId: ShipmentId;
  readonly individualId: IndividualId;
  readonly destination: Destination;
  readonly price: Price;
}

// イベント作成関数
export const createCowBirthEvent = (
  calfId: CalfId,
  cowId: CowId,
  birthDate: BirthDate
): CowBirthEvent => ({
  id: generateEventId(),
  occurredAt: new Date(),
  eventType: 'CowBirth',
  calfId,
  cowId,
  birthDate
});
```

#### errors/ - ドメインエラー
```typescript
// ドメインエラーの定義
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BUSINESS_RULE_ERROR', context);
  }
}

// エラー作成関数
export const createValidationError = (field: string, message: string): ValidationError =>
  new ValidationError(`${field}: ${message}`, { field });

export const createBusinessRuleError = (rule: string, context: Record<string, unknown>): BusinessRuleError =>
  new BusinessRuleError(`Business rule violation: ${rule}`, context);
```

#### contracts/ - ドメイン契約（インターフェース）
```typescript
// リポジトリ契約
export interface CowRepository {
  save(cow: Cow): Promise<Result<Cow, RepositoryError>>;
  findById(id: CowId): Promise<Result<Cow | null, RepositoryError>>;
  findByFarmId(farmId: FarmId): Promise<Result<Cow[], RepositoryError>>;
  delete(id: CowId): Promise<Result<void, RepositoryError>>;
}

export interface ShipmentRepository {
  save(shipment: Shipment): Promise<Result<Shipment, RepositoryError>>;
  findByFarmId(farmId: FarmId): Promise<Result<Shipment[], RepositoryError>>;
  findByYear(farmId: FarmId, year: number): Promise<Result<Shipment[], RepositoryError>>;
}

// ドメインサービス契約
export interface PedigreeService {
  calculateInbreedingCoefficient(sire: Pedigree, dam: Pedigree): InbreedingCoefficient;
  validatePedigree(pedigree: Pedigree): Result<Pedigree, ValidationError>;
}

export interface BreedingService {
  assessBreedingEligibility(cow: Cow, bull: Bull): BreedingEligibility;
  calculateExpectedDeliveryDate(matingDate: MatingDate): ExpectedDeliveryDate;
}
```

### 5.1.2 関数型ドメインモデリングの原則

#### 1. 不変性（Immutability）
- すべてのデータ構造は不変
- 変更は新しいオブジェクトの作成
- 副作用の排除

#### 2. 純粋関数（Pure Functions）
- 同じ入力に対して常に同じ出力
- 副作用を持たない
- テストしやすい

#### 3. 関数の合成（Function Composition）
- 小さな関数を組み合わせて複雑な処理を構築
- パイプライン処理
- 再利用性の向上

#### 4. 型安全性（Type Safety）
- 厳密な型定義
- コンパイル時エラー検出
- 実行時エラーの削減

#### 5. エラーハンドリング（Error Handling）
- 明示的なエラー処理
- Result型による成功/失敗の表現
- エラーの伝播制御

## 5. 関数型ドメインモデリング

### 5.1 純粋関数の設計原則
- **不変性**: データの変更は新しいオブジェクトの作成
- **副作用の分離**: ビジネスロジックと副作用を分離
- **関数の合成**: 小さな関数を組み合わせて複雑な処理を構築

### 5.2 ドメイン関数の例

```typescript
// 純粋関数: 繁殖記録の作成
const createBreedingRecord = (
  cowId: CowId,
  bullId: BullId,
  matingDate: MatingDate
): BreedingRecord => ({
  id: generateBreedingRecordId(),
  cowId,
  bullId,
  matingDate,
  status: 'MATING' as const
});

// 純粋関数: 妊娠確認の更新
const confirmPregnancy = (
  record: BreedingRecord,
  confirmationDate: PregnancyConfirmationDate
): BreedingRecord => ({
  ...record,
  pregnancyConfirmationDate: confirmationDate,
  status: 'PREGNANT' as const
});

// 純粋関数: 血統係数の計算
const calculateInbreedingCoefficient = (
  sire: PedigreeInfo,
  dam: PedigreeInfo
): InbreedingCoefficient => {
  // 血統係数の計算ロジック
  return calculateCoefficient(sire, dam);
};
```

### 5.3 エラーハンドリング
- **Result型**: 成功と失敗を明示的に表現
- **Either型**: 左側にエラー、右側に成功値を配置

```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

const createCow = (input: CreateCowInput): Result<Cow, ValidationError> => {
  const validation = validateCowInput(input);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }
  
  const cow = buildCow(input);
  return { success: true, data: cow };
};
```

## 6. ディレクトリ構造

```
apps/api/src/
├── presentation/           # プレゼンテーション層
│   ├── routes/            # ルート定義
│   │   ├── cows.ts
│   │   ├── bulls.ts
│   │   ├── breeding.ts
│   │   └── pedigree.ts
│   ├── controllers/       # コントローラー
│   ├── dto/              # データ転送オブジェクト
│   └── middleware/       # ミドルウェア
├── application/           # アプリケーション層
│   ├── use-cases/        # ユースケース
│   │   ├── cow/
│   │   ├── calf/
│   │   ├── pedigree/
│   │   ├── shipment/
│   │   ├── auction/
│   │   ├── event/
│   │   ├── auth/
│   │   └── dashboard/
│   ├── services/         # アプリケーションサービス
│   └── commands/         # コマンド・クエリ
├── domain/               # ドメイン層
│   ├── entities/         # エンティティ（集約ルート）
│   ├── value-objects/    # バリューオブジェクト（不変データ）
│   ├── services/         # ドメインサービス（純粋関数）
│   ├── functions/        # ドメイン関数（ビジネスロジック）
│   ├── types/           # ドメイン型（型定義）
│   ├── events/          # ドメインイベント
│   ├── errors/          # ドメインエラー
│   └── contracts/       # ドメイン契約（インターフェース）
├── infrastructure/       # インフラストラクチャ層
│   ├── database/        # データベース関連
│   ├── repositories/    # リポジトリ実装
│   └── external/        # 外部サービス
└── shared/              # 共有ユーティリティ
    ├── types/           # 共通型
    ├── utils/           # ユーティリティ関数
    └── errors/          # エラー定義
```

## 7. API エンドポイント設計

### 7.1 個体管理 API

#### 母牛管理
```
GET    /api/v1/cows              # 母牛一覧取得
GET    /api/v1/cows/:id          # 母牛詳細取得
POST   /api/v1/cows              # 母牛登録
PUT    /api/v1/cows/:id          # 母牛更新
DELETE /api/v1/cows/:id          # 母牛削除
```

#### 子牛管理
```
GET    /api/v1/calves            # 子牛一覧取得
GET    /api/v1/calves/:id        # 子牛詳細取得
POST   /api/v1/calves            # 子牛登録
PUT    /api/v1/calves/:id        # 子牛更新
DELETE /api/v1/calves/:id        # 子牛削除
GET    /api/v1/calves/by-cow/:cowId  # 母牛別子牛一覧
```

### 7.2 血統管理 API

#### 血統マスタ管理
```
GET    /api/v1/pedigree-masters              # 血統マスタ一覧取得
GET    /api/v1/pedigree-masters/:id          # 血統マスタ詳細取得
POST   /api/v1/pedigree-masters              # 血統マスタ登録
PUT    /api/v1/pedigree-masters/:id          # 血統マスタ更新
DELETE /api/v1/pedigree-masters/:id          # 血統マスタ削除
```

#### 系統マスタ管理
```
GET    /api/v1/lineage-masters               # 系統マスタ一覧取得
GET    /api/v1/lineage-masters/:id           # 系統マスタ詳細取得
POST   /api/v1/lineage-masters               # 系統マスタ登録
PUT    /api/v1/lineage-masters/:id           # 系統マスタ更新
DELETE /api/v1/lineage-masters/:id           # 系統マスタ削除
```

#### 血統情報管理
```
GET    /api/v1/pedigrees/:id                 # 血統情報取得
POST   /api/v1/pedigrees                     # 血統情報登録
PUT    /api/v1/pedigrees/:id                 # 血統情報更新
GET    /api/v1/pedigrees/:id/inbreeding-coefficient  # 血統係数取得
```

### 7.3 出荷管理 API

```
GET    /api/v1/shipments                      # 出荷記録一覧取得
GET    /api/v1/shipments/:id                  # 出荷記録詳細取得
POST   /api/v1/shipments                      # 出荷記録登録
PUT    /api/v1/shipments/:id                  # 出荷記録更新
DELETE /api/v1/shipments/:id                  # 出荷記録削除
GET    /api/v1/shipments/yearly/:year         # 年毎出荷サマリー取得
GET    /api/v1/shipments/by-cow/:cowId        # 母牛毎出荷記録取得
```

### 7.4 せり管理 API

#### せり自体管理
```
GET    /api/v1/auctions                       # せり一覧取得
GET    /api/v1/auctions/:id                   # せり詳細取得
POST   /api/v1/auctions                       # せり登録
PUT    /api/v1/auctions/:id                   # せり更新
DELETE /api/v1/auctions/:id                   # せり削除
```

#### 牛のせり結果管理
```
GET    /api/v1/auction-results                # せり結果一覧取得
GET    /api/v1/auction-results/:id            # せり結果詳細取得
POST   /api/v1/auction-results                # せり結果登録
PUT    /api/v1/auction-results/:id            # せり結果更新
DELETE /api/v1/auction-results/:id            # せり結果削除
GET    /api/v1/auction-results/by-auction/:auctionId  # せり別結果取得
```

### 7.5 イベント管理 API

```
GET    /api/v1/events                         # イベント一覧取得
GET    /api/v1/events/:id                     # イベント詳細取得
POST   /api/v1/events                         # イベント登録
PUT    /api/v1/events/:id                     # イベント更新
DELETE /api/v1/events/:id                     # イベント削除
GET    /api/v1/events/by-individual/:id       # 個体別イベント取得
GET    /api/v1/events/by-type/:type           # 種別別イベント取得
```

### 7.6 認証・認可 API

```
POST   /api/v1/auth/login                     # ログイン
POST   /api/v1/auth/logout                    # ログアウト
POST   /api/v1/auth/refresh                   # トークンリフレッシュ
GET    /api/v1/auth/me                        # 現在のユーザー情報取得
POST   /api/v1/auth/register                  # ユーザー登録
PUT    /api/v1/auth/profile                   # プロフィール更新
```

### 7.7 ダッシュボード API

```
GET    /api/v1/dashboard/overview             # ダッシュボード概要
GET    /api/v1/dashboard/breeding-stats       # 繁殖統計
GET    /api/v1/dashboard/shipment-stats       # 出荷統計
GET    /api/v1/dashboard/revenue-trends       # 売上推移
GET    /api/v1/dashboard/health-alerts        # 健康アラート
```

### 7.8 分析・レポート API

```
GET    /api/v1/reports/breeding-performance    # 繁殖成績レポート
GET    /api/v1/reports/health-status          # 健康状態レポート
GET    /api/v1/reports/pedigree-analysis      # 血統分析レポート
GET    /api/v1/reports/shipment-analysis      # 出荷分析レポート
GET    /api/v1/reports/auction-analysis       # せり分析レポート
```

## 8. データベース設計

### 8.1 テーブル設計

#### cows テーブル
```sql
CREATE TABLE cows (
  id UUID PRIMARY KEY,
  individual_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  pedigree_id UUID,
  health_status VARCHAR(20) NOT NULL,
  farm_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### calves テーブル
```sql
CREATE TABLE calves (
  id UUID PRIMARY KEY,
  individual_number VARCHAR(20) UNIQUE NOT NULL,
  calf_name VARCHAR(100) NOT NULL, -- 名号
  -- 血統情報
  sire_pedigree VARCHAR(200), -- 父牛血統
  maternal_grandsire VARCHAR(200), -- 母の父血統
  maternal_great_grandsire VARCHAR(200), -- 母の祖父血統
  maternal_great_great_grandsire VARCHAR(200), -- 母の母の祖父血統
  -- 繁殖・出産情報
  mating_date DATE, -- 種付年月日
  expected_birth_date DATE, -- 出産予定日
  birth_date DATE NOT NULL,
  auction_date DATE, -- せり年月日
  mating_interval INTEGER, -- 種付け間隔（日数）
  -- 個体情報
  weight DECIMAL(8,2), -- 体重（kg）
  age_in_days INTEGER, -- 日齢
  gender VARCHAR(10) NOT NULL, -- 性別（MALE/FEMALE/CASTRATED）
  -- 取引情報
  price DECIMAL(12,2), -- 価格（円）
  buyer VARCHAR(200), -- 購買者
  remarks TEXT, -- 備考
  -- その他
  cow_id UUID NOT NULL,
  pedigree_id UUID,
  health_status VARCHAR(20) NOT NULL,
  farm_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### users テーブル
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'farmer',
  farm_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### farms テーブル
```sql
CREATE TABLE farms (
  id UUID PRIMARY KEY,
  farm_name VARCHAR(200) NOT NULL,
  address TEXT,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 9. 実装ガイドライン

### 9.1 コーディング規約
- **関数型プログラミング**: 純粋関数を優先
- **不変性**: データの変更は新しいオブジェクトの作成
- **型安全性**: 厳密な型定義とバリデーション
- **エラーハンドリング**: Result型による明示的なエラー処理

### 9.2 テスト戦略
- **単体テスト**: ドメイン関数のテスト
- **統合テスト**: ユースケースのテスト
- **E2Eテスト**: APIエンドポイントのテスト

### 9.3 パフォーマンス考慮事項
- **データベースクエリ**: N+1問題の回避
- **キャッシュ**: 頻繁にアクセスされるデータのキャッシュ
- **非同期処理**: 重い処理の非同期化

## 10. セキュリティ設計

### 10.1 認証・認可
- **JWT**: トークンベースの認証
- **RBAC**: ロールベースのアクセス制御
- **API Key**: 外部システム連携用

### 10.2 データ保護
- **暗号化**: 機密データの暗号化
- **バリデーション**: 入力データの厳密な検証
- **SQLインジェクション対策**: パラメータ化クエリの使用

## 11. 監視・ログ設計

### 11.1 ログ設計
- **構造化ログ**: JSON形式のログ出力
- **ログレベル**: ERROR, WARN, INFO, DEBUG
- **トレーシング**: リクエストの追跡

### 11.2 メトリクス
- **API レスポンス時間**: パフォーマンス監視
- **エラー率**: システムの健全性監視
- **スループット**: 処理能力の監視

## 12. 今後の拡張性

### 12.1 マイクロサービス化
- ドメインごとのサービス分割
- イベント駆動アーキテクチャの導入

### 12.2 外部連携
- 畜産関連システムとの連携
- 政府統計システムとの連携

---

この設計ドキュメントは、ギュウリストのAPI開発における指針として使用し、開発の進行に応じて更新していきます。
