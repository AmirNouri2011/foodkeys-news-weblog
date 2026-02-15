import { Metadata } from 'next'
import { PostWithRelations, CategoryWithRelations, TagWithCount, ArticleJsonLd } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'FoodKeys Weblog'
const SITE_DESCRIPTION = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern news and articles platform'

/**
 * Generate absolute URL from path
 */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Generate metadata for a post page
 */
export function generatePostMetadata(post: PostWithRelations): Metadata {
  const title = post.metaTitle || post.title
  const description = post.metaDescription || post.excerpt || ''
  const canonical = post.canonicalUrl || absoluteUrl(`/posts/${post.slug}`)
  const publishedTime = post.publishedAt?.toISOString()
  const modifiedTime = post.updatedAt?.toISOString()
  
  // Extract keywords from tags and meta
  const keywords = [
    ...(post.tags?.map(pt => pt.tag.name) || []),
    post.category?.name,
  ].filter(Boolean) as string[]
  
  // Get meta keywords if set
  const metaKeywords = post.meta?.find(m => m.key === 'keywords')?.value
  if (metaKeywords) {
    keywords.push(...metaKeywords.split(',').map(k => k.trim()))
  }
  
  const images = post.featuredImage 
    ? [{ url: absoluteUrl(post.featuredImage), width: 1200, height: 630, alt: title }]
    : []

  return {
    title,
    description,
    keywords: [...new Set(keywords)],
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images,
      publishedTime,
      modifiedTime,
      authors: [SITE_NAME],
      tags: keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map(img => img.url),
    },
    robots: {
      index: post.status === 'PUBLISHED',
      follow: post.status === 'PUBLISHED',
    },
  }
}

/**
 * Generate metadata for a category page
 */
export function generateCategoryMetadata(category: CategoryWithRelations): Metadata {
  const title = category.metaTitle || `${category.name} - Articles & News`
  const description = category.metaDescription || category.description || `Browse all articles in ${category.name}`
  const canonical = absoluteUrl(`/category/${category.slug}`)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

/**
 * Generate metadata for a tag page
 */
export function generateTagMetadata(tag: TagWithCount): Metadata {
  const title = tag.metaTitle || `${tag.name} - Tagged Articles`
  const description = tag.metaDescription || `Browse all articles tagged with ${tag.name}`
  const canonical = absoluteUrl(`/tag/${tag.slug}`)

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

/**
 * Generate JSON-LD structured data for an article
 */
export function generateArticleJsonLd(post: PostWithRelations): ArticleJsonLd {
  const images: string[] = []
  if (post.featuredImage) {
    images.push(absoluteUrl(post.featuredImage))
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: images.length > 0 ? images : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/posts/${post.slug}`),
    },
  }
}

/**
 * Generate JSON-LD for website/organization
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate JSON-LD for breadcrumbs
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

/**
 * JSON-LD Script Component helper
 */
export function JsonLd({ data }: { data: object }) {
  return {
    __html: JSON.stringify(data),
  }
}

/**
 * Generate default metadata for the site
 */
export function getDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: ['news', 'articles', 'blog', 'technology', 'lifestyle', 'business'],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: absoluteUrl('/og-image.png'),
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [absoluteUrl('/og-image.png')],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
    },
  }
}
