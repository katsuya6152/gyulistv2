// 出荷フィルターコンポーネント

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ShipmentFilters } from "@/types/calf-shipment";
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
    <div className="bg-white p-4 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="gender">性別</Label>
          <select
            id="gender"
            value={localFilters.gender || ""}
            onChange={(e) => handleFilterChange("gender", e.target.value || undefined)}
            className="w-full border rounded px-3 py-2"
            disabled={isLoading}
          >
            <option value="">すべて</option>
            <option value="MALE">オス</option>
            <option value="FEMALE">メス</option>
            <option value="CASTRATED">去勢</option>
          </select>
        </div>

        <div>
          <Label htmlFor="startDate">開始日</Label>
          <Input
            id="startDate"
            type="date"
            value={localFilters.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="endDate">終了日</Label>
          <Input
            id="endDate"
            type="date"
            value={localFilters.endDate || ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleApplyFilters} disabled={isLoading} className="flex-1">
            {isLoading ? "適用中..." : "適用"}
          </Button>
          <Button onClick={handleResetFilters} variant="outline" disabled={isLoading}>
            リセット
          </Button>
        </div>
      </div>
    </div>
  );
}
