'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container-wrapper min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="text-9xl font-bold gradient-text mb-4"
        >
          404
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">صفحه یافت نشد</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          متأسفانه این صفحه وجود ندارد یا منتقل شده است.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="gradient" size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              صفحه اصلی
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="lg" className="gap-2">
              <Search className="h-4 w-4" />
              جستجو
            </Button>
          </Link>
        </div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <button
            onClick={() => window.history.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            بازگشت به صفحه قبل
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
