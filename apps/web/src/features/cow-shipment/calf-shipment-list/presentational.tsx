"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CalfShipment, GetCalfShipmentsSuccess, ShipmentFilters, UpdateCalfShipmentParams } from "@/types/calf-shipment";
import { Check, ChevronRight, FileText, Home, Plus } from "lucide-react";
import Link from "next/link";
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
    cows,
    cowsLoading,
    selectCow,
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6">
        {/* ブレッドクラム */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                <Home className="w-3 h-3 mr-2.5" />
                ダッシュボード
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">出荷管理</span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">子牛一覧</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* ヘッダーセクション（フィルター含む） */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">子牛出荷管理</h2>
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* テーブル上部のアクションバー */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">出荷一覧</span>
            <Badge variant="secondary" className="px-2 py-0.5 text-xs font-medium">
              {pagination.total}件中 {calves.length}件表示
            </Badge>
            {pagination.hasNext && <span className="text-xs text-gray-500">スクロールでさらに読み込み</span>}
          </div>

          <div>
            <ShipmentFiltersComponent filters={currentFilters} onFilterChange={handleFilterChange} isLoading={isLoading} />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => addNewRow(filters.farmId)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" size="sm">
              <Plus className="w-3 h-3 mr-1" />
              新規追加
            </Button>
            {pendingChanges.length > 0 && (
              <Button onClick={handleBatchSave} className="bg-green-600 hover:bg-green-700 text-white shadow-sm" size="sm">
                <Check className="w-3 h-3 mr-1" />
                一括保存 ({pendingChanges.length})
              </Button>
            )}
          </div>
        </div>

        {/* メインテーブル */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <ShipmentTable
            calves={calves}
            editingRows={editingRows}
            pendingChanges={pendingChanges}
            newRows={newRows}
            cows={cows}
            cowsLoading={cowsLoading}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onUpdate={handleUpdate}
            onCancelShipment={handleCancelShipment}
            onFieldUpdate={updateField}
            onNewRowFieldUpdate={updateNewRowField}
            onSaveNewRow={handleSaveNewRow}
            onRemoveNewRow={removeNewRow}
            onSelectCow={selectCow}
          />
        </div>

        {/* ローディングインジケーター */}
        {isLoading && (
          <div className="mt-3 flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {/* 無限スクロール用のトリガー */}
        <div ref={loadMoreRef} className="h-2" />
      </div>
    </div>
  );
}
