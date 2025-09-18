import type { CalfRepository } from "../../../domain/contracts/calf-repository";
import type { CowRepository } from "../../../domain/contracts/repositories";
import type { Cow } from "../../../domain/entities/cow";
import type { CowShipmentInfo } from "../../../domain/types/calf-shipment";

// ユースケースエラー型
export interface UseCaseError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Result型
export type Result<T, E = UseCaseError> = { success: true; data: T } | { success: false; error: E };

export class GetCowShipmentInfoUseCase {
  constructor(
    private cowRepository: CowRepository,
    private calfRepository: CalfRepository
  ) {}

  async execute(cowId: string): Promise<Result<CowShipmentInfo, UseCaseError>> {
    try {
      // バリデーション
      if (!cowId) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Cow ID is required",
          },
        };
      }

      // 母牛情報を取得
      const cowResult = await this.cowRepository.findById(cowId);
      if (!cowResult.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "Failed to find cow",
            details: { repositoryError: cowResult.error },
          },
        };
      }

      if (!cowResult.data) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Cow not found",
          },
        };
      }

      // 母牛の子牛出荷情報を取得
      const calvesResult = await this.calfRepository.findByCowId(cowId);
      if (!calvesResult.success) {
        return {
          success: false,
          error: {
            code: "REPOSITORY_ERROR",
            message: "Failed to find calf shipments",
            details: { repositoryError: calvesResult.error },
          },
        };
      }

      // 出荷済みの子牛のみをフィルタリング
      const shippedCalves = calvesResult.data.filter((calf) => calf.auctionDate !== null);

      // 日齢計算関数
      const calculateAgeInDays = (birthDate: string): number => {
        const birth = new Date(birthDate);
        const now = new Date();
        const diffTime = now.getTime() - birth.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      // 統計情報を計算
      const prices = shippedCalves.map((calf) => calf.price).filter((price): price is number => price !== null);

      const statistics = {
        totalShipments: shippedCalves.length,
        averagePrice: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        totalRevenue: prices.reduce((sum, price) => sum + price, 0),
      };

      // 年齢を計算
      const birthDate = new Date(cowResult.data.birthDate);
      const now = new Date();
      const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
      const age = `${Math.floor(ageInMonths / 12)}歳${ageInMonths % 12}ヶ月`;

      const response: CowShipmentInfo = {
        cow: {
          id: cowResult.data.id,
          individualNumber: cowResult.data.individualNumber,
          name: cowResult.data.name,
          birthDate: cowResult.data.birthDate,
          age,
          healthStatus: cowResult.data.healthStatus,
          farmId: cowResult.data.farmId,
        },
        calfShipments: shippedCalves.map((calf) => ({
          id: calf.id,
          individualNumber: calf.individualNumber,
          calfName: calf.calfName,
          damName: calf.damName,
          damId: calf.damId,
          damIndividualNumber: calf.damIndividualNumber ?? null,
          birthDate: calf.birthDate,
          // 血統情報
          sirePedigree: calf.sirePedigree ?? null,
          maternalGrandsire: calf.maternalGrandsire ?? null,
          maternalGreatGrandsire: calf.maternalGreatGrandsire ?? null,
          maternalGreatGreatGrandsire: calf.maternalGreatGreatGrandsire ?? null,
          // 繁殖・出産情報
          matingDate: calf.matingDate ?? null,
          expectedBirthDate: calf.expectedBirthDate ?? null,
          auctionDate: calf.auctionDate ?? null,
          matingInterval: calf.matingInterval ?? null,
          // 個体情報
          weight: calf.weight ?? null,
          ageInDays: calculateAgeInDays(calf.birthDate),
          gender: calf.gender,
          // 取引情報
          price: calf.price ?? null,
          buyer: calf.buyer ?? null,
          remarks: calf.remarks ?? null,
          // その他
          farmId: calf.farmId,
          healthStatus: calf.healthStatus,
          createdAt: calf.createdAt,
          updatedAt: calf.updatedAt,
        })),
        statistics,
      };

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
        },
      };
    }
  }
}
