// 出荷テーブルコンポーネント

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CalfShipment, UpdateCalfShipmentParams } from "@/types/calf-shipment";
import { useState } from "react";

interface ShipmentTableProps {
  calves: CalfShipment[];
  editingRows: Set<string>;
  pendingChanges: UpdateCalfShipmentParams[];
  newRows: Array<{ id: string; data: Partial<CalfShipment> }>;
  onStartEditing: (id: string) => void;
  onCancelEditing: (id: string) => void;
  onUpdate: (id: string, updates: UpdateCalfShipmentParams) => void;
  onCancelShipment: (id: string) => void;
  onFieldUpdate: (id: string, field: keyof UpdateCalfShipmentParams, value: string | number | null) => void;
  onNewRowFieldUpdate: (id: string, field: keyof CalfShipment, value: string | number | null) => void;
  onSaveNewRow: (id: string) => void;
  onRemoveNewRow: (id: string) => void;
}

export function ShipmentTable({
  calves,
  editingRows,
  pendingChanges,
  newRows,
  onStartEditing,
  onCancelEditing,
  onUpdate,
  onCancelShipment,
  onFieldUpdate,
  onNewRowFieldUpdate,
  onSaveNewRow,
  onRemoveNewRow,
}: ShipmentTableProps) {
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set());

  const handleSave = async (id: string) => {
    setSavingRows((prev) => new Set(Array.from(prev).concat(id)));
    try {
      // 保留中の変更を取得
      const pendingChange = pendingChanges.find((change) => change.id === id);
      console.log("Pending changes:", pendingChanges);
      console.log("Found pending change for", id, ":", pendingChange);

      if (pendingChange) {
        const { id: _, ...updates } = pendingChange;
        console.log("Sending updates:", updates);
        await onUpdate(id, { id, ...updates });
      } else {
        console.warn("No pending changes found for", id);
      }
      onCancelEditing(id);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSavingRows((prev) => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return `¥${price.toLocaleString()}`;
  };

  const formatWeight = (weight: number | null) => {
    if (weight === null) return "-";
    return `${weight}kg`;
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "オス";
      case "FEMALE":
        return "メス";
      case "CASTRATED":
        return "去勢";
      default:
        return gender;
    }
  };

  const getStatusBadge = (calf: CalfShipment) => {
    if (calf.auctionDate) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          出荷済み
        </Badge>
      );
    }
    return <Badge variant="secondary">未出荷</Badge>;
  };

  // 保留中の変更を取得する関数
  const getPendingValue = (id: string, field: keyof UpdateCalfShipmentParams, defaultValue: string | number | null) => {
    const pendingChange = pendingChanges.find((change) => change.id === id);
    return pendingChange?.[field] !== undefined ? pendingChange[field] : defaultValue;
  };

  return (
    <div className="overflow-x-auto overflow-y-visible">
      <table className="w-full min-w-[1800px] border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium whitespace-nowrap">個体番号</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">子牛名</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">母牛名</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">母牛個体番号</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">生年月日</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">性別</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">体重</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">日齢</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">種付日</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">出産予定日</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">出荷日</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">価格</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">購買者</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">父牛血統</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">母の父血統</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">母の祖父血統</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">母の母の祖父血統</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">健康状態</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">備考</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">状態</th>
            <th className="text-left p-3 font-medium whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody>
          {calves.map((calf) => {
            const isEditing = editingRows.has(calf.id);
            const isSaving = savingRows.has(calf.id);

            return (
              <tr key={calf.id} className="border-b hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap">{calf.individualNumber}</td>
                <td className="p-3 whitespace-nowrap">{calf.calfName}</td>
                <td className="p-3 whitespace-nowrap">
                  <a href={`/cow-shipment-management/${calf.damId}`} className="text-blue-600 hover:text-blue-800 underline">
                    {calf.damName}
                  </a>
                </td>
                <td className="p-3 whitespace-nowrap">{calf.damIndividualNumber || "-"}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(calf.birthDate)}</td>
                <td className="p-3 whitespace-nowrap">{getGenderLabel(calf.gender)}</td>
                <td className="p-3 whitespace-nowrap">
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={getPendingValue(calf.id, "weight", calf.weight) || ""}
                      onChange={(e) => onFieldUpdate(calf.id, "weight", Number.parseFloat(e.target.value) || null)}
                      className="w-20"
                    />
                  ) : (
                    formatWeight(calf.weight)
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">{calf.ageInDays ? `${calf.ageInDays}日` : "-"}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(calf.matingDate)}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(calf.expectedBirthDate)}</td>
                <td className="p-3 whitespace-nowrap">
                  {isEditing ? (
                    <Input
                      type="date"
                      value={getPendingValue(calf.id, "auctionDate", calf.auctionDate) || ""}
                      onChange={(e) => onFieldUpdate(calf.id, "auctionDate", e.target.value || null)}
                      className="w-32"
                    />
                  ) : (
                    formatDate(calf.auctionDate)
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={getPendingValue(calf.id, "price", calf.price) || ""}
                      onChange={(e) => onFieldUpdate(calf.id, "price", Number.parseInt(e.target.value) || null)}
                      className="w-24"
                    />
                  ) : (
                    formatPrice(calf.price)
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {isEditing ? (
                    <Input
                      value={getPendingValue(calf.id, "buyer", calf.buyer) || ""}
                      onChange={(e) => onFieldUpdate(calf.id, "buyer", e.target.value || null)}
                      className="w-32"
                    />
                  ) : (
                    calf.buyer || "-"
                  )}
                </td>
                <td className="p-3 whitespace-nowrap" title={calf.sirePedigree || ""}>
                  {calf.sirePedigree ? <span className="truncate block max-w-24">{calf.sirePedigree}</span> : "-"}
                </td>
                <td className="p-3 whitespace-nowrap" title={calf.maternalGrandsire || ""}>
                  {calf.maternalGrandsire ? <span className="truncate block max-w-24">{calf.maternalGrandsire}</span> : "-"}
                </td>
                <td className="p-3 whitespace-nowrap" title={calf.maternalGreatGrandsire || ""}>
                  {calf.maternalGreatGrandsire ? <span className="truncate block max-w-24">{calf.maternalGreatGrandsire}</span> : "-"}
                </td>
                <td className="p-3 whitespace-nowrap" title={calf.maternalGreatGreatGrandsire || ""}>
                  {calf.maternalGreatGreatGrandsire ? <span className="truncate block max-w-24">{calf.maternalGreatGreatGrandsire}</span> : "-"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <Badge variant={calf.healthStatus === "HEALTHY" ? "default" : "destructive"}>
                    {calf.healthStatus === "HEALTHY" ? "健康" : "要確認"}
                  </Badge>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {isEditing ? (
                    <Input
                      value={getPendingValue(calf.id, "remarks", calf.remarks) || ""}
                      onChange={(e) => onFieldUpdate(calf.id, "remarks", e.target.value || null)}
                      className="w-32"
                    />
                  ) : (
                    <span className="truncate block max-w-32" title={calf.remarks || ""}>
                      {calf.remarks || "-"}
                    </span>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">{getStatusBadge(calf)}</td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    {isEditing ? (
                      <>
                        <Button size="sm" onClick={() => handleSave(calf.id)} disabled={isSaving}>
                          {isSaving ? "保存中..." : "保存"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onCancelEditing(calf.id)}>
                          キャンセル
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onStartEditing(calf.id)}>
                          編集
                        </Button>
                        {calf.auctionDate && (
                          <Button size="sm" variant="destructive" onClick={() => onCancelShipment(calf.id)}>
                            キャンセル
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {/* 新規行 */}
          {newRows.map((row) => (
            <tr key={row.id} className="border-b bg-blue-50">
              <td className="p-3">
                <Input
                  value={row.data.individualNumber || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "individualNumber", e.target.value)}
                  placeholder="個体番号"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Input
                  value={row.data.calfName || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "calfName", e.target.value)}
                  placeholder="子牛名"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Input
                  value={row.data.damName || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "damName", e.target.value)}
                  placeholder="母牛名"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Input
                  type="date"
                  value={row.data.birthDate || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "birthDate", e.target.value)}
                  className="w-32"
                />
              </td>
              <td className="p-3">
                <select
                  value={row.data.gender || "MALE"}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "gender", e.target.value as "MALE" | "FEMALE" | "CASTRATED")}
                  className="w-20 border rounded px-2 py-1"
                >
                  <option value="MALE">オス</option>
                  <option value="FEMALE">メス</option>
                  <option value="CASTRATED">去勢</option>
                </select>
              </td>
              <td className="p-3">
                <Input
                  type="number"
                  step="0.1"
                  value={row.data.weight || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "weight", e.target.value ? Number.parseFloat(e.target.value) : null)}
                  placeholder="体重"
                  className="w-20"
                />
              </td>
              <td className="p-3">
                <Input
                  type="date"
                  value={row.data.auctionDate || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "auctionDate", e.target.value)}
                  className="w-32"
                />
              </td>
              <td className="p-3">
                <Input
                  type="number"
                  value={row.data.price || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "price", e.target.value ? Number.parseFloat(e.target.value) : null)}
                  placeholder="価格"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Input
                  value={row.data.buyer || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "buyer", e.target.value)}
                  placeholder="購買者"
                  className="w-32"
                />
              </td>
              <td className="p-3">
                <Input
                  value={row.data.sirePedigree || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "sirePedigree", e.target.value)}
                  placeholder="父牛血統"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Input
                  value={row.data.maternalGrandsire || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "maternalGrandsire", e.target.value)}
                  placeholder="母の父血統"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Input
                  value={row.data.maternalGreatGrandsire || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "maternalGreatGrandsire", e.target.value)}
                  placeholder="母の祖父血統"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Input
                  value={row.data.maternalGreatGreatGrandsire || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "maternalGreatGreatGrandsire", e.target.value)}
                  placeholder="母の母の祖父血統"
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Badge variant="default">健康</Badge>
              </td>
              <td className="p-3">
                <Input
                  value={row.data.remarks || ""}
                  onChange={(e) => onNewRowFieldUpdate(row.id, "remarks", e.target.value)}
                  placeholder="備考"
                  className="w-32"
                />
              </td>
              <td className="p-3">
                <Badge variant="secondary">新規</Badge>
              </td>
              <td className="p-3">
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => onSaveNewRow(row.id)}>
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onRemoveNewRow(row.id)}>
                    削除
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
