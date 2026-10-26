'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/helpers'

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact'
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
}

export function Logo({
  variant = 'full',
  className,
  size = 'md',
  onClick,
}: LogoProps) {
  const logoSizes = {
    sm: { width: 106, height: 40 },
    md: { width: 132, height: 50 },
    lg: { width: 158, height: 60 },
    xl: { width: 211, height: 80 },
  }
  const dimensions = logoSizes[size]

  return (
    <div
      className={cn(
        'flex cursor-pointer select-none items-center group',
        className
      )}
      onClick={onClick}
    >
      <Image
        src={variant === 'icon' ? '/afficix_favicon.png' : '/afficixlogo.png'}
        alt="Afficix logo"
        width={variant === 'icon' ? 64 : dimensions.width}
        height={variant === 'icon' ? 64 : dimensions.height}
        sizes={variant === 'icon' ? '64px' : `${dimensions.width}px`}
        className={variant === 'icon' ? 'h-8 w-8 object-contain' : 'h-auto w-auto max-w-full object-contain'}
        priority
      />
    </div>
  )
}