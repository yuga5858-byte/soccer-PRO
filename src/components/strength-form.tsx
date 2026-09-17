"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { submitStrengthSession } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/number-field";
import { todayIso } from "@/lib/utils";

interface Row {
  key: number;
  exercise: string;
  weightKg: string;
  reps: string;
  sets: string;
}

const PRESETS = ["ベンチプレス", "スクワット", "デッドリフト", "懸垂"];

export function StrengthForm() {
  const [rows, setRows] = useState<Row[]>([{ key: 0, exercise: "", weightKg: "", reps: "", sets: "" }]);
  let nextKey = rows.length;

  const addRow = () => {
    setRows((r) => [...r, { key: nextKey++, exercise: "", weightKg: "", reps: "", sets: "" }]);
  };

  const removeRow = (key: number) => {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.key !== key) : r));
  };

  const update = (key: number, field: keyof Row, value: string) => {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  };

  return (
    <form
      action={async (formData) => {
        await submitStrengthSession(formData);
        setRows([{ key: 0, exercise: "", weightKg: "", reps: "", sets: "" }]);
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="date" value={todayIso()} />
      {rows.map((row) => (
        <div key={row.key} className="glass-panel flex flex-col gap-2 !p-3">
          <div className="flex items-center gap-2">
            <input
              name="exercise"
              list="exercise-presets"
              value={row.exercise}
              onChange={(e) => update(row.key, "exercise", e.target.value)}
              placeholder="種目 (例: ベンチプレス)"
              className="flex-1 rounded-lg bg-transparent px-2 py-1.5 text-sm outline-none"
            />
            <button type="button" onClick={() => removeRow(row.key)} className="text-[var(--foreground-muted)]">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              name="weightKg"
              type="number"
              value={row.weightKg}
              onChange={(e) => update(row.key, "weightKg", e.target.value)}
              placeholder="kg"
              className="rounded-lg bg-[var(--accent-soft)] px-2 py-1.5 text-center text-sm outline-none"
            />
            <input
              name="reps"
              type="number"
              value={row.reps}
              onChange={(e) => update(row.key, "reps", e.target.value)}
              placeholder="回数"
              className="rounded-lg bg-[var(--accent-soft)] px-2 py-1.5 text-center text-sm outline-none"
            />
            <input
              name="sets"
              type="number"
              value={row.sets}
              onChange={(e) => update(row.key, "sets", e.target.value)}
              placeholder="セット"
              className="rounded-lg bg-[var(--accent-soft)] px-2 py-1.5 text-center text-sm outline-none"
            />
          </div>
        </div>
      ))}
      <datalist id="exercise-presets">
        {PRESETS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <button
        type="button"
        onClick={addRow}
        className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border-subtle)] py-2 text-sm text-[var(--foreground-muted)]"
      >
        <Plus size={14} /> 種目を追加
      </button>
      <TextField name="notes" label="メモ" placeholder="任意" />
      <Button type="submit">筋トレを記録</Button>
    </form>
  );
}
