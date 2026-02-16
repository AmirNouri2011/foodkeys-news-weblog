import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { generatePostMetadata } from '@/lib/seo'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      meta: true,
    },
  })

  if (!post || post.status !== 'PUBLISHED') {
    return null
  }

  return post
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      meta: true,
    },
  })

  if (!post) {
    return {
      title: 'نوشته یافت نشد',
    }
  }

  //@ts-ignore
  return generatePostMetadata(post)
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  redirect(`/view/news/details?id=${post.id}`)
}
