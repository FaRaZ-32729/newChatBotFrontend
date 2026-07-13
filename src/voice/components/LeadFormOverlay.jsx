import { useEffect, useState } from 'react';

/**
 * Full-screen lead form — editable confirmation after voice or card scan.
 */
export default function LeadFormOverlay({
  data,
  visible,
  editable = true,
  submitting = false,
  onConfirm,
  onRescan,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    designation: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name || '',
      company: data.company || '',
      designation: data.designation || '',
      phone: data.phone || '',
      email: data.email || '',
    });
    setErrors({});
  }, [data]);

  if (!visible || !data) return null;

  const fields = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'company', label: 'Company', required: false },
    { key: 'designation', label: 'Designation', required: false },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'email', label: 'Email', required: true },
  ];

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      next.name = 'Name is required';
    }
    if (!form.phone.trim()) {
      next.phone = 'Phone is required';
    } else if (form.phone.replace(/\D/g, '').length < 7) {
      next.phone = 'Enter a valid phone number';
    }
    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm?.({
      name: form.name.trim(),
      company: form.company.trim(),
      designation: form.designation.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        padding:
          'max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left))',
      }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl" aria-hidden="true" />

      <div
        className="relative w-full max-h-[min(92dvh,720px)] overflow-y-auto rounded-2xl bg-slate-900/92 border border-white/20 shadow-2xl
          max-w-[min(96vw,520px)] p-4
          sm:max-w-xl sm:p-6
          md:max-w-2xl md:p-8"
      >
        <div className="mb-4 sm:mb-6 text-center">
          <p className="text-white text-base sm:text-xl md:text-2xl font-semibold leading-tight">
            Confirm Your Details
          </p>
          <p className="text-white/50 text-xs sm:text-sm mt-1">
            {editable
              ? 'Review and edit if needed, then confirm'
              : 'Verify with the assistant verbally'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 sm:grid-cols-2">
          {fields.map(({ key, label, required }, i) => (
            <div
              key={key}
              className={`rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 sm:px-4 sm:py-3 ${
                i === 0 || key === 'email' ? 'sm:col-span-2' : ''
              } ${errors[key] ? 'border-rose-400/60' : ''}`}
            >
              <label className="text-white/45 text-[10px] sm:text-xs uppercase tracking-wide mb-0.5 sm:mb-1 block">
                {label}
                {required ? ' *' : ''}
              </label>
              {editable ? (
                <input
                  type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                  value={form[key]}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, [key]: e.target.value }));
                    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
                  }}
                  className="w-full bg-transparent text-white text-sm sm:text-base md:text-lg font-medium outline-none placeholder:text-white/25"
                  placeholder={label}
                  disabled={submitting}
                />
              ) : (
                <p className="text-white text-sm sm:text-base md:text-lg font-medium break-words">
                  {form[key] || '—'}
                </p>
              )}
              {errors[key] && (
                <p className="text-rose-400 text-[10px] sm:text-xs mt-1">{errors[key]}</p>
              )}
            </div>
          ))}
        </div>

        {editable ? (
          <div className="flex flex-wrap gap-3 mt-5 sm:mt-6 justify-center">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm sm:text-base font-medium disabled:opacity-50 hover:bg-emerald-500"
            >
              {submitting ? 'Saving…' : 'Confirm & Save'}
            </button>
            {onRescan && (
              <button
                type="button"
                onClick={onRescan}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm sm:text-base disabled:opacity-50"
              >
                Rescan Card
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-white/70 text-sm sm:text-base disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-white/40 text-[10px] sm:text-xs md:text-sm mt-4 sm:mt-6">
            Say &quot;yes, correct&quot; to save · Say what to change if anything is wrong
          </p>
        )}
      </div>
    </div>
  );
}
