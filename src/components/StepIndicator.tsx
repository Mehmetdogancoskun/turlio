/* ────────────────────────────────────────────────
   src/components/StepIndicator.tsx
──────────────────────────────────────────────── */

'use client'

interface StepIndicatorProps {
  /** 1 = Ürün • 2 = Bilgiler • 3 = Ödeme • 4 = Onay */
  currentStep: 1 | 2 | 3 | 4
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  /* Dört adımlı yeni dizi */
  const steps = ['Ürün', 'Bilgiler', 'Ödeme', 'Onay'] as const

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      {steps.map((label, idx) => {
        const step      = idx + 1
        const isActive  = step === currentStep
        const completed = step <  currentStep

        return (
          <div key={label} className="flex flex-col items-center">
            {/* daire */}
            <div
              className={[
                'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                isActive
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : completed
                  ? 'border-emerald-300 bg-emerald-300 text-white'
                  : 'border-gray-400 text-gray-400',
              ].join(' ')}
            >
              {step}
            </div>
            {/* etiket */}
            <span
              className={`text-xs ${
                isActive
                  ? 'text-emerald-600'
                  : completed
                  ? 'text-emerald-500'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
