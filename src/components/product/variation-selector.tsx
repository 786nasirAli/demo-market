'use client';

import React from 'react';
import { SelectedOptionDetail, VariationGroup } from '@/lib/types';
import { formatGBP } from '@/lib/pricing';
import { Check } from 'lucide-react';

interface VariationSelectorProps {
  groups: VariationGroup[];
  selectedOptions: Record<string, SelectedOptionDetail>;
  onSelectOption: (groupName: string, detail: SelectedOptionDetail) => void;
  onToggleAssembly: (checked: boolean) => void;
  assemblyChecked: boolean;
}

export function VariationSelector({
  groups,
  selectedOptions,
  onSelectOption,
  onToggleAssembly,
  assemblyChecked,
}: VariationSelectorProps) {
  // Sort groups by displayOrder
  const sortedGroups = [...groups].sort((a, b) => a.displayOrder - b.displayOrder);

  const colourGroup = sortedGroups.find((g) => g.name.toLowerCase() === 'colour');
  const sizeGroup = sortedGroups.find((g) => g.name.toLowerCase() === 'size');
  const storageGroup = sortedGroups.find((g) => g.name.toLowerCase() === 'storage');
  const headboardGroup = sortedGroups.find((g) => g.name.toLowerCase() === 'headboard');
  const baseGroup = sortedGroups.find((g) => g.name.toLowerCase() === 'base');
  const assemblyGroup = sortedGroups.find((g) => g.name.toLowerCase() === 'assembly');

  return (
    <div className="flex flex-col gap-6 w-full text-neutral-900">
      {/* 1. COLOUR SWATCHES (Required round/square swatches with live selected name next to label) */}
      {colourGroup && (
        <div className="space-y-3 pb-2 border-b border-neutral-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <span>Colour:</span>
              <span className="text-emerald-700 font-extrabold">
                {selectedOptions['Colour']?.label || 'Select Colour'}
              </span>
            </span>
            <span className="text-xs text-neutral-500 font-medium">Naples Fabric Collection</span>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {colourGroup.options.map((opt) => {
              const isSelected = selectedOptions['Colour']?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onSelectOption('Colour', {
                      groupId: colourGroup.id,
                      groupName: 'Colour',
                      optionId: opt.id,
                      label: opt.label,
                      extraPrice: opt.extraPrice,
                      swatchHex: opt.swatchHex,
                    })
                  }
                  className={`group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full cursor-pointer transition-all min-h-[44px] min-w-[44px] shadow-xs ${
                    isSelected
                      ? 'ring-3 ring-emerald-600 ring-offset-2 scale-105'
                      : 'border-2 border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: opt.swatchHex || '#E5E7EB' }}
                  title={`${opt.label}${opt.extraPrice > 0 ? ` (+${formatGBP(opt.extraPrice)})` : ''}`}
                  aria-label={`Select colour ${opt.label}`}
                >
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SIZE OPTIONS */}
      {sizeGroup && (
        <div className="space-y-3 pb-2 border-b border-neutral-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-900">
              Size:{' '}
              <span className="text-emerald-700 font-semibold">
                {selectedOptions['Size']?.label || 'Select Size'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sizeGroup.options.map((opt) => {
              const isSelected = selectedOptions['Size']?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onSelectOption('Size', {
                      groupId: sizeGroup.id,
                      groupName: 'Size',
                      optionId: opt.id,
                      label: opt.label,
                      extraPrice: opt.extraPrice,
                    })
                  }
                  className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between cursor-pointer transition-all min-h-[56px] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-neutral-900">{opt.label}</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    +{formatGBP(opt.extraPrice)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. STORAGE OPTIONS */}
      {storageGroup && (
        <div className="space-y-3 pb-2 border-b border-neutral-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-900">
              Storage:{' '}
              <span className="text-emerald-700 font-semibold">
                {selectedOptions['Storage']?.label || 'Select Storage'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {storageGroup.options.map((opt) => {
              const isSelected = selectedOptions['Storage']?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onSelectOption('Storage', {
                      groupId: storageGroup.id,
                      groupName: 'Storage',
                      optionId: opt.id,
                      label: opt.label,
                      extraPrice: opt.extraPrice,
                    })
                  }
                  className={`p-3 rounded-xl border-2 text-left flex items-center justify-between cursor-pointer transition-all min-h-[48px] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-neutral-800">{opt.label}</span>
                  <span className="text-xs font-semibold text-emerald-700 shrink-0">
                    {opt.extraPrice === 0 ? 'FREE' : `+${formatGBP(opt.extraPrice)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. HEADBOARD OPTIONS */}
      {headboardGroup && (
        <div className="space-y-3 pb-2 border-b border-neutral-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-900">
              Headboard:{' '}
              <span className="text-emerald-700 font-semibold">
                {selectedOptions['Headboard']?.label || 'Select Headboard'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {headboardGroup.options.map((opt) => {
              const isSelected = selectedOptions['Headboard']?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onSelectOption('Headboard', {
                      groupId: headboardGroup.id,
                      groupName: 'Headboard',
                      optionId: opt.id,
                      label: opt.label,
                      extraPrice: opt.extraPrice,
                    })
                  }
                  className={`p-3 rounded-xl border-2 text-left flex items-center justify-between cursor-pointer transition-all min-h-[48px] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-neutral-800">{opt.label}</span>
                  <span className="text-xs font-semibold text-emerald-700 shrink-0">
                    {opt.extraPrice === 0 ? 'FREE' : `+${formatGBP(opt.extraPrice)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. BASE OPTIONS */}
      {baseGroup && (
        <div className="space-y-3 pb-2 border-b border-neutral-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-900">
              Base:{' '}
              <span className="text-emerald-700 font-semibold">
                {selectedOptions['Base']?.label || 'Select Base'}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {baseGroup.options.map((opt) => {
              const isSelected = selectedOptions['Base']?.optionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onSelectOption('Base', {
                      groupId: baseGroup.id,
                      groupName: 'Base',
                      optionId: opt.id,
                      label: opt.label,
                      extraPrice: opt.extraPrice,
                    })
                  }
                  className={`p-3 rounded-xl border-2 text-left flex items-center justify-between cursor-pointer transition-all min-h-[48px] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-neutral-800">{opt.label}</span>
                  <span className="text-xs font-semibold text-emerald-700 shrink-0">
                    {opt.extraPrice === 0 ? 'Included' : `+${formatGBP(opt.extraPrice)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. ASSEMBLY ADD-ON (Optional Checkbox +£39.99) */}
      {assemblyGroup && (
        <div className="pt-1">
          {assemblyGroup.options.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none min-h-[50px] ${
                assemblyChecked
                  ? 'border-emerald-600 bg-emerald-50/60'
                  : 'border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={assemblyChecked}
                  onChange={(e) => onToggleAssembly(e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-sm block text-neutral-900">
                    {opt.label}
                  </span>
                  <span className="text-xs text-neutral-500">
                    Expert bedroom assembly & packaging removal
                  </span>
                </div>
              </div>
              <span className="font-bold text-sm text-emerald-700 shrink-0">
                +{formatGBP(opt.extraPrice)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
