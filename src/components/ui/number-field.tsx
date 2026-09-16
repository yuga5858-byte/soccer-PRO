export function NumberField({
  name,
  label,
  defaultValue,
  step = 1,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: number | string;
  step?: number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="number"
        name={name}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="glass-panel !rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </label>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  placeholder,
  textarea,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className="glass-panel !rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="glass-panel !rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      )}
    </label>
  );
}
