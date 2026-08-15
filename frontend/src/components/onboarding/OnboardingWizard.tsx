import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { isApiError } from '../../api/errors'
import {
  PREFERENCES_QUERY_KEY,
  fetchPreferences,
  useCreatePreferences,
} from '../../hooks/usePreferences'
import type {
  AssetSymbol,
  ContentType,
  InvestorType,
  PreferenceCreate,
} from '../../types/preferences'
import { Alert } from '../common/Alert'
import { Button } from '../common/Button'
import { AssetStep } from './AssetStep'
import { ContentStep } from './ContentStep'
import { InvestorStep } from './InvestorStep'

type WizardDraft = {
  assets: AssetSymbol[]
  investor_type: InvestorType | null
  content_types: ContentType[]
}

const TOTAL_STEPS = 3

export function OnboardingWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createPreferences = useCreatePreferences()
  const [step, setStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [draft, setDraft] = useState<WizardDraft>({
    assets: [],
    investor_type: null,
    content_types: [],
  })

  const stepIsValid =
    (step === 1 && draft.assets.length > 0) ||
    (step === 2 && draft.investor_type !== null) ||
    (step === 3 && draft.content_types.length > 0)

  function toggleAsset(asset: AssetSymbol) {
    setDraft((current) => ({
      ...current,
      assets: current.assets.includes(asset)
        ? current.assets.filter((value) => value !== asset)
        : [...current.assets, asset],
    }))
  }

  function toggleContentType(contentType: ContentType) {
    setDraft((current) => ({
      ...current,
      content_types: current.content_types.includes(contentType)
        ? current.content_types.filter((value) => value !== contentType)
        : [...current.content_types, contentType],
    }))
  }

  async function handleFinish() {
    if (!draft.investor_type || draft.assets.length === 0 || draft.content_types.length === 0) {
      return
    }

    const payload: PreferenceCreate = {
      assets: draft.assets,
      investor_type: draft.investor_type,
      content_types: draft.content_types,
    }

    setSubmitError(null)

    try {
      await createPreferences.mutateAsync(payload)
      navigate('/', { replace: true })
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        await queryClient.fetchQuery({
          queryKey: PREFERENCES_QUERY_KEY,
          queryFn: fetchPreferences,
        })
        navigate('/', { replace: true })
        return
      }

      setSubmitError(
        isApiError(error)
          ? error.message
          : 'Unable to save your preferences. Please try again.',
      )
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-muted">
        Step {step} of {TOTAL_STEPS}
      </p>
      <div
        className="mt-3 flex gap-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
        aria-label="Onboarding progress"
      >
        {Array.from({ length: TOTAL_STEPS }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < step ? 'bg-accent' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <div className="mt-8">
        {step === 1 ? (
          <AssetStep selected={draft.assets} onToggle={toggleAsset} />
        ) : null}
        {step === 2 ? (
          <InvestorStep
            selected={draft.investor_type}
            onSelect={(investorType) =>
              setDraft((current) => ({ ...current, investor_type: investorType }))
            }
          />
        ) : null}
        {step === 3 ? (
          <ContentStep
            selected={draft.content_types}
            onToggle={toggleContentType}
          />
        ) : null}
      </div>

      {submitError ? (
        <div className="mt-6">
          <Alert tone="danger">{submitError}</Alert>
        </div>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSubmitError(null)
              setStep((current) => current - 1)
            }}
          >
            Back
          </Button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            disabled={!stepIsValid}
            onClick={() => setStep((current) => current + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!stepIsValid || createPreferences.isPending}
            onClick={() => {
              void handleFinish()
            }}
          >
            {createPreferences.isPending ? 'Saving…' : 'Finish setup'}
          </Button>
        )}
      </div>
    </div>
  )
}
