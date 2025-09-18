"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CalfShipment, GetCalfShipmentsSuccess, ShipmentFilters, UpdateCalfShipmentParams } from "@/types/calf-shipment";
import { useCallback, useEffect, useRef, useState } from "react";
import { batchUpdateCalfShipmentsAction, cancelCalfShipmentAction, getCalfShipmentsAction, updateCalfShipmentAction } from "./actions";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ShipmentFiltersComponent } from "./components/ShipmentFilters";
import { ShipmentTable } from "./components/ShipmentTable";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { useInlineEditing } from "./hooks/useInlineEditing";

interface CalfShipmentListPresentationProps {
  initialData: GetCalfShipmentsSuccess;
  filters: ShipmentFilters;
  limit: number;
}

export default function CalfShipmentListPresentation({ initialData, filters, limit }: CalfShipmentListPresentationProps) {
  const [calves, setCalves] = useState<CalfShipment[]>(initialData.data.calves);
  const [pagination, setPagination] = useState(initialData.data.pagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ShipmentFilters>(filters);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 無限スクロールの実装
  const loadMore = useCallback(async () => {
    if (isLoading || !pagination.hasNext) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCalfShipmentsAction({
        ...currentFilters,
        cursor: pagination.nextCursor,
        limit: limit,
      });

      if (result.success && result.data) {
        setCalves((prev) => [...prev, ...result.data.data.calves]);
        setPagination(result.data.data.pagination);
      } else {
        setError(result.error || "データの読み込みに失敗しました");
      }
    } catch (err) {
      console.error("Load more error:", err);
      setError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pagination.hasNext, pagination.nextCursor, currentFilters, limit]);

  // 無限スクロールフック
  useInfiniteScroll(loadMoreRef, loadMore, isLoading);

  // フィルター変更時の処理
  const handleFilterChange = useCallback(
    async (newFilters: ShipmentFilters) => {
      setCurrentFilters(newFilters);
      setIsLoading(true);
      setError(null);

      try {
        const result = await getCalfShipmentsAction({
          ...newFilters,
          limit: limit,
        });

        if (result.success && result.data) {
          setCalves(result.data.data.calves);
          setPagination(result.data.data.pagination);
        } else {
          setError(result.error || "フィルターの適用に失敗しました");
        }
      } catch (err) {
        console.error("Filter change error:", err);
        setError(err instanceof Error ? err.message : "フィルターの適用に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  // インライン編集の実装
  const {
    editingRows,
    newRows,
    pendingChanges,
    startEditing,
    cancelEditing,
    saveChanges,
    addNewRow,
    removeNewRow,
    saveNewRow,
    updateField,
    updateNewRowField,
  } = useInlineEditing();

  // 個別更新の処理
  const handleUpdate = useCallback(async (id: string, updates: Omit<UpdateCalfShipmentParams, "id">) => {
    try {
      console.log("Updating calf:", id, updates);
      const result = await updateCalfShipmentAction(id, updates);

      if (result.success && result.data) {
        setCalves((prev) => prev.map((calf) => (calf.id === id ? result.data : calf)));
      } else {
        setError(result.error || "更新に失敗しました");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  }, []);

  // 出荷キャンセルの処理
  const handleCancelShipment = useCallback(async (id: string) => {
    try {
      const result = await cancelCalfShipmentAction(id);

      if (result.success && result.data) {
        setCalves((prev) => prev.map((calf) => (calf.id === id ? result.data : calf)));
      } else {
        setError(result.error || "キャンセルに失敗しました");
      }
    } catch (err) {
      console.error("Cancel shipment error:", err);
      setError(err instanceof Error ? err.message : "キャンセルに失敗しました");
    }
  }, []);

  // 新規行保存の処理
  const handleSaveNewRow = useCallback(
    async (id: string) => {
      try {
        await saveNewRow(
          id,
          () => {
            // 成功時はデータを再取得
            getCalfShipmentsAction({
              ...currentFilters,
              limit: calves.length,
            }).then((result) => {
              if (result.success && result.data) {
                setCalves(result.data.data.calves);
              }
            });
          },
          (error) => {
            setError(error);
          }
        );
      } catch (err) {
        console.error("Save new row error:", err);
        setError(err instanceof Error ? err.message : "新規行の保存に失敗しました");
      }
    },
    [saveNewRow, currentFilters, calves.length]
  );

  // 一括保存の処理
  const handleBatchSave = useCallback(async () => {
    if (pendingChanges.length === 0) return;

    try {
      const result = await batchUpdateCalfShipmentsAction({
        updates: pendingChanges,
      });

      if (result.success) {
        // 更新されたデータを再取得
        const refreshResult = await getCalfShipmentsAction({
          ...currentFilters,
          limit: calves.length,
        });

        if (refreshResult.success && refreshResult.data) {
          setCalves(refreshResult.data.data.calves);
        } else {
          setError(refreshResult.error || "データの再取得に失敗しました");
        }

        // 編集状態をリセット
        saveChanges();
      } else {
        setError(result.error || "一括保存に失敗しました");
      }
    } catch (err) {
      console.error("Batch save error:", err);
      setError(err instanceof Error ? err.message : "一括保存に失敗しました");
    }
  }, [pendingChanges, currentFilters, calves.length, saveChanges]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">子牛出荷管理</h1>
        <div className="flex gap-2">
          <Button onClick={addNewRow} variant="outline">
            新規追加
          </Button>
          {pendingChanges.length > 0 && (
            <Button onClick={handleBatchSave} className="bg-blue-600 hover:bg-blue-700">
              一括保存 ({pendingChanges.length})
            </Button>
          )}
        </div>
      </div>

      <ShipmentFiltersComponent filters={currentFilters} onFilterChange={handleFilterChange} isLoading={isLoading} />

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>出荷一覧</span>
            <Badge variant="secondary">
              {pagination.total}件中 {calves.length}件表示
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentTable
            calves={calves}
            editingRows={editingRows}
            pendingChanges={pendingChanges}
            newRows={newRows}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onUpdate={handleUpdate}
            onCancelShipment={handleCancelShipment}
            onFieldUpdate={updateField}
            onNewRowFieldUpdate={updateNewRowField}
            onSaveNewRow={handleSaveNewRow}
            onRemoveNewRow={removeNewRow}
          />
        </CardContent>
      </Card>

      {isLoading && <LoadingSpinner />}

      <div ref={loadMoreRef} className="h-4" />
    </div>
  );
}
