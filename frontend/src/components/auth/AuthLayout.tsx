import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="grid min-h-svh bg-bg lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-b border-border px-8 py-10 lg:flex lg:flex-col lg:justify-between lg:border-b-0 lg:border-r lg:px-12 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(61,139,255,0.14),_transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="flex items-center gap-2 text-sm font-medium text-ai">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI Crypto Advisor
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">
            Your daily personalized crypto briefing
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Sign in to restore your session. The browser keeps you signed in
            with a secure cookie — this app never stores your token.
          </p>
        </div>
        <p className="relative text-sm text-muted">
          Prices, news, insight, and a daily meme — in one place.
        </p>
      </aside>

      <div className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mb-8 lg:hidden">
          <p className="flex items-center gap-2 text-sm font-medium text-ai">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI Crypto Advisor
          </p>
          <p className="mt-2 text-sm text-muted">
            Your daily personalized crypto briefing
          </p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-[var(--radius-md)] border border-border bg-card p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
