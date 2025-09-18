// インライン編集フック

import type { CalfShipment, UpdateCalfShipmentParams } from "@/types/calf-shipment";
import { useCallback, useState } from "react";

// interface EditingRow {
//   id: string;
//   data: Partial<UpdateCalfShipmentParams>;
// }

interface NewRow {
  id: string;
  data: Partial<CalfShipment>;
}

export function useInlineEditing() {
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [newRows, setNewRows] = useState<NewRow[]>([]);
  const [pendingChanges, setPendingChanges] = useState<UpdateCalfShipmentParams[]>([]);

  // 編集開始
  const startEditing = useCallback((id: string) => {
    setEditingRows((prev) => new Set(Array.from(prev).concat(id)));
  }, []);

  // 編集キャンセル
  const cancelEditing = useCallback((id: string) => {
    setEditingRows((prev) => {
      const newSet = new Set(Array.from(prev));
      newSet.delete(id);
      return newSet;
    });

    // 保留中の変更を削除
    setPendingChanges((prev) => prev.filter((change) => change.id !== id));
  }, []);

  // フィールド更新
  const updateField = useCallback((id: string, field: keyof UpdateCalfShipmentParams, value: string | number | null) => {
    const updateData = { id, [field]: value };

    setPendingChanges((prev) => {
      const existingIndex = prev.findIndex((change) => change.id === id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], [field]: value };
        return updated;
      }
      return [...prev, updateData];
    });
  }, []);

  // 新規行フィールド更新
  const updateNewRowField = useCallback((id: string, field: keyof CalfShipment, value: string | number | null) => {
    setNewRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              data: {
                ...row.data,
                [field]: value,
              },
            }
          : row
      )
    );
  }, []);

  // 新規行追加
  const addNewRow = useCallback(() => {
    const newId = `new-${Date.now()}`;
    const newRow: NewRow = {
      id: newId,
      data: {
        individualNumber: "",
        calfName: "",
        damName: "",
        birthDate: "",
        gender: "MALE",
        weight: null,
        auctionDate: null,
        price: null,
        buyer: null,
        remarks: null,
      },
    };
    setNewRows((prev) => [...prev, newRow]);
  }, []);

  // 新規行削除
  const removeNewRow = useCallback((id: string) => {
    setNewRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  // 新規行保存（個別にAPI呼び出し）
  const saveNewRow = useCallback(
    async (id: string, onSuccess?: (data: any) => void, onError?: (error: string) => void) => {
      const row = newRows.find((r) => r.id === id);
      if (!row) {
        console.error("Row not found for id:", id);
        onError?.("行が見つかりません");
        return;
      }

      try {
        // 必須フィールドのバリデーション
        if (!row.data.individualNumber?.trim()) {
          throw new Error("個体識別番号は必須です");
        }
        if (!row.data.calfName?.trim()) {
          throw new Error("子牛名は必須です");
        }
        if (!row.data.birthDate?.trim()) {
          throw new Error("生年月日は必須です");
        }

        // 日付形式のバリデーション
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row.data.birthDate.trim())) {
          throw new Error("生年月日はYYYY-MM-DD形式で入力してください");
        }
        if (!row.data.gender) {
          throw new Error("性別は必須です");
        }

        // 新規作成用のデータを準備
        const createData = {
          individualNumber: row.data.individualNumber.trim(),
          calfName: row.data.calfName.trim(),
          damName: row.data.damName?.trim() || undefined,
          birthDate: row.data.birthDate.trim(),
          gender: row.data.gender,
          // 血統情報
          sirePedigree: row.data.sirePedigree?.trim() || undefined,
          maternalGrandsire: row.data.maternalGrandsire?.trim() || undefined,
          maternalGreatGrandsire: row.data.maternalGreatGrandsire?.trim() || undefined,
          maternalGreatGreatGrandsire: row.data.maternalGreatGreatGrandsire?.trim() || undefined,
          // 繁殖・出産情報
          matingDate: row.data.matingDate?.trim() || undefined,
          expectedBirthDate: row.data.expectedBirthDate?.trim() || undefined,
          matingInterval: row.data.matingInterval || undefined,
          // 個体情報
          weight: row.data.weight || undefined,
          ageInDays: row.data.ageInDays || undefined,
          // 取引情報
          auctionDate: row.data.auctionDate?.trim() || undefined,
          price: row.data.price || undefined,
          buyer: row.data.buyer?.trim() || undefined,
          remarks: row.data.remarks?.trim() || undefined,
          farmId: "550e8400-e29b-41d4-a716-446655440001", // デフォルトの農場ID
        };

        // createCalfShipmentActionを使用してAPI呼び出し
        const { createCalfShipmentAction } = await import("../actions");
        const result = await createCalfShipmentAction(createData);

        if (!result.success) {
          const errorMessage = result.error || "子牛の作成に失敗しました";
          console.error("Create calf shipment failed:", errorMessage);
          throw new Error(errorMessage);
        }

        // 成功時は新規行を削除
        setNewRows((prev) => prev.filter((r) => r.id !== id));
        onSuccess?.(result.data);
      } catch (error) {
        console.error("Create calf shipment error:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          error: error,
        });
        onError?.(error instanceof Error ? error.message : "子牛出荷の作成に失敗しました");
      }
    },
    [newRows]
  );

  // 変更保存
  const saveChanges = useCallback(() => {
    setEditingRows(new Set());
    setNewRows([]);
    setPendingChanges([]);
  }, []);

  // 個別保存
  const saveSingle = useCallback((id: string) => {
    setEditingRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    setPendingChanges((prev) => prev.filter((change) => change.id !== id));
  }, []);

  return {
    editingRows,
    newRows,
    pendingChanges,
    startEditing,
    cancelEditing,
    saveChanges,
    saveSingle,
    addNewRow,
    removeNewRow,
    saveNewRow,
    updateField,
    updateNewRowField,
  };
}
