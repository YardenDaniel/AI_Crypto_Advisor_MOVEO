import { Sparkles } from 'lucide-react'
import { Alert } from './components/common/Alert'
import { Badge } from './components/common/Badge'
import { Button } from './components/common/Button'
import { SectionCard } from './components/common/SectionCard'
import { Skeleton } from './components/common/Skeleton'
import { TextField } from './components/common/TextField'
import { PageContainer } from './components/layout/PageContainer'

function App() {
  return (
    <PageContainer>
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-ai">AI Crypto Advisor</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Design system
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Temporary showcase for typography, controls, and surfaces. Login and
          dashboard screens arrive in later stages.
        </p>
      </header>

      <div className="grid gap-6">
        <SectionCard title="Typography">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Daily briefing</h3>
            <p className="text-muted">
              Body copy uses IBM Plex Sans. Prices will use IBM Plex Mono.
            </p>
            <p className="font-mono text-lg">BTC $63,013.54</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Buttons"
          action={
            <Sparkles className="h-4 w-4 text-ai" aria-hidden="true" />
          }
        >
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
        </SectionCard>

        <SectionCard title="Inputs">
          <div className="grid max-w-md gap-4">
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
            />
            <TextField
              label="Password"
              type="password"
              error="This field is required"
            />
          </div>
        </SectionCard>

        <SectionCard title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>BTC</Badge>
            <Badge tone="accent">Hodler</Badge>
            <Badge tone="ai">AI Insight</Badge>
            <Badge tone="up">+1.52%</Badge>
            <Badge tone="down">-0.80%</Badge>
          </div>
        </SectionCard>

        <SectionCard title="Feedback">
          <div className="grid gap-3">
            <Alert>Session restored. Continue to the dashboard.</Alert>
            <Alert tone="success">Preferences saved.</Alert>
            <Alert tone="warning">Market data is temporarily unavailable.</Alert>
            <Alert tone="danger">Invalid email or password.</Alert>
          </div>
        </SectionCard>

        <SectionCard title="Loading">
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-11 w-full" />
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  )
}

export default App
