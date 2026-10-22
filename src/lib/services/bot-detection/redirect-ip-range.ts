const TARGET_REDIRECT_IP_PREFIX = [57, 141, 0] as const

export function isTargetRedirectIpRange(ipAddress: string): boolean {
  const octets = ipAddress.trim().split('.')

  if (octets.length !== 4 || octets.some((octet) => !/^(0|[1-9]\d{0,2})$/.test(octet))) {
    return false
  }

  const parsedOctets = octets.map(Number)
  if (parsedOctets.some((octet) => octet > 255)) {
    return false
  }

  return TARGET_REDIRECT_IP_PREFIX.every((octet, index) => parsedOctets[index] === octet)
}
