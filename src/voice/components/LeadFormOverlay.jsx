/**
 * Full-screen lead form with blurred backdrop — responsive on all screen sizes.
 */
export default function LeadFormOverlay({ data, visible }) {
  if (!visible || !data) return null;

  const fields = [
    { label: 'Full Name', value: data.name },
    { label: 'Company', value: data.company },
    { label: 'Designation', value: data.designation },
    { label: 'Phone', value: data.phone },
    { label: 'Email', value: data.email },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        padding: 'max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))',
      }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl" aria-hidden="true" />

      <div
        className="relative w-full max-h-[min(92dvh,720px)] overflow-y-auto rounded-2xl bg-slate-900/92 border border-white/20 shadow-2xl pointer-events-auto
          max-w-[min(96vw,520px)] p-4
          sm:max-w-xl sm:p-6
          md:max-w-2xl md:p-8
          landscape:max-h-[88dvh] landscape:max-w-[min(70vw,640px)] landscape:py-4"
      >
        <div className="mb-4 sm:mb-6 text-center shrink-0">
          <p className="text-white text-base sm:text-xl md:text-2xl font-semibold leading-tight">
            Confirm Your Details
          </p>
          <p className="text-white/50 text-xs sm:text-sm mt-1">
            The assistant will read these back — verify verbally
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 sm:grid-cols-2 landscape:grid-cols-2">
          {fields.map(({ label, value }, i) => (
            <div
              key={label}
              className={`rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 sm:px-4 sm:py-3 md:py-4 ${
                i === 0 || i === fields.length - 1 ? 'sm:col-span-2 landscape:col-span-2' : ''
              }`}
            >
              <p className="text-white/45 text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1">
                {label}
              </p>
              <p className="text-white text-sm sm:text-base md:text-lg font-medium break-words leading-snug">
                {value || '—'}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-white/40 text-[10px] sm:text-xs md:text-sm mt-4 sm:mt-6 shrink-0">
          Say &quot;yes, correct&quot; to save · Say what to change if anything is wrong
        </p>
      </div>
    </div>
  );
}
