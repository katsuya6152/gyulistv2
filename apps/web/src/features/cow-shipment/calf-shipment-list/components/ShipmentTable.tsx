// 出荷テーブルコンポーネント

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CalfShipment, UpdateCalfShipmentParams } from "@/types/calf-shipment";
import { Edit, MoreHorizontal, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Cow {
  id: string;
  individualNumber: string;
  name: string;
  birthDate: string;
  gender: string;
}

interface ShipmentTableProps {
  calves: CalfShipment[];
  editingRows: Set<string>;
  pendingChanges: UpdateCalfShipmentParams[];
  newRows: Array<{ id: string; data: Partial<CalfShipment> }>;
  cows: Cow[];
  cowsLoading: boolean;
  onStartEditing: (id: string) => void;
  onCancelEditing: (id: string) => void;
  onUpdate: (id: string, updates: UpdateCalfShipmentParams) => void;
  onCancelShipment: (id: string) => void;
  onFieldUpdate: (id: string, field: keyof UpdateCalfShipmentParams, value: string | number | null) => void;
  onNewRowFieldUpdate: (id: string, field: keyof CalfShipment, value: string | number | null) => void;
  onSaveNewRow: (id: string) => void;
  onRemoveNewRow: (id: string) => void;
  onSelectCow: (id: string, cowId: string) => void;
}

export function ShipmentTable({
  calves,
  editingRows,
  pendingChanges,
  newRows,
  cows,
  cowsLoading,
  onStartEditing,
  onCancelEditing,
  onUpdate,
  onCancelShipment,
  onFieldUpdate,
  onNewRowFieldUpdate,
  onSaveNewRow,
  onRemoveNewRow,
  onSelectCow,
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

  const calculateAgeInDays = (birthDate: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = today.getTime() - birth.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
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
    <div className="relative">
      <div className="overflow-x-auto overflow-y-visible rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full min-w-[1800px] border-collapse bg-white">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">個体番号</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 before:content-[''] before:absolute before:right-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-300 before:z-20">
                子牛名
              </th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">父牛</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母の父</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母の祖父</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母の母の祖父</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母牛名</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">母牛個体番号</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">生年月日</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">性別</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">体重</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">日齢</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">種付日</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">出産予定日</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">せり年月日</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">価格</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">購買者</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">健康状態</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">備考</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">状態</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-300 before:z-20">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {calves.map((calf) => {
              const isEditing = editingRows.has(calf.id);
              const isSaving = savingRows.has(calf.id);

              return (
                <tr
                  key={calf.id}
                  className={`border-b border-gray-100 hover:bg-gray-50/80 transition-all duration-200 group ${
                    isEditing ? "bg-blue-50/40 shadow-sm" : ""
                  } ${isSaving ? "opacity-60" : ""}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">{calf.individualNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-medium sticky left-0 bg-white z-10 before:content-[''] before:absolute before:right-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-300 before:z-20">
                    {calf.calfName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.sirePedigree || ""}>
                    {calf.sirePedigree ? (
                      <span className="truncate block max-w-20">{calf.sirePedigree}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.maternalGrandsire || ""}>
                    {calf.maternalGrandsire ? (
                      <span className="truncate block max-w-20">{calf.maternalGrandsire}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.maternalGreatGrandsire || ""}>
                    {calf.maternalGreatGrandsire ? (
                      <span className="truncate block max-w-20">{calf.maternalGreatGrandsire}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600" title={calf.maternalGreatGreatGrandsire || ""}>
                    {calf.maternalGreatGreatGrandsire ? (
                      <span className="truncate block max-w-20">{calf.maternalGreatGreatGrandsire}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <a
                      href={`/cow-shipment-management/${calf.damId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150 font-medium"
                    >
                      {calf.damName}
                    </a>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {calf.damIndividualNumber || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{formatDate(calf.birthDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        calf.gender === "FEMALE"
                          ? "bg-pink-100 text-pink-800"
                          : calf.gender === "MALE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getGenderLabel(calf.gender)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={getPendingValue(calf.id, "weight", calf.weight) || ""}
                        onChange={(e) => onFieldUpdate(calf.id, "weight", Number.parseFloat(e.target.value) || null)}
                        className="w-16 h-6 text-xs"
                      />
                    ) : (
                      <span className="text-gray-600">{formatWeight(calf.weight)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                    {calf.ageInDays ? `${calf.ageInDays}日` : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{formatDate(calf.matingDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{formatDate(calf.expectedBirthDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                      <Input
                        type="date"
                        value={getPendingValue(calf.id, "auctionDate", calf.auctionDate) || ""}
                        onChange={(e) => onFieldUpdate(calf.id, "auctionDate", e.target.value || null)}
                        className="w-28 h-6 text-xs"
                      />
                    ) : (
                      <span className="text-gray-600">{formatDate(calf.auctionDate)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={getPendingValue(calf.id, "price", calf.price) || ""}
                        onChange={(e) => onFieldUpdate(calf.id, "price", Number.parseInt(e.target.value) || null)}
                        className="w-20 h-6 text-xs"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">{formatPrice(calf.price)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                      <Input
                        value={getPendingValue(calf.id, "buyer", calf.buyer) || ""}
                        onChange={(e) => onFieldUpdate(calf.id, "buyer", e.target.value || null)}
                        className="w-24 h-6 text-xs"
                      />
                    ) : (
                      <span className="text-gray-600">{calf.buyer || <span className="text-gray-400">-</span>}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <Badge variant={calf.healthStatus === "HEALTHY" ? "default" : "destructive"} className="text-xs px-1.5 py-0.5">
                      {calf.healthStatus === "HEALTHY" ? "健康" : "要確認"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {isEditing ? (
                      <Input
                        value={getPendingValue(calf.id, "remarks", calf.remarks) || ""}
                        onChange={(e) => onFieldUpdate(calf.id, "remarks", e.target.value || null)}
                        className="w-24 h-6 text-xs"
                      />
                    ) : (
                      <span className="truncate block max-w-24 text-gray-600" title={calf.remarks || ""}>
                        {calf.remarks || <span className="text-gray-400">-</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{getStatusBadge(calf)}</td>
                  <td className="px-3 py-2 whitespace-nowrap sticky right-0 bg-white z-10 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-300 before:z-20">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isEditing ? (
                            <>
                              <DropdownMenuItem onClick={() => handleSave(calf.id)} disabled={isSaving}>
                                <Edit className="mr-2 h-4 w-4" />
                                {isSaving ? "保存中..." : "保存"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onCancelEditing(calf.id)}>
                                <X className="mr-2 h-4 w-4" />
                                キャンセル
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => onStartEditing(calf.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              {calf.auctionDate && (
                                <DropdownMenuItem onClick={() => onCancelShipment(calf.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  削除
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* 新規行 */}
            {newRows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 bg-gradient-to-r from-blue-50/40 to-indigo-50/30 hover:from-blue-50/60 hover:to-indigo-50/50 transition-all duration-200 group"
              >
                <td className="px-4 py-3">
                  <Input
                    value={row.data.individualNumber || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "individualNumber", e.target.value)}
                    placeholder="個体番号"
                    className="w-24 h-8 text-sm"
                  />
                </td>
                <td className="px-4 py-3 sticky left-0 bg-gradient-to-r from-blue-50/40 to-indigo-50/30 z-10 before:content-[''] before:absolute before:right-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-300 before:z-20">
                  <Input
                    value={row.data.calfName || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "calfName", e.target.value)}
                    placeholder="子牛名"
                    className="w-24 h-8 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    value={row.data.sirePedigree || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "sirePedigree", e.target.value)}
                    placeholder="父牛血統"
                    className="w-24 h-8 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    value={row.data.maternalGrandsire || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "maternalGrandsire", e.target.value)}
                    placeholder="母の父血統"
                    className="w-24 h-8 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <Input
                    value={row.data.maternalGreatGrandsire || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "maternalGreatGrandsire", e.target.value)}
                    placeholder="母の祖父血統"
                    className="w-24 h-8 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={row.data.maternalGreatGreatGrandsire || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "maternalGreatGreatGrandsire", e.target.value)}
                    placeholder="母の母の祖父血統"
                    className="w-20 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <Select value={row.data.damId || "none"} onValueChange={(value) => onSelectCow(row.id, value === "none" ? "" : value)}>
                    <SelectTrigger className="w-28 h-6 text-xs">
                      <SelectValue placeholder="母牛を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">選択なし</SelectItem>
                      {cowsLoading ? (
                        <SelectItem value="loading" disabled>
                          読み込み中...
                        </SelectItem>
                      ) : (
                        cows.map((cow) => (
                          <SelectItem key={cow.id} value={cow.id}>
                            {cow.name} ({cow.individualNumber})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-gray-600">
                    {row.data.damId ? cows.find((cow) => cow.id === row.data.damId)?.individualNumber || "-" : "-"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="date"
                    value={row.data.birthDate || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "birthDate", e.target.value)}
                    className="w-28 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={row.data.gender || "MALE"}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "gender", e.target.value as "MALE" | "FEMALE" | "CASTRATED")}
                    className="w-16 border rounded px-1.5 py-0.5 h-6 text-xs"
                  >
                    <option value="MALE">オス</option>
                    <option value="FEMALE">メス</option>
                    <option value="CASTRATED">去勢</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={row.data.weight || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "weight", e.target.value ? Number.parseFloat(e.target.value) : null)}
                    placeholder="体重"
                    className="w-16 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-gray-600">
                    {row.data.birthDate
                      ? (() => {
                          const ageInDays = calculateAgeInDays(row.data.birthDate);
                          return ageInDays !== null ? `${ageInDays}日` : "-";
                        })()
                      : "-"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="date"
                    value={row.data.matingDate || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "matingDate", e.target.value)}
                    className="w-28 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="date"
                    value={row.data.expectedBirthDate || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "expectedBirthDate", e.target.value)}
                    className="w-28 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="date"
                    value={row.data.auctionDate || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "auctionDate", e.target.value)}
                    className="w-28 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={row.data.price || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "price", e.target.value ? Number.parseFloat(e.target.value) : null)}
                    placeholder="価格"
                    className="w-20 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={row.data.buyer || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "buyer", e.target.value)}
                    placeholder="購買者"
                    className="w-24 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <Badge variant="default" className="text-xs px-1.5 py-0.5">
                    健康
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={row.data.remarks || ""}
                    onChange={(e) => onNewRowFieldUpdate(row.id, "remarks", e.target.value)}
                    placeholder="備考"
                    className="w-24 h-6 text-xs"
                  />
                </td>
                <td className="px-3 py-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    新規
                  </Badge>
                </td>
                <td className="px-3 py-2 sticky right-0 bg-gradient-to-r from-blue-50/40 to-indigo-50/30 z-10 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-300 before:z-20">
                  <div className="flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSaveNewRow(row.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          保存
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRemoveNewRow(row.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
