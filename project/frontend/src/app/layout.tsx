"use client"

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Activity, LayoutDashboard, Database, BookOpen, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>WIPR | EROM PATA Control Room</title>
        <meta name="description" content="A High-Precision Merit-Based Performance System" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`} style={{ backgroundColor: 'oklch(0.14 0.05 220)', color: 'oklch(0.98 0.01 210)' }}>
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded font-bold text-black" style={{ backgroundColor: 'oklch(0.6 0.15 240)' }}>
                W
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.9)' }}>THE EROM PATA</h1>
                <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Control Room</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <NavItem href="/" icon={<LayoutDashboard size={16} />} label="Home" />
              <NavItem href="/metrics" icon={<Activity size={16} />} label="Metrics" />
              <NavItem href="/database" icon={<Database size={16} />} label="Database" />
              <NavItem href="/manual" icon={<BookOpen size={16} />} label="Manual" />
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Settings size={20} />
              </button>
              <div className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: '1px solid rgba(255,255,255,0.2)' }}></div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer" style={{ color: 'rgba(255,255,255,0.6)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        {icon}
        {label}
      </span>
    </Link>
  )
}
