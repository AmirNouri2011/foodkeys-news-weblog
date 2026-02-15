import { PostGridSkeleton } from '@/components/posts/post-grid'
import { Skeleton } from '@/components/ui/skeleton'

export default function PostsLoading() {
  return (
    <div className="container-wrapper py-12">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-5 w-64" />
      </div>
      <PostGridSkeleton count={9} columns={3} />
    </div>
  )
}
