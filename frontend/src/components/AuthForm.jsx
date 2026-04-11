import { Link } from 'react-router-dom'

const inputClass =
  'w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

export default function AuthForm({
  alternateHref,
  alternateLabel,
  alternateText,
  description,
  error,
  fields,
  footer,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  title,
  values,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight text-black">{title}</h2>
        <p className="text-sm leading-6 text-black/55">{description}</p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="block space-y-2">
            <span className="text-sm font-medium text-black/75">{field.label}</span>
            <input
              autoComplete={field.autoComplete}
              className={inputClass}
              maxLength={field.maxLength}
              minLength={field.minLength}
              name={field.name}
              onChange={onChange}
              placeholder={field.placeholder}
              required={field.required}
              type={field.type}
              value={values[field.name] ?? ''}
            />
          </label>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-black/10 bg-[#fafafa] px-4 py-3 text-sm leading-6 text-black/70">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Working…' : submitLabel}
      </button>

      {footer && <div className="rounded-lg border border-black/10 bg-[#fafafa] px-4 py-3 text-sm leading-6 text-black/55">{footer}</div>}

      <p className="text-sm text-black/45">
        {alternateText}{' '}
        <Link className="font-medium text-black" to={alternateHref}>
          {alternateLabel}
        </Link>
      </p>
    </form>
  )
}
