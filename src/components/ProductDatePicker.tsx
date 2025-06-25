'use client'

import { useState } from 'react'
import { DayPicker }    from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface Props {
  onSelect: (date: Date | undefined) => void
  disabled?: Date[]          // dolu günler
}

/* Tailwind teması */
const css = {
  caption: 'font-semibold text-primary',
  nav_button: 'hover:bg-primary/10 rounded-full p-2',
  day: 'w-9 h-9 text-sm',
  day_selected:
    'bg-primary text-white hover:bg-primary hover:text-white',
  day_today: 'border border-primary',
}

export default function ProductDatePicker({ onSelect, disabled }: Props) {
  const [selected, setSelected] = useState<Date>()

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={date => {
        setSelected(date)
        onSelect(date)
      }}
      disabled={disabled}
      classNames={css}
      locale={undefined /* default = en; istersen tr ekleriz */}
    />
  )
}
