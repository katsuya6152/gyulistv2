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
    updateField,
  };
}
