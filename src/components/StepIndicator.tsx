'use client';

interface StepIndicatorProps {
  currentStep: number; // 1, 2 veya 3
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = ['Bilgiler', 'Ödeme', 'Onay'];

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      {steps.map((label, idx) => {
        const step = idx + 1;
        const isActive = step === currentStep;
        return (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center 
                ${isActive ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-400 text-gray-400'}`}
            >
              {step}
            </div>
            <span className={`text-xs ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
