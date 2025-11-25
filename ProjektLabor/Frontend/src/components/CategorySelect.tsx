import * as React from 'react'

export const CATEGORIES = ['Informatika', 'Pénzügy', 'Értékesítés', 'Gyártás', 'Oktatás'] as const

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  includeAllOption?: boolean // ha igaz, üres "Mind" opció is megjelenik
  error?: string
  labelClassName?: string 
}

export function CategorySelect({ label, includeAllOption, error, className, labelClassName, ...rest }: Props) {
  return (
    <div>
      {label && (
        <label className={["block text-sm font-medium mb-1", labelClassName ?? 'text-gray-700'].join(' ')}>{label}</label>
      )}
      <select
        {...rest}
        className={[
          'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100',
          className || ''
        ].join(' ')}
      >
        {includeAllOption && <option value="">Mind</option>}
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  )
}

export default CategorySelect
