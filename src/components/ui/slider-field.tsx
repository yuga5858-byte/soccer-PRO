"use client";

import { useState } from "react";

export function SliderField({
  name,
  label,
  min = 0,
  max = 10,
  defaultValue = 0,
  suffix = "",
}: {
  name: string;
  label: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  suffix?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-[var(--accent)]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={1}
        defaultValue={defaultValue}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--border-subtle)] accent-[var(--accent)]"
      />
    </div>
  );
}
