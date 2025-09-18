# 出荷管理画面設計ドキュメント

## 1. 概要

### 1.1 目的
和牛繁殖農家向けプロダクト「ギュウリスト」の出荷管理機能の画面設計、API設計、データベース設計を定義する。

### 1.2 機能概要
- 子牛の出荷情報を一覧表示・管理
- 母牛の詳細情報とその子牛の出荷記録を表示
- 無限スクロールによる大量データの効率的な表示
- インライン編集による直感的なデータ操作

### 1.3 技術要件
- **フロントエンド**: React + TypeScript
- **バックエンド**: Hono + TypeScript
- **データベース**: PostgreSQL
- **UI/UX**: 無限スクロール + インライン編集

## 2. 画面設計

### 2.1 子牛出荷管理画面（メイン画面）

#### 2.1.1 画面レイアウト
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🐄 ギュウリスト - 出荷管理システム                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ホーム > 出荷管理 > 子牛一覧                                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│ 検索・フィルター                                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 農場: [A牧場 ▼] 性別: [全て ▼] 期間: [2024/01/01] - [2024/12/31] [🔍 検索] [🔄 リセット]        │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ 操作ボタン                                                                                               │
│ [➕ 新規出荷登録] [📊 エクスポート] [⚙️ 一括操作] [📈 統計表示]                                          │
│                                                                                                         │
│ 出荷記録一覧 (読み込み中: 156件中 20件表示)                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 個体番号  │ 名号    │ 母牛名  │ 生年月日    │ 性別 │ 体重   │ 出荷日     │ 価格     │ 購買者  │ 操作 │   │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│ │ 001-001   │ 太郎    │ 花子    │ 2024/01/15  │ オス │ 450kg  │ 2024/06/15 │ 120万円  │ A牧場   │ [✏️][🗑️] │   │
│ │ 001-002   │ 次郎    │ 花子    │ 2024/01/15  │ メス │ 420kg  │ 2024/06/20 │ 110万円  │ B牧場   │ [✏️][🗑️] │   │
│ │ 001-003   │ 三郎    │ 梅子    │ 2024/02/10  │ オス │ 480kg  │ 2024/07/10 │ 130万円  │ C牧場   │ [✏️][🗑️] │   │
│ │ 001-004   │ 四郎    │ 梅子    │ 2024/02/10  │ メス │ 410kg  │ 2024/07/15 │ 105万円  │ D牧場   │ [✏️][🗑️] │   │
│ │ 001-005   │ 五郎    │ 桜子    │ 2024/03/05  │ オス │ 460kg  │ 2024/08/01 │ 125万円  │ E牧場   │ [✏️][🗑️] │   │
│ │ ...       │ ...     │ ...     │ ...         │ ...  │ ...    │ ...        │ ...      │ ...     │ ... │   │
│ │ 001-020   │ 二十郎  │ 菊子    │ 2024/05/20  │ メス │ 430kg  │ 2024/09/10 │ 115万円  │ F牧場   │ [✏️][🗑️] │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ [📄 さらに読み込む] (20件ずつ読み込み)                                                                     │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2.1.2 表示項目
- **個体番号**: 子牛の個体識別番号
- **名号**: 子牛の名前
- **母牛名**: 母牛の名前（クリック可能、詳細画面へ遷移）
- **生年月日**: 子牛の生年月日
- **性別**: オス/メス/去勢
- **体重**: 出荷時の体重（kg）
- **出荷日**: 出荷した日付
- **価格**: 出荷価格（円）
- **購買者**: 購入した牧場名
- **操作**: 編集・削除ボタン

#### 2.1.3 機能
- **無限スクロール**: 20件ずつ動的読み込み
- **インライン編集**: 行をクリックして直接編集
- **一括操作**: 複数行の選択と一括編集
- **フィルター**: 農場、性別、期間での絞り込み
- **検索**: 個体番号、名号での検索

### 2.2 母牛出荷管理画面（詳細画面）

#### 2.2.1 画面レイアウト
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🐄 ギュウリスト - 出荷管理システム                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ホーム > 出荷管理 > 子牛一覧 > 母牛詳細: 花子                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                         │
│ 母牛基本情報                                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 🐄 花子 (個体番号: 001-001)                                                                        │   │
│ │ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │   │
│ │ │ 個体番号: 001-001  │ 名号: 花子        │ 生年月日: 2020/03/15  │ 年齢: 4歳3ヶ月              │ │   │
│ │ │ 血統: 父牛-○○      │ 母の父-△△        │ 健康状態: 良好        │ 農場: A牧場                  │ │   │
│ │ │ 母得点: 85点       │ 登録記号: 12345   │ 生産者: 田中太郎      │ 個体識別番号: 1234567890     │ │   │
│ │ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ この母牛の子牛出荷記録 (3件)                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 個体番号  │ 名号    │ 生年月日    │ 性別 │ 体重   │ 出荷日     │ 価格     │ 購買者  │ 備考    │ 操作 │   │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│ │ 002-001   │ 太郎    │ 2024/01/15  │ オス │ 450kg  │ 2024/06/15 │ 120万円  │ A牧場   │ 優秀    │ [✏️][🗑️] │   │
│ │ 002-002   │ 次郎    │ 2024/01/15  │ メス │ 420kg  │ 2024/06/20 │ 110万円  │ B牧場   │ 良好    │ [✏️][🗑️] │   │
│ │ 002-003   │ 三郎    │ 2024/03/10  │ オス │ 480kg  │ 2024/07/10 │ 130万円  │ C牧場   │ 優秀    │ [✏️][🗑️] │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ 統計情報                                                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 総出荷頭数: 3頭  │ 平均価格: 120万円  │ 最高価格: 130万円  │ 最低価格: 110万円  │ 総売上: 360万円 │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ [← 子牛一覧に戻る] [➕ 新規出荷登録] [📊 詳細レポート]                                                   │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2.2.2 表示項目
- **母牛基本情報**: 個体番号、名号、生年月日、年齢、血統、健康状態、農場情報
- **子牛出荷記録**: この母牛が産んだ子牛の出荷情報一覧
- **統計情報**: 出荷頭数、平均価格、最高価格、最低価格、総売上

### 2.3 インライン編集モード

#### 2.3.1 編集モードの詳細表示
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 出荷記録一覧 (編集モード) - 3行目を編集中                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 個体番号  │ 名号    │ 母牛名  │ 生年月日    │ 性別     │ 体重     │ 出荷日     │ 価格       │ 購買者    │ 操作 │   │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│ │ 001-001   │ 太郎    │ 花子    │ 2024/01/15  │ オス     │ 450kg    │ 2024/06/15 │ 120万円    │ A牧場     │ [✏️][🗑️] │   │
│ │ 001-002   │ 次郎    │ 花子    │ 2024/01/15  │ メス     │ 420kg    │ 2024/06/20 │ 110万円    │ B牧場     │ [✏️][🗑️] │   │
│ │ 001-003   │ 三郎    │ 梅子    │ 2024/02/10  │ [オス▼]  │ [480kg]  │ [2024/07/10] │ [130万円]  │ [C牧場]   │ [💾][❌] │   │
│ │ 001-004   │ 四郎    │ 梅子    │ 2024/02/10  │ メス     │ 410kg    │ 2024/07/15 │ 105万円    │ D牧場     │ [✏️][🗑️] │   │
│ │ 001-005   │ 五郎    │ 桜子    │ 2024/03/05  │ オス     │ 460kg    │ 2024/08/01 │ 125万円    │ E牧場     │ [✏️][🗑️] │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ 編集中の変更: 体重 480kg → 500kg, 価格 130万円 → 135万円, 購買者 C牧場 → D牧場                            │
│ [💾 保存] [❌ キャンセル] [🔄 リセット]                                                                   │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2.3.2 新規追加モード
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 出荷記録一覧 (新規追加モード)                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 個体番号  │ 名号    │ 母牛名  │ 生年月日    │ 性別     │ 体重     │ 出荷日     │ 価格       │ 購買者    │ 操作 │   │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│ │ 001-001   │ 太郎    │ 花子    │ 2024/01/15  │ オス     │ 450kg    │ 2024/06/15 │ 120万円    │ A牧場     │ [✏️][🗑️] │   │
│ │ 001-002   │ 次郎    │ 花子    │ 2024/01/15  │ メス     │ 420kg    │ 2024/06/20 │ 110万円    │ B牧場     │ [✏️][🗑️] │   │
│ │ [新規]    │ [名号]  │ [母牛選択▼] │ [生年月日] │ [性別▼] │ [体重]   │ [出荷日]   │ [価格]     │ [購買者]  │ [💾][❌] │   │
│ │           │         │ 花子    │ 2024/03/15  │ オス     │ 470kg    │ 2024/08/20 │ 125万円    │ E牧場     │         │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ 新規追加項目: 個体番号は自動生成、母牛は選択必須、その他は入力必須                                          │
│ [💾 保存] [❌ キャンセル] [➕ 別の新規行追加]                                                             │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 2.3.3 一括編集モード
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 出荷記録一覧 (一括編集モード) - 3件選択中                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│ │ ☑️ 個体番号  │ 名号    │ 母牛名  │ 生年月日    │ 性別     │ 体重     │ 出荷日     │ 価格       │ 購買者    │ 操作 │   │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│ │ ☑️ 001-001   │ 太郎    │ 花子    │ 2024/01/15  │ オス     │ 450kg    │ 2024/06/15 │ 120万円    │ A牧場     │ [✏️][🗑️] │   │
│ │ ☑️ 001-002   │ 次郎    │ 花子    │ 2024/01/15  │ メス     │ 420kg    │ 2024/06/20 │ 110万円    │ B牧場     │ [✏️][🗑️] │   │
│ │ ☑️ 001-003   │ 三郎    │ 梅子    │ 2024/02/10  │ オス     │ 480kg    │ 2024/07/10 │ 130万円    │ C牧場     │ [✏️][🗑️] │   │
│ │ ☐ 001-004    │ 四郎    │ 梅子    │ 2024/02/10  │ メス     │ 410kg    │ 2024/07/15 │ 105万円    │ D牧場     │ [✏️][🗑️] │   │
│ │ ☐ 001-005    │ 五郎    │ 桜子    │ 2024/03/05  │ オス     │ 460kg    │ 2024/08/01 │ 125万円    │ E牧場     │ [✏️][🗑️] │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                         │
│ 一括操作                                                                                                 │
│ 選択した3件に対して:                                                                                      │
│ 価格を一律 [10% 値上げ] [5% 値下げ] [固定値: 120万円] [変更なし]                                          │
│ 購買者を [一括変更: F牧場] [変更なし]                                                                     │
│ 出荷日を [1週間後] [1ヶ月後] [変更なし]                                                                   │
│                                                                                                         │
│ [💾 一括保存] [❌ キャンセル] [🔄 選択解除]                                                               │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 3. API設計

### 3.1 子牛出荷管理API

#### 3.1.1 子牛出荷一覧取得（無限スクロール対応）
```http
GET /api/v1/calves/shipments
```

**Query Parameters:**
- `farmId` (string, 必須): 農場ID
- `gender` (string, 任意): 性別フィルター ('MALE' | 'FEMALE' | 'CASTRATED')
- `startDate` (string, 任意): 開始日 (YYYY-MM-DD)
- `endDate` (string, 任意): 終了日 (YYYY-MM-DD)
- `cursor` (string, 任意): 前回のレスポンスのnextCursor
- `limit` (number, 任意): 取得件数 (デフォルト: 20, 最大: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "calves": [
      {
        "id": "uuid",
        "individualNumber": "001-001",
        "calfName": "太郎",
        "damName": "花子",
        "damId": "uuid",
        "birthDate": "2024-01-15",
        "gender": "MALE",
        "weight": 450,
        "auctionDate": "2024-06-15", // auction_dateを出荷日として使用
        "price": 1200000,
        "buyer": "A牧場",
        "remarks": "備考"
      }
    ],
    "pagination": {
      "hasNext": true,
      "nextCursor": "eyJpZCI6InV1aWQifQ==",
      "total": 156,
      "loaded": 20
    }
  }
}
```

#### 3.1.2 子牛出荷情報更新（インライン編集対応）
```http
PUT /api/v1/calves/:id/shipment
```

**Request Body:**
```json
{
  "weight": 480,
  "auctionDate": "2024-07-10", // auction_dateを出荷日として使用
  "price": 1300000,
  "buyer": "C牧場",
  "remarks": "更新された備考"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "weight": 480,
    "auctionDate": "2024-07-10",
    "price": 1300000,
    "buyer": "C牧場",
    "remarks": "更新された備考",
    "updatedAt": "2024-06-15T10:00:00Z"
  }
}
```

#### 3.1.3 子牛出荷情報一括更新
```http
PUT /api/v1/calves/shipments/batch
```

**Request Body:**
```json
{
  "updates": [
    {
      "id": "uuid1",
      "weight": 480,
      "price": 1300000
    },
    {
      "id": "uuid2",
      "buyer": "新しい牧場"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "failed": 0,
    "results": [
      {
        "id": "uuid1",
        "success": true
      },
      {
        "id": "uuid2",
        "success": true
      }
    ]
  }
}
```

#### 3.1.4 子牛出荷情報削除（出荷取り消し）
```http
PUT /api/v1/calves/:id/shipment/cancel
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "auctionDate": null,
    "price": null,
    "buyer": null,
    "remarks": null,
    "updatedAt": "2024-06-15T10:00:00Z"
  }
}
```

### 3.2 母牛出荷管理API

#### 3.2.1 母牛詳細と子牛出荷一覧取得
```http
GET /api/v1/cows/:cowId/calves/shipments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cow": {
      "id": "uuid",
      "individualNumber": "001-001",
      "name": "花子",
      "birthDate": "2020-03-15",
      "age": "4歳3ヶ月",
      "healthStatus": "HEALTHY",
      "farmId": "uuid"
    },
    "calfShipments": [
      {
        "id": "uuid",
        "individualNumber": "002-001",
        "calfName": "太郎",
        "birthDate": "2024-01-15",
        "gender": "MALE",
        "weight": 450,
        "auctionDate": "2024-06-15", // auction_dateを出荷日として使用
        "price": 1200000,
        "buyer": "A牧場",
        "remarks": "備考"
      }
    ],
    "statistics": {
      "totalShipments": 3,
      "averagePrice": 1200000,
      "maxPrice": 1300000,
      "minPrice": 1100000,
      "totalRevenue": 3600000
    }
  }
}
```

### 3.3 統計・レポートAPI

#### 3.3.1 出荷統計取得
```http
GET /api/v1/calves/shipments/statistics
```

**Query Parameters:**
- `farmId` (string, 必須): 農場ID
- `startDate` (string, 任意): 開始日
- `endDate` (string, 任意): 終了日
- `groupBy` (string, 任意): グループ化 ('month' | 'quarter' | 'year')

**Response:**
```json
{
  "success": true,
  "data": {
    "totalShipments": 156,
    "totalRevenue": 187200000,
    "averagePrice": 1200000,
    "monthlyData": [
      {
        "month": "2024-01",
        "shipments": 12,
        "revenue": 14400000
      }
    ]
  }
}
```

## 4. データベース設計

### 4.1 出荷管理テーブル

#### 4.1.1 既存テーブルの活用
出荷管理には既存の`calves`テーブルと`cows`テーブルを活用します。`shipments`テーブルは不要です。

**理由:**
- `calves`テーブルに既に出荷関連情報が含まれている
- 子牛の出荷は通常1回のみ
- データの重複を避け、シンプルな構造を維持

#### 4.1.2 calves テーブル（出荷管理用）
```sql
-- 既存のcalvesテーブル（出荷管理に必要な項目）
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
  auction_date DATE, -- せり年月日（出荷日として使用）
  mating_interval INTEGER, -- 種付け間隔（日数）
  -- 個体情報
  weight DECIMAL(8,2), -- 体重（kg）
  age_in_days INTEGER, -- 日齢
  gender VARCHAR(10) NOT NULL, -- 性別（MALE/FEMALE/CASTRATED）
  -- 取引情報（出荷管理で使用）
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

#### 4.1.3 インデックス設計
```sql
-- 出荷日（auction_date）での検索最適化
CREATE INDEX idx_calves_auction_date ON calves(auction_date);

-- 農場別の出荷検索最適化
CREATE INDEX idx_calves_farm_id ON calves(farm_id);

-- 購買者での検索最適化
CREATE INDEX idx_calves_buyer ON calves(buyer);

-- 性別での検索最適化
CREATE INDEX idx_calves_gender ON calves(gender);

-- 複合インデックス（農場 + 出荷日）
CREATE INDEX idx_calves_farm_auction_date ON calves(farm_id, auction_date);

-- 母牛別の子牛検索最適化
CREATE INDEX idx_calves_cow_id ON calves(cow_id);
```

### 4.2 関連テーブル

#### 4.2.1 子牛出荷情報ビュー（簡素化版）
```sql
-- 子牛出荷情報を含むビュー（shipmentsテーブル不要）
CREATE VIEW calf_shipment_view AS
SELECT 
  c.id,
  c.individual_number,
  c.calf_name,
  c.birth_date,
  c.gender,
  c.weight,
  c.farm_id,
  cow.name as dam_name,
  cow.id as dam_id,
  c.auction_date as shipment_date, -- auction_dateを出荷日として使用
  c.price,
  c.buyer,
  c.remarks
FROM calves c
LEFT JOIN cows cow ON c.cow_id = cow.id
WHERE c.auction_date IS NOT NULL; -- 出荷済みの子牛のみ
```

#### 4.2.2 母牛基本情報ビュー
```sql
-- 母牛基本情報ビュー
CREATE VIEW cow_shipment_info_view AS
SELECT 
  c.id,
  c.individual_number,
  c.name,
  c.birth_date,
  c.health_status,
  c.farm_id,
  EXTRACT(YEAR FROM AGE(c.birth_date)) as age_years,
  EXTRACT(MONTH FROM AGE(c.birth_date)) as age_months
FROM cows c;
```

## 5. フロントエンド技術仕様

### 5.1 コンポーネント設計

#### 5.1.1 メインコンポーネント
```typescript
// 子牛出荷管理画面
<CalfShipmentListPage>
  <ShipmentFilter />
  <ShipmentActionBar />
  <InfiniteScrollTable>
    <CalfShipmentTableHeader />
    <CalfShipmentTableBody>
      <CalfShipmentRow /> // 通常表示モード
      <CalfShipmentRowEdit /> // 編集モード
      <CalfShipmentRowNew /> // 新規追加モード
    </CalfShipmentTableBody>
  </InfiniteScrollTable>
  <LoadMoreButton />
</CalfShipmentListPage>

// 母牛出荷管理画面
<CowShipmentDetailPage>
  <CowInfoCard />
  <CalfShipmentTable />
  <ShipmentStatistics />
</CowShipmentDetailPage>
```

#### 5.1.2 状態管理設計
```typescript
interface ShipmentState {
  // データ
  calves: CalfShipment[];
  loading: boolean;
  hasNext: boolean;
  nextCursor?: string;
  
  // 編集状態
  editingRows: Set<string>; // 編集中の行ID
  newRows: CalfShipmentNew[]; // 新規追加行
  pendingChanges: Map<string, Partial<CalfShipment>>; // 未保存の変更
  
  // フィルター
  filters: ShipmentFilters;
}

interface CalfShipment {
  id: string;
  individualNumber: string;
  calfName: string;
  damName: string;
  damId: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'CASTRATED';
  weight: number;
  auctionDate: string; // auction_dateを出荷日として使用
  price: number;
  buyer: string;
  remarks?: string;
}
```

### 5.2 無限スクロール実装

#### 5.2.1 カスタムフック
```typescript
const useInfiniteShipments = (filters: ShipmentFilters) => {
  const [data, setData] = useState<CalfShipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const loadMore = useCallback(async () => {
    if (loading || !hasNext) return;
    
    setLoading(true);
    try {
      const response = await fetchShipments({
        ...filters,
        cursor: nextCursor,
        limit: 20
      });
      
      setData(prev => [...prev, ...response.data.calves]);
      setHasNext(response.data.pagination.hasNext);
      setNextCursor(response.data.pagination.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [filters, nextCursor, loading, hasNext]);

  return { data, loading, hasNext, loadMore };
};
```

#### 5.2.2 仮想スクロール実装
```typescript
const VirtualizedTable = ({ data, onLoadMore }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    
    // 80%スクロールしたら次のデータを読み込み
    if (scrollPercentage > 0.8) {
      onLoadMore();
    }
  }, [onLoadMore]);
  
  return (
    <div className="virtual-table" onScroll={handleScroll}>
      {data.slice(visibleRange.start, visibleRange.end).map((item, index) => (
        <CalfShipmentRow key={item.id} calf={item} />
      ))}
    </div>
  );
};
```

### 5.3 インライン編集実装

#### 5.3.1 編集可能なテーブル行コンポーネント
```typescript
const CalfShipmentRow = ({ calf, isEditing, onEdit, onSave, onCancel }) => {
  const [editData, setEditData] = useState(calf);
  
  const handleSave = async () => {
    try {
      await updateShipment(calf.id, editData);
      onSave(editData);
    } catch (error) {
      // エラーハンドリング
    }
  };
  
  if (isEditing) {
    return (
      <tr className="editing-row">
        <td>{calf.individualNumber}</td>
        <td>{calf.calfName}</td>
        <td>{calf.damName}</td>
        <td>{calf.birthDate}</td>
        <td>
          <select 
            value={editData.gender} 
            onChange={(e) => setEditData({...editData, gender: e.target.value})}
          >
            <option value="MALE">オス</option>
            <option value="FEMALE">メス</option>
            <option value="CASTRATED">去勢</option>
          </select>
        </td>
        <td>
          <input 
            type="number" 
            value={editData.weight} 
            onChange={(e) => setEditData({...editData, weight: Number(e.target.value)})}
          />
        </td>
        <td>
          <input 
            type="date" 
            value={editData.shipmentDate} 
            onChange={(e) => setEditData({...editData, shipmentDate: e.target.value})}
          />
        </td>
        <td>
          <input 
            type="number" 
            value={editData.price} 
            onChange={(e) => setEditData({...editData, price: Number(e.target.value)})}
          />
        </td>
        <td>
          <input 
            type="text" 
            value={editData.buyer} 
            onChange={(e) => setEditData({...editData, buyer: e.target.value})}
          />
        </td>
        <td>
          <button onClick={handleSave}>💾</button>
          <button onClick={onCancel}>❌</button>
        </td>
      </tr>
    );
  }
  
  return (
    <tr>
      <td>{calf.individualNumber}</td>
      <td>{calf.calfName}</td>
      <td>
        <button onClick={() => navigateToCowDetail(calf.damId)}>
          {calf.damName}
        </button>
      </td>
      <td>{calf.birthDate}</td>
      <td>{getGenderLabel(calf.gender)}</td>
      <td>{calf.weight}kg</td>
      <td>{calf.shipmentDate}</td>
      <td>¥{calf.price.toLocaleString()}</td>
      <td>{calf.buyer}</td>
      <td>
        <button onClick={() => onEdit(calf.id)}>✏️</button>
        <button onClick={() => onDelete(calf.id)}>🗑️</button>
      </td>
    </tr>
  );
};
```

#### 5.3.2 デバウンス付き保存
```typescript
const useDebouncedSave = (data, delay = 1000) => {
  const [pendingChanges, setPendingChanges] = useState({});
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(pendingChanges).length > 0) {
        saveChanges(pendingChanges);
        setPendingChanges({});
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [pendingChanges, delay]);
  
  const updateField = (id, field, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };
  
  return { updateField, pendingChanges };
};
```

### 5.4 バリデーション

#### 5.4.1 データバリデーション
```typescript
const validateShipmentData = (data: CalfShipment) => {
  const errors: string[] = [];
  
  if (!data.calfName?.trim()) {
    errors.push('名号は必須です');
  }
  
  if (!data.weight || data.weight <= 0) {
    errors.push('体重は正の値である必要があります');
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('価格は正の値である必要があります');
  }
  
  if (!data.buyer?.trim()) {
    errors.push('購買者は必須です');
  }
  
  if (!data.shipmentDate) {
    errors.push('出荷日は必須です');
  }
  
  return errors;
};
```

### 5.5 ユーザビリティ向上

#### 5.5.1 キーボードショートカット
```typescript
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            addNewRow();
            break;
          case 's':
            e.preventDefault();
            saveAllChanges();
            break;
          case 'z':
            e.preventDefault();
            undoLastChange();
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

## 6. パフォーマンス最適化

### 6.1 データベース最適化
- 適切なインデックス設計
- クエリ最適化
- ページネーション実装

### 6.2 フロントエンド最適化
- 仮想スクロール（大量データ対応）
- キャッシュ戦略
- 遅延読み込み

### 6.3 ネットワーク最適化
- リクエストのバッチ処理
- デバウンス機能
- オフライン対応

## 7. セキュリティ考慮事項

### 7.1 認証・認可
- JWT トークンによる認証
- 農場単位でのデータアクセス制御
- ロールベースの操作権限管理

### 7.2 データ保護
- 個人情報の暗号化
- SQLインジェクション対策
- XSS対策

## 8. テスト戦略

### 8.1 単体テスト
- コンポーネントのテスト
- カスタムフックのテスト
- バリデーション関数のテスト

### 8.2 統合テスト
- API エンドポイントのテスト
- データベース操作のテスト

### 8.3 E2Eテスト
- 画面遷移のテスト
- ユーザー操作フローのテスト

---

この設計ドキュメントは、出荷管理機能の開発における指針として使用し、開発の進行に応じて更新していきます。
