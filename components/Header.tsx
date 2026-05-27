import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '@/components/ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-emerald-700 dark:bg-emerald-900 text-white shadow-md">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="AJQuiz"
            width={108}
            height={35}
            priority
            className="invert [mix-blend-mode:screen]"
          />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-emerald-200 text-sm hidden sm:block">Quiz Yourself Daily</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
