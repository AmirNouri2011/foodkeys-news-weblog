'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="container-wrapper min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6"
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">خطایی رخ داد</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          خطای غیرمنتظره‌ای رخ داده است. دوباره تلاش کنید یا به صفحه اصلی برگردید.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={reset} variant="default" size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تلاش مجدد
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              صفحه اصلی
            </Button>
          </Link>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 bg-muted rounded-lg text-left max-w-lg mx-auto"
          >
            <p className="text-sm font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
