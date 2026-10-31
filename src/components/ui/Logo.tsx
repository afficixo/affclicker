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
    sm: { width: 140, height: 52 },
    md: { width: 176, height: 66 },
    lg: { width: 210, height: 80 },
    xl: { width: 260, height: 98 },
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
        src={variant === 'icon' ? '/affclicker-favicon-20261031.png' : '/affclickerlogo.png'}
        alt="AffClicker logo"
        width={variant === 'icon' ? 64 : dimensions.width}
        height={variant === 'icon' ? 64 : dimensions.height}
        sizes={variant === 'icon' ? '64px' : `${dimensions.width}px`}
        className={variant === 'icon' ? 'h-8 w-8 object-contain' : 'h-auto w-auto max-w-full object-contain'}
        priority
      />
    </div>
  )
}