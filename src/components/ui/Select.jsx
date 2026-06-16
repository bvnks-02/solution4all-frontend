export default function Select({ label, id, value, onChange, options, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-900 text-base font-sans transition-all duration-200 focus:outline-none focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/20 hover:border-neutral-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
