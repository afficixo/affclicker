'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { shouldShowPageLoader } from '@/lib/ui/page-load-routes'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [loaderRegion, setLoaderRegion] = useState<HTMLElement | null>(null)
  const isLoaderPage = shouldShowPageLoader(pathname)
  const showLoader = isLoaderPage && isLoading

  useEffect(() => {
    const syncLoadingState = () => {
      setIsLoading(document.documentElement.dataset.appLoading === 'true')
    }

    syncLoadingState()
    window.addEventListener('app:loading-change', syncLoadingState)
    return () => window.removeEventListener('app:loading-change', syncLoadingState)
  }, [])

  useEffect(() => {
    setLoaderRegion(isLoaderPage
      ? document.querySelector<HTMLElement>('[data-page-loader-region]')
      : null)
  }, [isLoaderPage, pathname])

  const overlay = (
    <div
      className={`page-load-overlay${showLoader ? '' : ' page-load-overlay-hidden'}`}
      role="status"
      aria-live="polite"
      aria-label="Preparing your workspace"
      aria-hidden={!showLoader}
      aria-busy={showLoader}
    >
      <div className="page-load-content">
        <div className="page-load-spinner" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-full w-full">
      {children}
      {loaderRegion && createPortal(overlay, loaderRegion)}
    </div>
  )
}
