'use client';

export function InputGroup({ label, type = 'text', placeholder, value, onChange, required = false, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 block">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-xs transition duration-150 focus:outline-none ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm'
        }`}
      />
    </div>
  );
}

export function SelectGroup({ label, value, onChange, options = [] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 block">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
}