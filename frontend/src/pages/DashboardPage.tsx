import { AppHeader } from '../components/layout/AppHeader'
import { PageContainer } from '../components/layout/PageContainer'
import { InsightSection } from '../components/dashboard/InsightSection'
import { MemeSection } from '../components/dashboard/MemeSection'
import { NewsSection } from '../components/dashboard/NewsSection'
import { PricesSection } from '../components/dashboard/PricesSection'

export function DashboardPage() {
  return (
    <div className="min-h-svh bg-bg">
      <AppHeader />
      <PageContainer>
        <main>
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="order-1 md:col-span-2 lg:col-span-2">
              <PricesSection />
            </div>
            <div className="order-2 md:col-span-1 lg:col-span-2">
              <InsightSection />
            </div>
            <div className="order-4 md:order-3 md:col-span-1 lg:col-start-3 lg:row-start-1">
              <MemeSection />
            </div>
            <div className="order-3 md:order-4 md:col-span-2 lg:col-span-3">
              <NewsSection />
            </div>
          </div>
        </main>
      </PageContainer>
    </div>
  )
}
