import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create categories
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
      description: 'Latest technology news and updates',
      metaTitle: 'Technology News | FoodKeys',
      metaDescription: 'Stay updated with the latest technology trends, gadgets, and innovations.',
    },
  })

  const lifestyleCategory = await prisma.category.upsert({
    where: { slug: 'lifestyle' },
    update: {},
    create: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Tips and articles about modern lifestyle',
      metaTitle: 'Lifestyle Articles | FoodKeys',
      metaDescription: 'Discover tips and insights for a better lifestyle.',
    },
  })

  const businessCategory = await prisma.category.upsert({
    where: { slug: 'business' },
    update: {},
    create: {
      name: 'Business',
      slug: 'business',
      description: 'Business news and entrepreneurship tips',
      metaTitle: 'Business News | FoodKeys',
      metaDescription: 'Get the latest business news and entrepreneurship insights.',
    },
  })

  console.log('Categories created')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'ai' },
      update: {},
      create: { name: 'AI', slug: 'ai', metaDescription: 'Articles about Artificial Intelligence' },
    }),
    prisma.tag.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: { name: 'Web Development', slug: 'web-development', metaDescription: 'Web development tutorials and tips' },
    }),
    prisma.tag.upsert({
      where: { slug: 'startup' },
      update: {},
      create: { name: 'Startup', slug: 'startup', metaDescription: 'Startup news and advice' },
    }),
    prisma.tag.upsert({
      where: { slug: 'productivity' },
      update: {},
      create: { name: 'Productivity', slug: 'productivity', metaDescription: 'Tips for improving productivity' },
    }),
    prisma.tag.upsert({
      where: { slug: 'innovation' },
      update: {},
      create: { name: 'Innovation', slug: 'innovation', metaDescription: 'Innovative ideas and solutions' },
    }),
  ])

  console.log('Tags created')

  // Create sample posts
  const posts = [
    {
      title: 'The Future of Artificial Intelligence in 2025',
      slug: 'future-of-artificial-intelligence-2025',
      content: `
        <p>Artificial Intelligence continues to reshape our world at an unprecedented pace. From healthcare to transportation, AI is transforming industries and creating new possibilities.</p>
        
        <h2>Key Trends in AI Development</h2>
        <p>The AI landscape is evolving rapidly, with several key trends emerging:</p>
        <ul>
          <li><strong>Generative AI:</strong> Tools like GPT and DALL-E are revolutionizing content creation.</li>
          <li><strong>Edge AI:</strong> Processing data locally on devices for faster, more private AI.</li>
          <li><strong>AI Ethics:</strong> Growing focus on responsible AI development and deployment.</li>
        </ul>
        
        <h2>Impact on Industries</h2>
        <p>Every major industry is being transformed by AI technologies. Healthcare is seeing breakthroughs in diagnosis and drug discovery. Finance is leveraging AI for fraud detection and algorithmic trading. Manufacturing is becoming smarter with predictive maintenance.</p>
        
        <blockquote>
          <p>"AI is not just a technology; it's a new way of solving problems and creating value."</p>
        </blockquote>
        
        <h2>Looking Ahead</h2>
        <p>As we move forward, the integration of AI into our daily lives will only deepen. The key is to harness this technology responsibly while maximizing its benefits for society.</p>
      `,
      excerpt: 'Explore the latest trends in artificial intelligence and how they are shaping our future across various industries.',
      status: 'PUBLISHED',
      categoryId: techCategory.id,
      tagIds: [tags[0].id, tags[4].id],
      metaTitle: 'Future of AI in 2025: Trends and Predictions | FoodKeys',
      metaDescription: 'Discover the future of artificial intelligence in 2025. Learn about key AI trends, industry impacts, and what to expect in the coming years.',
      publishedAt: new Date('2025-01-15'),
    },
    {
      title: 'Building Modern Web Applications with Next.js',
      slug: 'building-modern-web-applications-nextjs',
      content: `
        <p>Next.js has become the go-to framework for building modern web applications. Its powerful features and excellent developer experience make it a top choice for developers worldwide.</p>
        
        <h2>Why Choose Next.js?</h2>
        <p>Next.js offers several advantages over traditional React development:</p>
        <ul>
          <li><strong>Server-Side Rendering:</strong> Improved SEO and faster initial page loads.</li>
          <li><strong>Static Site Generation:</strong> Pre-render pages at build time for maximum performance.</li>
          <li><strong>API Routes:</strong> Build your backend and frontend in one project.</li>
          <li><strong>File-based Routing:</strong> Intuitive routing based on your file structure.</li>
        </ul>
        
        <h2>Getting Started</h2>
        <p>Setting up a Next.js project is straightforward. With just a few commands, you can have a production-ready application running.</p>
        
        <pre><code>npx create-next-app@latest my-app
cd my-app
npm run dev</code></pre>
        
        <h2>Best Practices</h2>
        <p>When building with Next.js, consider these best practices for optimal performance and maintainability:</p>
        <ol>
          <li>Use Image Optimization with next/image</li>
          <li>Implement proper caching strategies</li>
          <li>Leverage incremental static regeneration</li>
          <li>Optimize your bundle size</li>
        </ol>
      `,
      excerpt: 'Learn how to build modern, performant web applications using Next.js framework with best practices and tips.',
      status: 'PUBLISHED',
      categoryId: techCategory.id,
      tagIds: [tags[1].id],
      metaTitle: 'Building Modern Web Apps with Next.js | FoodKeys',
      metaDescription: 'Complete guide to building modern web applications with Next.js. Learn about SSR, SSG, API routes, and best practices.',
      publishedAt: new Date('2025-02-01'),
    },
    {
      title: '10 Productivity Hacks for Remote Workers',
      slug: '10-productivity-hacks-remote-workers',
      content: `
        <p>Remote work has become the new normal for millions of workers worldwide. While it offers flexibility, staying productive can be challenging. Here are 10 proven hacks to boost your productivity.</p>
        
        <h2>1. Create a Dedicated Workspace</h2>
        <p>Having a specific area for work helps your brain switch into "work mode" and improves focus.</p>
        
        <h2>2. Establish a Morning Routine</h2>
        <p>Start your day with intention. A consistent morning routine sets the tone for a productive day.</p>
        
        <h2>3. Use Time Blocking</h2>
        <p>Allocate specific time blocks for different tasks. This helps prevent multitasking and improves focus.</p>
        
        <h2>4. Take Regular Breaks</h2>
        <p>The Pomodoro Technique (25 minutes work, 5 minutes break) can significantly improve productivity.</p>
        
        <h2>5. Minimize Distractions</h2>
        <p>Use tools like website blockers and turn off notifications during focused work periods.</p>
        
        <h2>6. Communicate Effectively</h2>
        <p>Over-communicate with your team. Use async communication tools effectively.</p>
        
        <h2>7. Set Clear Boundaries</h2>
        <p>Define your working hours and communicate them to family members and colleagues.</p>
        
        <h2>8. Invest in Ergonomics</h2>
        <p>A comfortable chair and proper desk setup can prevent fatigue and improve focus.</p>
        
        <h2>9. Stay Connected</h2>
        <p>Regular video calls with colleagues help maintain team cohesion and combat isolation.</p>
        
        <h2>10. End Your Day Deliberately</h2>
        <p>Create a shutdown ritual to signal the end of your workday and transition to personal time.</p>
      `,
      excerpt: 'Discover 10 proven productivity hacks to stay focused and efficient while working from home.',
      status: 'PUBLISHED',
      categoryId: lifestyleCategory.id,
      tagIds: [tags[3].id],
      metaTitle: '10 Productivity Hacks for Remote Workers | FoodKeys',
      metaDescription: 'Boost your remote work productivity with these 10 proven hacks. Learn time management, workspace tips, and more.',
      publishedAt: new Date('2025-02-10'),
    },
    {
      title: 'How to Launch Your Startup in 2025',
      slug: 'how-to-launch-startup-2025',
      content: `
        <p>Starting a business has never been more accessible, yet the challenges remain significant. Here's your comprehensive guide to launching a successful startup in 2025.</p>
        
        <h2>Validate Your Idea</h2>
        <p>Before investing time and money, validate your business idea:</p>
        <ul>
          <li>Conduct market research</li>
          <li>Build a minimum viable product (MVP)</li>
          <li>Get feedback from potential customers</li>
        </ul>
        
        <h2>Build Your Team</h2>
        <p>A great idea needs a great team. Look for co-founders and early employees who complement your skills and share your vision.</p>
        
        <h2>Secure Funding</h2>
        <p>Explore different funding options:</p>
        <ul>
          <li>Bootstrapping</li>
          <li>Angel investors</li>
          <li>Venture capital</li>
          <li>Crowdfunding</li>
        </ul>
        
        <h2>Create a Go-to-Market Strategy</h2>
        <p>Plan how you'll reach your target audience and acquire your first customers.</p>
        
        <h2>Focus on Customer Success</h2>
        <p>Your early customers are your best marketing tool. Delight them and they'll spread the word.</p>
      `,
      excerpt: 'A comprehensive guide to launching your startup successfully in 2025, from idea validation to funding.',
      status: 'PUBLISHED',
      categoryId: businessCategory.id,
      tagIds: [tags[2].id, tags[4].id],
      metaTitle: 'How to Launch Your Startup in 2025 | Complete Guide',
      metaDescription: 'Learn how to launch a successful startup in 2025. From idea validation to funding, this guide covers everything you need to know.',
      publishedAt: new Date('2025-01-20'),
    },
    {
      title: 'Draft: Upcoming Features in JavaScript ES2026',
      slug: 'upcoming-features-javascript-es2026',
      content: `
        <p>This is a draft article about upcoming JavaScript features. Content coming soon...</p>
      `,
      excerpt: 'Preview of exciting new features coming to JavaScript in ES2026.',
      status: 'DRAFT',
      categoryId: techCategory.id,
      tagIds: [tags[1].id],
      metaTitle: 'JavaScript ES2026 New Features | FoodKeys',
      metaDescription: 'Discover the exciting new features coming to JavaScript in ES2026.',
      publishedAt: null,
    },
  ]

  for (const postData of posts) {
    const { tagIds, ...postFields } = postData
    
    const post = await prisma.post.upsert({
      where: { slug: postFields.slug },
      update: {},
      create: {
        ...postFields,
        tags: {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
        meta: {
          create: [
            { key: 'keywords', value: 'sample, keywords, for, seo' },
          ],
        },
      },
    })
    
    console.log(`Created post: ${post.title}`)
  }

  // Create some settings
  await prisma.settings.upsert({
    where: { key: 'site_name' },
    update: {},
    create: { key: 'site_name', value: 'FoodKeys Weblog' },
  })

  await prisma.settings.upsert({
    where: { key: 'posts_per_page' },
    update: {},
    create: { key: 'posts_per_page', value: '10' },
  })

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
