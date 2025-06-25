'use client'

/* Küçük, tekrar-kullanılabilir sayı input’u */

interface Props {
  label    : string
  value    : number
  onChange : (v:number) => void
  min?     : number
}

export default function NumberInput({ label, value, onChange, min = 0 }: Props) {
  return (
    <label className="flex flex-col text-xs">
      <span className="mb-1">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        value={value}
        onChange={e => onChange(Math.max(min, Number(e.target.value)))}
        className="w-full rounded border border-gray-300 px-2 py-1 text-center text-sm"
      />
    </label>
  )
}
