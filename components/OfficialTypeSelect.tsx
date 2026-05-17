"use client";

import {
  CUSTOM_POSITION_VALUE,
  OFFICIAL_CATEGORY_OPTIONS,
  type OfficialCategoryOption,
} from "@/lib/position-options";

type Props = {
  category: string;
  designationMr: string;
  designationEn: string;
  onChange: (payload: {
    category: string;
    designationMr: string;
    designationEn: string;
    sortOrder: number;
  }) => void;
  disabled?: boolean;
};

/** Officials: pick role type → fills category + bilingual designation (shown on homepage). */
export default function OfficialTypeSelect({
  category,
  designationMr,
  designationEn,
  onChange,
  disabled,
}: Props) {
  const preset = OFFICIAL_CATEGORY_OPTIONS.find((o) => o.id === category);
  const designationsMatchPreset =
    !!preset &&
    preset.designationEn === designationEn.trim() &&
    preset.designationMr === designationMr.trim();
  const selectValue =
    preset && designationsMatchPreset ? preset.id : category || designationEn ? CUSTOM_POSITION_VALUE : "";
  const showCustomFields = selectValue === CUSTOM_POSITION_VALUE;

  const applyPreset = (opt: OfficialCategoryOption) => {
    onChange({
      category: opt.id,
      designationMr: opt.designationMr,
      designationEn: opt.designationEn,
      sortOrder: opt.displayOrder,
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <label className="text-xs font-medium text-gray-600">Official type / designation</label>
      <select
        value={selectValue === CUSTOM_POSITION_VALUE ? CUSTOM_POSITION_VALUE : selectValue}
        onChange={(e) => {
          const id = e.target.value;
          if (id === CUSTOM_POSITION_VALUE) {
            onChange({
              category: "staff",
              designationMr,
              designationEn,
              sortOrder: 99,
            });
            return;
          }
          const opt = OFFICIAL_CATEGORY_OPTIONS.find((o) => o.id === id);
          if (opt) applyPreset(opt);
        }}
        disabled={disabled}
        className="border rounded px-3 py-2 text-sm bg-white disabled:opacity-50"
      >
        <option value="">— Select official type —</option>
        <optgroup label="Village">
          {OFFICIAL_CATEGORY_OPTIONS.filter((o) => o.group === "village").map((o) => (
            <option key={o.id} value={o.id}>
              {o.labelMr} ({o.labelEn})
            </option>
          ))}
        </optgroup>
        <optgroup label="Staff">
          {OFFICIAL_CATEGORY_OPTIONS.filter((o) => o.group === "staff").map((o) => (
            <option key={o.id} value={o.id}>
              {o.labelMr} ({o.labelEn})
            </option>
          ))}
        </optgroup>
        <option value={CUSTOM_POSITION_VALUE}>Other (enter designation below)</option>
      </select>
      {showCustomFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            placeholder="Designation (Marathi)"
            value={designationMr}
            onChange={(e) =>
              onChange({
                category: category || "staff",
                designationMr: e.target.value,
                designationEn,
                sortOrder: 99,
              })
            }
            disabled={disabled}
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Designation (English)"
            value={designationEn}
            onChange={(e) =>
              onChange({
                category: category || "staff",
                designationMr,
                designationEn: e.target.value,
                sortOrder: 99,
              })
            }
            disabled={disabled}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      )}
      {preset && designationsMatchPreset && (
        <p className="text-xs text-gray-500">
          Homepage will show: <span className="font-medium">{preset.designationMr}</span> /{" "}
          {preset.designationEn}
        </p>
      )}
    </div>
  );
}
