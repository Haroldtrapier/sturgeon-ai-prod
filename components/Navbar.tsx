import Link from 'next/link'
import Image from 'next/image'
import SturgeonLogo from '@/public/sturgeon-logo.svg'

export function Navbar() {
  return (
    <header className="border-b bg-background">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src={SturgeonLogo} alt="Sturgeon AI" width={32} height={32} />
          <span className="font-semibold tracking-tight">Sturgeon AI</span>
        </Link>
        {/* nav links, auth, etc */}
      </div>
    </header>
  )
}
