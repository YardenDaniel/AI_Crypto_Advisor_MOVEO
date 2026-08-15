import type { ReactNode } from 'react'

type PageContainerProps = {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-5 md:py-8 lg:px-6">
      {children}
    </div>
  )
}
