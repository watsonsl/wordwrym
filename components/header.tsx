"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Calendar, 
  Home, 
  PenLine, 
  Search, 
  BarChart3
} from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/write", label: "Write", icon: PenLine },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/search", label: "Search", icon: Search },
    { href: "/stats", label: "Statistics", icon: BarChart3 },
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <PenLine className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Mindful Journal</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                asChild
                className={cn(
                  "relative",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Link href={item.href} className="flex items-center space-x-1">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              </Button>
            );
          })}
        </nav>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="default" size="sm" asChild className="hidden md:flex">
            <Link href="/write">
              <PenLine className="h-4 w-4 mr-2" />
              New Entry
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;