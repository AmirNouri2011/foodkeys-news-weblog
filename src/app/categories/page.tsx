import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { CategoriesGrid } from '@/components/home/categories-section'
import { FadeUp } from '@/components/animations/motion-wrapper'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all article categories on FoodKeys Weblog.',
}

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null }, // Only root categories
    include: {
      children: {
        include: {
          _count: { select: { posts: true } },
        },
      },
      _count: { select: { posts: true } },
    },
    orderBy: { name: 'asc' },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container-wrapper py-12">
      <FadeUp>
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Categories</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our articles organized by topic. Find the content that interests you most.
          </p>
        </div>
      </FadeUp>

      {categories.length > 0 ? (
        <CategoriesGrid categories={categories} />
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No categories found.</p>
        </div>
      )}
    </div>
  )
}
