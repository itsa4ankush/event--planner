"use client";

import { Home, Compass, Sparkles, BarChart3, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Home, href: "/dashboard", label: "Home" },
  { icon: Compass, href: "/onboarding", label: "Explore" },
  { icon: Sparkles, href: "/coach", label: "Coach" },
  { icon: BarChart3, href: "/recap", label: "Recap" },
  { icon: User, href: "/", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--bg-card)] border-t border-[var(--bg-elevated)] px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-[var(--primary-light)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
              aria-label={item.label}
            >
              <item.icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
