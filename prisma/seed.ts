import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_USERNAME = process.env.ADMIN_USERNAME?.trim() || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || 'admin123'

const demoLinks = [
  {
    slug: 'demo-geo-launch',
    accountName: 'Geo Launch Campaign',
    totalClicks: 428,
    uniqueClicks: 343,
    botClicks: 22,
  },
  {
    slug: 'demo-vertical-pulse',
    accountName: 'Vertical Pulse',
    totalClicks: 316,
    uniqueClicks: 271,
    botClicks: 11,
  },
  {
    slug: 'demo-smartflow',
    accountName: 'SmartFlow Offers',
    totalClicks: 214,
    uniqueClicks: 182,
    botClicks: 8,
  },
]

const geoProfile = [
  { country: 'US', countryCode: 'US', region: 'California', city: 'San Francisco', browser: 'Chrome', device: 'Desktop', referrer: 'google.com' },
  { country: 'GB', countryCode: 'GB', region: 'England', city: 'London', browser: 'Safari', device: 'Mobile', referrer: 'facebook.com' },
  { country: 'CA', countryCode: 'CA', region: 'Ontario', city: 'Toronto', browser: 'Edge', device: 'Desktop', referrer: 'bing.com' },
  { country: 'DE', countryCode: 'DE', region: 'Berlin', city: 'Berlin', browser: 'Chrome', device: 'Desktop', referrer: 'newsletter' },
  { country: 'AU', countryCode: 'AU', region: 'Victoria', city: 'Melbourne', browser: 'Safari', device: 'Mobile', referrer: 'instagram.com' },
  { country: 'IN', countryCode: 'IN', region: 'Karnataka', city: 'Bengaluru', browser: 'Chrome', device: 'Mobile', referrer: 'linkedin.com' },
]

const referrerPool = ['google.com', 'facebook.com', 'bing.com', 'newsletter', 'direct']
const browserPool = ['Chrome', 'Safari', 'Edge', 'Firefox']
const devicePool = ['Desktop', 'Mobile', 'Tablet']

function buildClickRows(linkAccountId: string, linkSeed: (typeof demoLinks)[number]) {
  const now = new Date()
  const rows: Array<{
    linkAccountId: string
    createdAt: Date
    ipAddress: string
    country: string
    region: string
    city: string
    browser: string
    deviceType: string
    referrer: string
    userAgent: string
    isUnique: boolean
    isBot: boolean
  }> = []

  let total = linkSeed.totalClicks
  const uniqueTarget = linkSeed.uniqueClicks
  const botTarget = linkSeed.botClicks

  for (let index = 0; index < total; index += 1) {
    const randomDay = Math.floor(Math.random() * 30)
    const randomHour = Math.floor(Math.random() * 24)
    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - randomDay)
    createdAt.setHours(randomHour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0)

    const profile = geoProfile[index % geoProfile.length]
    const isBot = index < botTarget
    const isUnique = index < uniqueTarget

    rows.push({
      linkAccountId,
      createdAt,
      ipAddress: `203.0.113.${(index % 200) + 1}`,
      country: profile.country,
      region: profile.region,
      city: profile.city,
      browser: browserPool[index % browserPool.length],
      deviceType: devicePool[index % devicePool.length],
      referrer: referrerPool[index % referrerPool.length],
      userAgent: isBot ? 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      isUnique,
      isBot,
    })
  }

  return rows
}

async function seedDemoAnalytics(adminId: string) {
  console.log('📈 Seeding demo analytics...')

  const createdLinks: Array<{ id: string; slug: string }> = []

  for (const demoLink of demoLinks) {
    const linkAccount = await prisma.linkAccount.upsert({
      where: { slug: demoLink.slug },
      update: {
        accountName: demoLink.accountName,
        totalClicks: demoLink.totalClicks,
        uniqueClicks: demoLink.uniqueClicks,
        botClicks: demoLink.botClicks,
      },
      create: {
        accountName: demoLink.accountName,
        slug: demoLink.slug,
        userId: adminId,
        totalClicks: demoLink.totalClicks,
        uniqueClicks: demoLink.uniqueClicks,
        botClicks: demoLink.botClicks,
        isActive: true,
      },
    })

    createdLinks.push({ id: linkAccount.id, slug: linkAccount.slug })
  }

  const clickRows = createdLinks.flatMap(({ id, slug }) => {
    const seed = demoLinks.find((item) => item.slug === slug)
    if (!seed) return []
    return buildClickRows(id, seed)
  })

  await prisma.click.deleteMany({
    where: {
      linkAccount: {
        slug: {
          in: demoLinks.map((demoLink) => demoLink.slug),
        },
      },
    },
  })

  await prisma.click.createMany({
    data: clickRows,
  })

  const dailyMap = new Map<string, { date: Date; clicks: number; uniqueClicks: number; botClicks: number }>()
  const hourlyMap = new Map<string, { hour: Date; clicks: number; uniqueClicks: number; botClicks: number }>()
  const geoMap = new Map<string, { linkAccountId: string; country: string; countryCode: string; clicks: number; uniqueClicks: number; botClicks: number }>()
  const browserMap = new Map<string, { linkAccountId: string; browser: string; clicks: number; uniqueClicks: number; botClicks: number }>()
  const deviceMap = new Map<string, { linkAccountId: string; deviceType: string; clicks: number; uniqueClicks: number; botClicks: number }>()
  const referrerMap = new Map<string, { linkAccountId: string; referrer: string; clicks: number; uniqueClicks: number; botClicks: number }>()

  for (const row of clickRows) {
    const day = new Date(row.createdAt)
    day.setHours(0, 0, 0, 0)

    const dayKey = `${row.linkAccountId}:${day.toISOString()}`
    const currentDay = dailyMap.get(dayKey) || {
      date: day,
      clicks: 0,
      uniqueClicks: 0,
      botClicks: 0,
    }

    currentDay.clicks += 1
    if (row.isUnique) currentDay.uniqueClicks += 1
    if (row.isBot) currentDay.botClicks += 1
    dailyMap.set(dayKey, currentDay)

    const hour = new Date(row.createdAt)
    hour.setMinutes(0, 0, 0)

    const hourKey = `${row.linkAccountId}:${hour.toISOString()}`
    const currentHour = hourlyMap.get(hourKey) || {
      hour,
      clicks: 0,
      uniqueClicks: 0,
      botClicks: 0,
    }

    currentHour.clicks += 1
    if (row.isUnique) currentHour.uniqueClicks += 1
    if (row.isBot) currentHour.botClicks += 1
    hourlyMap.set(hourKey, currentHour)

    const geoKey = `${row.linkAccountId}:${row.country}`
    const currentGeo = geoMap.get(geoKey) || {
      linkAccountId: row.linkAccountId,
      country: row.country,
      countryCode: row.country,
      clicks: 0,
      uniqueClicks: 0,
      botClicks: 0,
    }
    currentGeo.clicks += 1
    if (row.isUnique) currentGeo.uniqueClicks += 1
    if (row.isBot) currentGeo.botClicks += 1
    geoMap.set(geoKey, currentGeo)

    const browserKey = `${row.linkAccountId}:${row.browser}`
    const currentBrowser = browserMap.get(browserKey) || {
      linkAccountId: row.linkAccountId,
      browser: row.browser,
      clicks: 0,
      uniqueClicks: 0,
      botClicks: 0,
    }
    currentBrowser.clicks += 1
    if (row.isUnique) currentBrowser.uniqueClicks += 1
    if (row.isBot) currentBrowser.botClicks += 1
    browserMap.set(browserKey, currentBrowser)

    const deviceKey = `${row.linkAccountId}:${row.deviceType}`
    const currentDevice = deviceMap.get(deviceKey) || {
      linkAccountId: row.linkAccountId,
      deviceType: row.deviceType,
      clicks: 0,
      uniqueClicks: 0,
      botClicks: 0,
    }
    currentDevice.clicks += 1
    if (row.isUnique) currentDevice.uniqueClicks += 1
    if (row.isBot) currentDevice.botClicks += 1
    deviceMap.set(deviceKey, currentDevice)

    const referrerKey = `${row.linkAccountId}:${row.referrer}`
    const currentReferrer = referrerMap.get(referrerKey) || {
      linkAccountId: row.linkAccountId,
      referrer: row.referrer,
      clicks: 0,
      uniqueClicks: 0,
      botClicks: 0,
    }
    currentReferrer.clicks += 1
    if (row.isUnique) currentReferrer.uniqueClicks += 1
    if (row.isBot) currentReferrer.botClicks += 1
    referrerMap.set(referrerKey, currentReferrer)
  }

  for (const daily of dailyMap.values()) {
    await prisma.dailyAnalytics.upsert({
      where: {
        linkAccountId_date: {
          linkAccountId: createdLinks[0]?.id || '',
          date: daily.date,
        },
      },
      update: daily,
      create: {
        linkAccountId: createdLinks[0]?.id || '',
        date: daily.date,
        clicks: daily.clicks,
        uniqueClicks: daily.uniqueClicks,
        botClicks: daily.botClicks,
      },
    })
  }

  for (const hour of hourlyMap.values()) {
    await prisma.hourlyAnalytics.upsert({
      where: {
        linkAccountId_hour: {
          linkAccountId: createdLinks[0]?.id || '',
          hour: hour.hour,
        },
      },
      update: hour,
      create: {
        linkAccountId: createdLinks[0]?.id || '',
        hour: hour.hour,
        clicks: hour.clicks,
        uniqueClicks: hour.uniqueClicks,
        botClicks: hour.botClicks,
      },
    })
  }

  for (const geo of geoMap.values()) {
    await prisma.geoStat.upsert({
      where: {
        linkAccountId_country: {
          linkAccountId: geo.linkAccountId,
          country: geo.country,
        },
      },
      update: {
        clicks: geo.clicks,
        uniqueClicks: geo.uniqueClicks,
        botClicks: geo.botClicks,
      },
      create: {
        linkAccountId: geo.linkAccountId,
        country: geo.country,
        countryCode: geo.countryCode,
        clicks: geo.clicks,
        uniqueClicks: geo.uniqueClicks,
        botClicks: geo.botClicks,
      },
    })
  }

  for (const browser of browserMap.values()) {
    await prisma.browserStat.upsert({
      where: {
        linkAccountId_browser: {
          linkAccountId: browser.linkAccountId,
          browser: browser.browser,
        },
      },
      update: {
        clicks: browser.clicks,
        uniqueClicks: browser.uniqueClicks,
        botClicks: browser.botClicks,
      },
      create: {
        linkAccountId: browser.linkAccountId,
        browser: browser.browser,
        clicks: browser.clicks,
        uniqueClicks: browser.uniqueClicks,
        botClicks: browser.botClicks,
      },
    })
  }

  for (const device of deviceMap.values()) {
    await prisma.deviceStat.upsert({
      where: {
        linkAccountId_deviceType: {
          linkAccountId: device.linkAccountId,
          deviceType: device.deviceType,
        },
      },
      update: {
        clicks: device.clicks,
        uniqueClicks: device.uniqueClicks,
        botClicks: device.botClicks,
      },
      create: {
        linkAccountId: device.linkAccountId,
        deviceType: device.deviceType,
        clicks: device.clicks,
        uniqueClicks: device.uniqueClicks,
        botClicks: device.botClicks,
      },
    })
  }

  for (const referrer of referrerMap.values()) {
    await prisma.referrerStat.upsert({
      where: {
        linkAccountId_referrer: {
          linkAccountId: referrer.linkAccountId,
          referrer: referrer.referrer,
        },
      },
      update: {
        clicks: referrer.clicks,
        uniqueClicks: referrer.uniqueClicks,
        botClicks: referrer.botClicks,
      },
      create: {
        linkAccountId: referrer.linkAccountId,
        referrer: referrer.referrer,
        clicks: referrer.clicks,
        uniqueClicks: referrer.uniqueClicks,
        botClicks: referrer.botClicks,
      },
    })
  }

  console.log('✅ Demo analytics seeded for admin dashboard')
}

async function main() {
  console.log('🌱 Seeding database...')

  try {
    const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    const admin = await prisma.user.upsert({
      where: { username: ADMIN_USERNAME },
      update: { commissionRate: 0 },
      create: {
        username: ADMIN_USERNAME,
        email: `${ADMIN_USERNAME}@nextgen.com`,
        password: adminPassword,
        role: 'ADMIN',
        commissionRate: 0,
      },
    })

    console.log(`✅ Admin user ready: ${admin.username}`)

    await prisma.offerVault.create({
      data: {
        country: 'GLOBAL',
        offerUrl: 'https://smartlink.com/?s1=',
        isGlobal: true,
        isActive: true,
        priority: 100,
        rotationMode: 'PRIORITY',
        userId: admin.id,
      },
    })

    console.log('✅ Global smart link created')

    const sampleOffers = [
      { country: 'US', offerUrl: 'https://affiliate.com/us/?s1=' },
      { country: 'GB', offerUrl: 'https://affiliate.com/uk/?s1=' },
      { country: 'CA', offerUrl: 'https://affiliate.com/ca/?s1=' },
      { country: 'AU', offerUrl: 'https://affiliate.com/au/?s1=' },
    ]

    for (const [index, offer] of sampleOffers.entries()) {
      await prisma.offerVault.create({
        data: {
          country: offer.country,
          offerUrl: offer.offerUrl,
          isActive: true,
          isGlobal: false,
          priority: 100 - index,
          rotationMode: index % 2 === 0 ? 'PRIORITY' : 'RANDOM',
          userId: admin.id,
        },
      })
    }

    console.log('✅ Sample offers created')

    await seedDemoAnalytics(admin.id)
    console.log('🎉 Seeding complete!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('❌ Seeding failed:', e)
  process.exit(1)
})