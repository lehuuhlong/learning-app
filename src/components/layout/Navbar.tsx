"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  User,
  Settings,
  Sparkles,
  GraduationCap,
  Flame,
  Star,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const { t } = useLanguage();

  const navLinks = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/vocabulary", label: t("nav.vocabulary"), icon: BookOpen },
    { href: "/grammar", label: t("nav.grammar"), icon: GraduationCap },
    { href: "/dokkai", label: t("nav.dokkai"), icon: FileText },
  ];

  // Fetch gamification data for streak & level display
  useEffect(() => {
    if (!session?.user) return;

    async function fetchGamification() {
      try {
        const res = await fetch("/api/user/gamification");
        if (res.ok) {
          const data = await res.json();
          setStreak(data.currentStreak || 0);
          setLevel(data.level || 1);
        }
      } catch {
        // Silent fail — decorative only
      }
    }

    fetchGamification();
  }, [session]);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-blur:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          id="nav-logo"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground animate-pulse duration-3000">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            JLPT<span className="text-primary/70">Master</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" id="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-2 font-medium transition-all ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  id={`nav-${link.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Streak + Level + User menu & Theme toggle */}
        <div className="flex items-center gap-3">
          {/* Streak Fire Indicator */}
          {session?.user && streak > 0 && (
            <div
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20"
              title={`${streak} ${streak === 1 ? t("nav.dayStreak") : t("nav.daysStreak")}`}
            >
              <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-500">
                {streak}
              </span>
            </div>
          )}

          <LanguageToggle />
          <ThemeToggle />

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  id="user-menu-btn"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Level pip */}
                  {level > 1 && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-extrabold rounded-full h-4 w-4 flex items-center justify-center ring-1 ring-background">
                      {level}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-4 bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold"
                      >
                        <Star className="h-2 w-2 mr-0.5" />
                        Lv.{level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-none">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer gap-2">
                    <User className="h-4 w-4" />
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer gap-2">
                    <Settings className="h-4 w-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  id="logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="font-medium" id="nav-signin-btn">
                {t("nav.signIn")}
              </Button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                id="mobile-menu-btn"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Sparkles className="h-4 w-4" />
                  JLPT Master
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start gap-3 font-medium ${
                          isActive
                            ? ""
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
