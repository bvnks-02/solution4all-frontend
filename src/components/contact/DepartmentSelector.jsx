const departments = [
  { value: 'general', label: 'Contact général' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'technical', label: 'Technique' },
];

export default function DepartmentSelector({ value, onChange, error }) {
  return (
    <div>
      <label htmlFor="department" className="block text-xs font-semibold uppercase tracking-widest text-neutral-700 mb-1.5">
        Département *
      </label>
      <select
        id="department"
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-4 py-3 text-neutral-900 text-base font-sans bg-neutral-100 transition-all duration-200 focus:outline-none focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/20 ${
          error ? 'border-error bg-red-50' : 'border-neutral-200 hover:border-neutral-400'
        }`}
      >
        {departments.map((dept) => (
          <option key={dept.value} value={dept.value}>
            {dept.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}
