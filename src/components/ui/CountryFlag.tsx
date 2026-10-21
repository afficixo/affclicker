'use client'

import { hasFlag } from 'country-flag-icons'
import * as CountryFlags from 'country-flag-icons/react/3x2'
import { Globe2 } from 'lucide-react'
import { getCountryLabel, normalizeCountryCode } from '@/lib/utils/country'

interface CountryFlagProps {
  country?: string | null
  className?: string
}

export function CountryFlag({ country, className = 'h-4 w-6' }: CountryFlagProps) {
  const countryCode = normalizeCountryCode(country)
  const Flag = countryCode && hasFlag(countryCode)
    ? CountryFlags[countryCode as keyof typeof CountryFlags]
    : null

  if (!Flag) {
    return (
      <Globe2
        className={`${className} shrink-0 text-amber-700 dark:text-amber-300`}
        aria-label={country ? `Unknown country: ${country}` : 'Unknown country'}
        role="img"
      />
    )
  }

  return (
    <Flag
      className={`${className} shrink-0 overflow-hidden rounded-[2px] object-cover`}
      role="img"
      aria-label={getCountryLabel(country) || country || 'Country flag'}
    />
  )
}
