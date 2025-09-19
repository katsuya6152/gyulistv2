// 依存性注入コンテナ

export type ServiceFactory<T> = () => T;
export type ServiceToken = string | symbol;

export class Container {
  private services = new Map<ServiceToken, ServiceFactory<unknown>>();
  private singletons = new Map<ServiceToken, unknown>();

  /**
   * サービスを登録
   */
  register<T>(token: ServiceToken, factory: ServiceFactory<T>): void {
    this.services.set(token, factory);
  }

  /**
   * シングルトンサービスを登録
   */
  registerSingleton<T>(token: ServiceToken, factory: ServiceFactory<T>): void {
    this.services.set(token, () => {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, factory());
      }
      return this.singletons.get(token) as T;
    });
  }

  /**
   * サービスを解決
   */
  resolve<T>(token: ServiceToken): T {
    const factory = this.services.get(token);
    if (!factory) {
      throw new Error(`Service ${String(token)} not found`);
    }
    return factory() as T;
  }

  /**
   * サービスが登録されているかチェック
   */
  has(token: ServiceToken): boolean {
    return this.services.has(token);
  }

  /**
   * すべてのサービスをクリア
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }
}

// グローバルコンテナインスタンス
export const container = new Container();

// サービストークン
export const TOKENS = {
  // リポジトリ
  CalfRepository: Symbol("CalfRepository"),
  CowRepository: Symbol("CowRepository"),
  UserRepository: Symbol("UserRepository"),
  FarmRepository: Symbol("FarmRepository"),

  // ドメインサービス
  AnalyticsService: Symbol("AnalyticsService"),
  AuthenticationService: Symbol("AuthenticationService"),

  // アプリケーションサービス
  GetAnalyticsOverviewUseCase: Symbol("GetAnalyticsOverviewUseCase"),
  GetAnalyticsTrendsUseCase: Symbol("GetAnalyticsTrendsUseCase"),
  GetAnalyticsPedigreeUseCase: Symbol("GetAnalyticsPedigreeUseCase"),
  GetCalfShipmentsUseCase: Symbol("GetCalfShipmentsUseCase"),
} as const;
