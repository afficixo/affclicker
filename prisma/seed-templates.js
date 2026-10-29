const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTemplates() {
  try {
    // Check if templates already exist
    const existingTemplates = await prisma.landingPageTemplate.findMany()
    
    if (existingTemplates.length > 0) {
      console.log('Templates already exist. Skipping seed.')
      return
    }

    // Get or create a system user for templates
    let systemUser = await prisma.user.findUnique({
      where: { username: 'system' },
    })

    if (!systemUser) {
      // Use the first admin user if exists
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      })

      if (!adminUser) {
        // Create a temporary system user
        systemUser = await prisma.user.create({
          data: {
            username: 'system',
            email: 'system@affclicker.com',
            password: 'system-user',
            role: 'ADMIN',
          },
        })
        console.log('Created system user:', systemUser.id)
      } else {
        systemUser = adminUser
      }
    }

    const userId = systemUser.id

    // Create default templates
    const template1 = await prisma.landingPageTemplate.create({
      data: {
        name: 'Modern Offer',
        description: 'Clean and modern design with gradient backgrounds',
        thumbnail: 'https://via.placeholder.com/300x200?text=Modern+Offer',
        createdBy: userId,
        htmlContent: `<div class="landing-container modern">
  <div class="hero-section">
    <h1 class="headline">{headline}</h1>
    <p class="subtext">{description}</p>
    {imageUrl && '<img src="{imageUrl}" alt="Offer" class="hero-image" />'}
  </div>
  <div class="cta-section">
    <a href="#" class="cta-button">{buttonText}</a>
  </div>
</div>`,
        cssStyles: `.landing-container.modern {
  min-height: 100vh;
  background: linear-gradient(135deg, {primaryColor}20 0%, {secondaryColor}20 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.hero-section {
  max-width: 600px;
  text-align: center;
  margin-bottom: 40px;
}

.headline {
  font-size: 48px;
  font-weight: bold;
  color: {primaryColor};
  margin-bottom: 20px;
}

.subtext {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.hero-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 20px;
}

.cta-button {
  display: inline-block;
  padding: 16px 48px;
  background: linear-gradient(135deg, {primaryColor} 0%, {secondaryColor} 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 18px;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}`,
      },
    })

    const template2 = await prisma.landingPageTemplate.create({
      data: {
        name: 'Minimal Design',
        description: 'Simple and minimal design for maximum conversions',
        thumbnail: 'https://via.placeholder.com/300x200?text=Minimal+Design',
        createdBy: userId,
        htmlContent: `<div class="landing-container minimal">
  <div class="content">
    <h1>{headline}</h1>
    <p>{description}</p>
    {imageUrl && '<img src="{imageUrl}" alt="Offer" />'}
    <button class="btn">{buttonText}</button>
  </div>
</div>`,
        cssStyles: `.landing-container.minimal {
  min-height: 100vh;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.content {
  max-width: 500px;
  text-align: center;
}

.content h1 {
  font-size: 42px;
  color: {primaryColor};
  margin-bottom: 20px;
  font-weight: 700;
}

.content p {
  font-size: 16px;
  color: #555;
  margin-bottom: 30px;
  line-height: 1.6;
}

.content img {
  max-width: 100%;
  height: auto;
  margin-bottom: 30px;
}

.btn {
  padding: 14px 40px;
  background: {primaryColor};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:hover {
  background: {secondaryColor};
}`,
      },
    })

    const template3 = await prisma.landingPageTemplate.create({
      data: {
        name: 'Dark Gradient',
        description: 'Modern dark theme with vibrant gradients',
        thumbnail: 'https://via.placeholder.com/300x200?text=Dark+Gradient',
        createdBy: userId,
        htmlContent: `<div class="landing-container dark">
  <div class="stars"></div>
  <div class="content-wrapper">
    <h1>{headline}</h1>
    <p>{description}</p>
    {imageUrl && '<img src="{imageUrl}" alt="Offer" class="offer-image" />'}
    <a href="#" class="btn-primary">{buttonText}</a>
  </div>
</div>`,
        cssStyles: `.landing-container.dark {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  max-width: 600px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.content-wrapper h1 {
  background: linear-gradient(135deg, {primaryColor} 0%, {secondaryColor} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 20px;
}

.content-wrapper p {
  color: #ccc;
  font-size: 18px;
  margin-bottom: 40px;
  line-height: 1.8;
}

.offer-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 40px;
  border: 2px solid {primaryColor}40;
}

.btn-primary {
  display: inline-block;
  padding: 16px 50px;
  background: linear-gradient(135deg, {primaryColor} 0%, {secondaryColor} 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.3s;
  box-shadow: 0 0 30px {primaryColor}40;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 40px {primaryColor}60;
}`,
      },
    })

    console.log('✅ Templates seeded successfully!')
    console.log(`Created ${[template1, template2, template3].length} templates`)
  } catch (error) {
    console.error('Error seeding templates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedTemplates()
