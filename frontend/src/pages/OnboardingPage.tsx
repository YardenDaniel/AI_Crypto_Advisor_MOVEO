import { Sparkles } from 'lucide-react'
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard'

export function OnboardingPage() {
  return (
    <div className="min-h-svh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <p className="flex items-center gap-2 text-sm font-medium text-ai">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          AI Crypto Advisor
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Personalize your daily briefing
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Three short questions. We save your answers only when you finish.
        </p>
        <div className="mt-8 rounded-[var(--radius-md)] border border-border bg-card p-5 sm:p-8">
          <OnboardingWizard />
        </div>
      </div>
    </div>
  )
}
