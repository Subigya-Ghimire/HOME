"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, FileText, Zap, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "ड्यासबोर्ड", icon: Home },
    { href: "/tenants", label: "भाडामा", icon: Users },
    { href: "/bills", label: "बिलहरू", icon: FileText },
    { href: "/readings", label: "रिडिङ", icon: Zap },
    { href: "/settings", label: "सेटिङ", icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:border-0 md:bg-transparent md:mb-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-around md:justify-start md:gap-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 px-3 md:px-4 md:py-2 rounded-lg transition-colors",
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
