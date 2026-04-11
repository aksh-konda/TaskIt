import { Link } from 'react-router-dom'

const navLinkClass =
  'rounded-lg px-3 py-2 text-sm transition'

export default function AuthLayout({ children, mode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10 text-black">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full max-w-sm rounded-xl border border-black/10 bg-white px-6 py-7 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="mb-7 space-y-5">
            <div className="space-y-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">TaskIt</p>
              <h1 className="text-3xl font-medium leading-none text-black">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-sm leading-6 text-black/55">
                A calm place to sign in and get back to your tasks.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-black/10 bg-[#f8f8f8] p-1">
                <Link
                  to="/login"
                  className={`${navLinkClass} ${mode === 'login' ? 'bg-white text-black shadow-sm' : 'text-black/45'}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${navLinkClass} ${mode === 'register' ? 'bg-white text-black shadow-sm' : 'text-black/45'}`}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>

          {children}
        </section>
      </div>
    </div>
  )
}
