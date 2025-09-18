# ギュウリスト 実装方針ドキュメント

## 1. 概要

### 1.1 目的
ギュウリストのAPIとWebアプリケーションの実装方針、アーキテクチャパターン、コーディング規約を定義する。

### 1.2 技術スタック
- **API**: Hono + TypeScript + PostgreSQL + Drizzle ORM
- **Web**: Next.js + TypeScript + Tailwind CSS + shadcn/ui
- **共通**: Zod（バリデーション）、Vitest（テスト）、Conform（フォーム管理）

## 2. API実装方針

### 2.1 アーキテクチャパターン

#### 2.1.1 オニオンアーキテクチャ + 関数型ドメインモデリング
```
apps/api/src/
├── presentation/           # プレゼンテーション層
│   ├── routes/            # ルート定義
│   ├── controllers/       # コントローラー
│   ├── dto/              # データ転送オブジェクト
│   └── middleware/       # ミドルウェア
├── application/           # アプリケーション層
│   ├── use-cases/        # ユースケース
│   ├── services/         # アプリケーションサービス
│   └── commands/         # コマンド・クエリ
├── domain/               # ドメイン層
│   ├── entities/         # エンティティ
│   ├── value-objects/    # バリューオブジェクト
│   ├── services/         # ドメインサービス
│   ├── functions/        # ドメイン関数
│   ├── types/           # ドメイン型
│   ├── events/          # ドメインイベント
│   ├── errors/          # ドメインエラー
│   └── contracts/       # ドメイン契約
├── infrastructure/       # インフラストラクチャ層
│   ├── database/        # データベース関連
│   ├── repositories/    # リポジトリ実装
│   └── external/        # 外部サービス
└── shared/              # 共有ユーティリティ
    ├── types/           # 共通型
    ├── utils/           # ユーティリティ関数
    └── errors/          # エラー定義
```

#### 2.1.2 依存関係の方向
- **外側のレイヤーは内側のレイヤーに依存**
- **内側のレイヤーは外側のレイヤーに依存しない**
- **Infrastructure層はDomain層のインターフェースを実装**

### 2.2 コーディング規約

#### 2.2.1 関数型プログラミング原則
```typescript
// ✅ 良い例: 純粋関数
export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age;
};

// ❌ 悪い例: 副作用のある関数
export const calculateAge = (birthDate: Date): number => {
  console.log('Calculating age...'); // 副作用
  const today = new Date();
  return today.getFullYear() - birthDate.getFullYear();
};
```

#### 2.2.2 不変性の確保
```typescript
// ✅ 良い例: 不変データの作成
export const createCow = (input: CreateCowInput): Cow => ({
  id: generateCowId(),
  individualNumber: input.individualNumber,
  name: input.name,
  birthDate: input.birthDate,
  healthStatus: 'HEALTHY' as const,
  farmId: input.farmId
});

// ❌ 悪い例: 可変データの変更
export const updateCow = (cow: Cow, updates: Partial<Cow>): Cow => {
  Object.assign(cow, updates); // 元のオブジェクトを変更
  return cow;
};
```

#### 2.2.3 エラーハンドリング
```typescript
// Result型による明示的なエラー処理
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const createIndividualNumber = (value: string): Result<IndividualNumber, ValidationError> => {
  if (!value || value.length < 3) {
    return { success: false, error: new ValidationError('Invalid individual number') };
  }
  return { success: true, data: { value } };
};
```

### 2.3 実装パターン

#### 2.3.1 ルート定義（Hono）
```typescript
// apps/api/src/presentation/routes/calves.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getCalfShipmentsUseCase } from '../../application/use-cases/calf/get-calf-shipments';
import { updateCalfShipmentUseCase } from '../../application/use-cases/calf/update-calf-shipment';

const calvesRouter = new Hono();

// 子牛出荷一覧取得
calvesRouter.get(
  '/shipments',
  zValidator('query', getCalfShipmentsSchema),
  async (c) => {
    const query = c.req.valid('query');
    const result = await getCalfShipmentsUseCase.execute(query);
    
    if (!result.success) {
      return c.json({ error: result.error.message }, 400);
    }
    
    return c.json({ success: true, data: result.data });
  }
);

// 子牛出荷情報更新
calvesRouter.put(
  '/:id/shipment',
  zValidator('json', updateCalfShipmentSchema),
  async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    const result = await updateCalfShipmentUseCase.execute({ id, ...body });
    
    if (!result.success) {
      return c.json({ error: result.error.message }, 400);
    }
    
    return c.json({ success: true, data: result.data });
  }
);

export { calvesRouter };
```

#### 2.3.2 ユースケース実装
```typescript
// apps/api/src/application/use-cases/calf/get-calf-shipments.ts
import { CalfRepository } from '../../../domain/contracts/calf-repository';
import { GetCalfShipmentsInput, GetCalfShipmentsOutput } from './types';

export class GetCalfShipmentsUseCase {
  constructor(private calfRepository: CalfRepository) {}

  async execute(input: GetCalfShipmentsInput): Promise<Result<GetCalfShipmentsOutput, UseCaseError>> {
    try {
      // バリデーション
      const validation = validateGetCalfShipmentsInput(input);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }

      // ビジネスロジック
      const calves = await this.calfRepository.findShipments(input);
      
      return { success: true, data: { calves } };
    } catch (error) {
      return { success: false, error: new UseCaseError('Failed to get calf shipments') };
    }
  }
}

export const getCalfShipmentsUseCase = new GetCalfShipmentsUseCase(calfRepository);
```

#### 2.3.3 リポジトリ実装
```typescript
// apps/api/src/infrastructure/repositories/drizzle-calf-repository.ts
import { CalfRepository } from '../../domain/contracts/calf-repository';
import { Calf } from '../../domain/entities/calf';
import { db } from '../database/connection';

export class DrizzleCalfRepository implements CalfRepository {
  async findShipments(filters: GetCalfShipmentsInput): Promise<Result<Calf[], RepositoryError>> {
    try {
      const query = db
        .select()
        .from(calves)
        .leftJoin(cows, eq(calves.cowId, cows.id))
        .where(
          and(
            eq(calves.farmId, filters.farmId),
            filters.gender ? eq(calves.gender, filters.gender) : undefined,
            filters.startDate ? gte(calves.auctionDate, filters.startDate) : undefined,
            filters.endDate ? lte(calves.auctionDate, filters.endDate) : undefined,
            isNotNull(calves.auctionDate) // 出荷済みのみ
          )
        )
        .limit(filters.limit || 20);

      const results = await query;
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: new RepositoryError('Database query failed') };
    }
  }
}
```

## 3. Webアプリケーション実装方針

### 3.1 アーキテクチャパターン

#### 3.1.1 Next.js App Router + 機能別コンポーネント
```
apps/web/src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # 認証関連ページ
│   ├── dashboard/      # ダッシュボード
│   ├── cow-shipment-management/ # 出荷管理
│   └── layout.tsx      # ルートレイアウト
├── components/          # 共通コンポーネント
│   └── ui/             # shadcn/uiコンポーネント
├── features/            # 機能別コンポーネント
│   ├── auth/           # 認証機能
│   │   ├── login/      # ログイン
│   │   └── register/   # 登録
│   ├── dashboard/      # ダッシュボード機能
│   └── cow-shipment/   # 出荷管理機能
├── lib/                # ライブラリ・ユーティリティ
├── services/           # APIサービス
└── types/              # 型定義
```

#### 3.1.2 状態管理パターン
- **Next.js Server Components**: サーバーサイドレンダリング
- **React Server Actions**: サーバーアクション
- **useState/useReducer**: ローカル状態管理
- **URL State**: クエリパラメータでの状態管理

### 3.2 コーディング規約

#### 3.2.1 コンポーネント設計原則
```typescript
// ✅ 良い例: 単一責任のコンポーネント
interface CalfShipmentRowProps {
  calf: CalfShipment;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onSave: (id: string, data: Partial<CalfShipment>) => void;
  onCancel: (id: string) => void;
}

export const CalfShipmentRow: React.FC<CalfShipmentRowProps> = ({
  calf,
  isEditing,
  onEdit,
  onSave,
  onCancel
}) => {
  // コンポーネントの実装
};

// ❌ 悪い例: 複数の責任を持つコンポーネント
export const CalfShipmentTable = () => {
  // データ取得、編集、保存、削除のすべてを担当
};
```

#### 3.2.2 カスタムフック設計
```typescript
// apps/web/src/features/shipment/hooks/use-calf-shipments.ts
export const useCalfShipments = (filters: ShipmentFilters) => {
  const [data, setData] = useState<CalfShipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const loadMore = useCallback(async () => {
    if (loading || !hasNext) return;
    
    setLoading(true);
    try {
      const response = await calfShipmentService.getShipments({
        ...filters,
        cursor: nextCursor,
        limit: 20
      });
      
      setData(prev => [...prev, ...response.data.calves]);
      setHasNext(response.data.pagination.hasNext);
      setNextCursor(response.data.pagination.nextCursor);
    } catch (error) {
      console.error('Failed to load calf shipments:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, nextCursor, loading, hasNext]);

  return { data, loading, hasNext, loadMore };
};
```

### 3.3 実装パターン

#### 3.3.1 ページコンポーネント（Next.js App Router）
```typescript
// apps/web/src/app/cow-shipment-management/cow-list/page.tsx
import { CalfShipmentListPage } from '@/features/cow-shipment/components/calf-shipment-list-page';

export default function CalfShipmentList() {
  return <CalfShipmentListPage />;
}
```

#### 3.3.2 機能コンポーネント（Container/Presentational パターン）
```typescript
// apps/web/src/features/cow-shipment/components/calf-shipment-list-page.tsx
'use client';

import { useState } from 'react';
import { CalfShipmentListContainer } from './calf-shipment-list-container';
import { CalfShipmentListPresentational } from './calf-shipment-list-presentational';

export const CalfShipmentListPage: React.FC = () => {
  const [filters, setFilters] = useState<ShipmentFilters>({
    farmId: '',
    gender: undefined,
    startDate: undefined,
    endDate: undefined
  });

  return (
    <CalfShipmentListContainer
      filters={filters}
      onFiltersChange={setFilters}
      PresentationalComponent={CalfShipmentListPresentational}
    />
  );
};
```

#### 3.3.3 APIサービス層
```typescript
// apps/web/src/services/calf-shipment-service.ts
import { apiClient } from './api-client';
import { CalfShipment, GetCalfShipmentsResponse } from '../types';

export class CalfShipmentService {
  async getShipments(params: GetCalfShipmentsParams): Promise<GetCalfShipmentsResponse> {
    const response = await apiClient.get('/api/v1/calves/shipments', { params });
    return response.data;
  }

  async updateShipment(id: string, data: Partial<CalfShipment>): Promise<CalfShipment> {
    const response = await apiClient.put(`/api/v1/calves/${id}/shipment`, data);
    return response.data.data;
  }

  async batchUpdateShipments(updates: BatchUpdateShipment[]): Promise<BatchUpdateResponse> {
    const response = await apiClient.put('/api/v1/calves/shipments/batch', { updates });
    return response.data.data;
  }
}

export const calfShipmentService = new CalfShipmentService();
```

## 4. 共通実装方針

### 4.1 型定義の管理

#### 4.1.1 型定義（各アプリケーション内）
```typescript
// apps/web/src/types/calf-shipment.ts
export interface CalfShipment {
  id: string;
  individualNumber: string;
  calfName: string;
  damName: string;
  damId: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'CASTRATED';
  weight: number;
  auctionDate: string;
  price: number;
  buyer: string;
  remarks?: string;
}

export interface GetCalfShipmentsParams {
  farmId: string;
  gender?: 'MALE' | 'FEMALE' | 'CASTRATED';
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}
```

#### 4.1.2 バリデーションスキーマ（Conform使用）
```typescript
// apps/web/src/features/cow-shipment/schemas/calf-shipment.ts
import { z } from 'zod';

export const calfShipmentSchema = z.object({
  id: z.string().uuid(),
  individualNumber: z.string().min(3),
  calfName: z.string().min(1),
  damName: z.string().min(1),
  damId: z.string().uuid(),
  birthDate: z.string().date(),
  gender: z.enum(['MALE', 'FEMALE', 'CASTRATED']),
  weight: z.number().positive(),
  auctionDate: z.string().date(),
  price: z.number().nonnegative(),
  buyer: z.string().min(1),
  remarks: z.string().optional()
});

export const updateCalfShipmentSchema = z.object({
  weight: z.number().positive().optional(),
  auctionDate: z.string().date().optional(),
  price: z.number().nonnegative().optional(),
  buyer: z.string().min(1).optional(),
  remarks: z.string().optional()
});
```

### 4.2 エラーハンドリング

#### 4.2.1 統一エラー型
```typescript
// apps/web/src/types/errors.ts
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  field: string;
}

export interface BusinessRuleError extends ApiError {
  code: 'BUSINESS_RULE_ERROR';
  rule: string;
}
```

#### 4.2.2 エラーハンドリングユーティリティ
```typescript
// apps/web/src/lib/error-handler.ts
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred'
  };
};
```

### 4.3 テスト戦略

#### 4.3.1 単体テスト（Vitest使用）
```typescript
// apps/api/src/domain/functions/__tests__/create-calf.test.ts
import { describe, it, expect } from 'vitest';
import { createCalf } from '../create-calf';
import { CreateCalfInput } from '../../types';

describe('createCalf', () => {
  it('should create a calf with valid input', () => {
    const input: CreateCalfInput = {
      individualNumber: { value: '001-001' },
      calfName: { value: '太郎' },
      // ... other fields
    };

    const result = createCalf(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.individualNumber).toBe('001-001');
      expect(result.data.calfName).toBe('太郎');
    }
  });

  it('should return error for invalid input', () => {
    const input: CreateCalfInput = {
      individualNumber: { value: '' }, // 無効な値
      // ... other fields
    };

    const result = createCalf(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain('Invalid individual number');
    }
  });
});
```

#### 4.3.2 統合テスト（Vitest使用）
```typescript
// apps/api/src/application/use-cases/__tests__/get-calf-shipments.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCalfShipmentsUseCase } from '../get-calf-shipments';
import { CalfRepository } from '../../../domain/contracts/calf-repository';

describe('GetCalfShipmentsUseCase', () => {
  let useCase: GetCalfShipmentsUseCase;
  let mockRepository: CalfRepository;

  beforeEach(() => {
    mockRepository = {
      findShipments: vi.fn(),
      // ... other methods
    } as any;
    useCase = new GetCalfShipmentsUseCase(mockRepository);
  });

  it('should return calf shipments successfully', async () => {
    const mockCalves = [
      { id: '1', individualNumber: '001-001', /* ... */ }
    ];
    vi.mocked(mockRepository.findShipments).mockResolvedValue({
      success: true,
      data: mockCalves
    });

    const result = await useCase.execute({
      farmId: 'farm-1',
      limit: 20
    });

    expect(result.success).toBe(true);
    expect(mockRepository.findShipments).toHaveBeenCalledWith({
      farmId: 'farm-1',
      limit: 20
    });
  });
});
```

#### 4.3.3 E2Eテスト（Playwright使用）
```typescript
// apps/web/src/__tests__/e2e/shipment-flow.test.ts
import { test, expect } from '@playwright/test';

test('should display calf shipment list and allow editing', async ({ page }) => {
  await page.goto('/cow-shipment-management/cow-list');
  
  // 一覧表示の確認
  await expect(page.getByText('出荷管理 - 子牛一覧')).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  
  // 編集モードの確認
  await page.getByRole('button', { name: '✏️' }).first().click();
  await expect(page.getByRole('textbox')).toBeVisible();
  
  // 保存の確認
  await page.getByRole('button', { name: '💾' }).click();
  await expect(page.getByText('保存しました')).toBeVisible();
});
```

## 5. 開発ワークフロー

### 5.1 ブランチ戦略
- **main**: 本番環境用ブランチ
- **develop**: 開発環境用ブランチ
- **feature/**: 機能開発用ブランチ
- **hotfix/**: 緊急修正用ブランチ


### 5.3 コードレビュー指針
1. **機能性**: 要件を満たしているか
2. **保守性**: コードが読みやすく、理解しやすいか
3. **パフォーマンス**: 適切な最適化が行われているか
4. **セキュリティ**: セキュリティリスクがないか
5. **テスト**: 適切なテストが書かれているか

## 6. デプロイメント

### 6.1 環境構成
- **開発環境**: ローカル開発用
- **ステージング環境**: 本番前テスト用
- **本番環境**: 実際のサービス用

### 6.2 CI/CDパイプライン
1. **コードプッシュ**: 自動テスト実行
2. **プルリクエスト**: コードレビュー + テスト
3. **マージ**: ステージング環境デプロイ
4. **本番リリース**: 手動承認後デプロイ

---

この実装方針ドキュメントは、開発チームの指針として使用し、プロジェクトの進行に応じて更新していきます。
