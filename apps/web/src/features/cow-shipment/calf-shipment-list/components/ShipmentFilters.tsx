// 出荷フィルターコンポーネント

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShipmentFilters } from "@/types/calf-shipment";
import { Filter, RotateCcw, Search } from "lucide-react";
import { useState } from "react";

interface ShipmentFiltersComponentProps {
  filters: ShipmentFilters;
  onFilterChange: (filters: ShipmentFilters) => void;
  isLoading: boolean;
}

export function ShipmentFiltersComponent({ filters, onFilterChange, isLoading }: ShipmentFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<ShipmentFilters>(filters);

  const handleFilterChange = (field: keyof ShipmentFilters, value: string | undefined) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = { farmId: filters.farmId };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-gray-600" />
          <span className="text-xs font-medium text-gray-700">フィルター</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-shrink-0">
            <Label htmlFor="gender" className="text-xs text-gray-600 whitespace-nowrap min-w-[30px]">
              性別:
            </Label>
            <select
              id="gender"
              value={localFilters.gender || ""}
              onChange={(e) => handleFilterChange("gender", e.target.value || undefined)}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 min-w-[80px] h-7"
              disabled={isLoading}
            >
              <option value="">すべて</option>
              <option value="MALE">オス</option>
              <option value="FEMALE">メス</option>
              <option value="CASTRATED">去勢</option>
            </select>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Label htmlFor="startDate" className="text-xs text-gray-600 whitespace-nowrap min-w-[40px]">
              開始日:
            </Label>
            <Input
              id="startDate"
              type="date"
              value={localFilters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
              className="text-xs w-auto min-w-[120px] h-7"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Label htmlFor="endDate" className="text-xs text-gray-600 whitespace-nowrap min-w-[40px]">
              終了日:
            </Label>
            <Input
              id="endDate"
              type="date"
              value={localFilters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
              className="text-xs w-auto min-w-[120px] h-7"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-1 sm:ml-auto flex-shrink-0">
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2 text-xs whitespace-nowrap"
            >
              <Search className="w-3 h-3 mr-1" />
              {isLoading ? "適用中..." : "適用"}
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 h-6 px-2 text-xs whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              リセット
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
