"use client";

import {
  CUSTOM_POSITION_VALUE,
  type PositionOption,
} from "@/lib/position-options";

type Props = {
  label: string;
  /** Stored designation text (English label or custom string) */
  value: string;
  onChange: (designation: string, option: PositionOption | null) => void;
  options: PositionOption[];
  disabled?: boolean;
  required?: boolean;
};

/**
 * Dropdown of leader/official position types with optional custom designation.
 * Homepage shows whatever string is saved in `designation` — presets keep labels consistent.
 */
export default function PositionSelect({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
}: Props) {
  const preset = options.find(
    (o) => o.labelEn === value || o.labelMr === value || o.id === value
  );
  const selectValue = preset ? preset.id : value ? CUSTOM_POSITION_VALUE : "";

  const handleSelect = (selectedId: string) => {
    if (selectedId === CUSTOM_POSITION_VALUE) {
      onChange(value && !preset ? value : "", null);
      return;
    }
    const opt = options.find((o) => o.id === selectedId);
    if (opt) onChange(opt.labelEn, opt);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        value={selectValue}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={disabled}
        className="border rounded px-3 py-2 text-sm bg-white disabled:opacity-50"
      >
        <option value="">— Select position / leader type —</option>
        <optgroup label="Village leadership">
          {options
            .filter((o) => o.group === "village")
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.labelMr} ({o.labelEn})
              </option>
            ))}
        </optgroup>
        <optgroup label="State leadership">
          {options
            .filter((o) => o.group === "state")
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.labelMr} ({o.labelEn})
              </option>
            ))}
        </optgroup>
        {(options.some((o) => o.group === "staff") || options.some((o) => o.id.startsWith("db_"))) && (
          <optgroup label="Other / from website">
            {options
              .filter((o) => o.group === "staff" || o.id.startsWith("db_"))
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.labelMr} ({o.labelEn})
                </option>
              ))}
          </optgroup>
        )}
        <option value={CUSTOM_POSITION_VALUE}>Other (type custom designation)</option>
      </select>
      {selectValue === CUSTOM_POSITION_VALUE && (
        <input
          type="text"
          placeholder="Custom designation (shown on homepage)"
          value={value}
          onChange={(e) => onChange(e.target.value, null)}
          disabled={disabled}
          className="border rounded px-3 py-2 text-sm mt-1"
        />
      )}
    </div>
  );
}
