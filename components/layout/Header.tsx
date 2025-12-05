'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, LogIn, LogOut, BookOpen, Menu, X, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { soundManager } from '@/lib/sound';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/lib/store/useUserStore';
import { AnimatePresence, motion } from 'framer-motion';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { activeSound } = useUserStore();

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    // Don't show header on login/signup pages
    if (pathname === '/login' || pathname === '/signup') return null;

    const NavItems = () => (
        <>
            <Link href="/shop" className="w-full md:w-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onMouseEnter={() => soundManager.playHover(activeSound)}
                    className={`w-full justify-start md:justify-center ${pathname === '/shop' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                    <ShoppingBag className="w-4 h-4 mr-2 text-amber-600" />
                    Shop
                </Button>
            </Link>

            <Link href="/journal" className="w-full md:w-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onMouseEnter={() => soundManager.playHover(activeSound)}
                    className={`w-full justify-start md:justify-center ${pathname === '/journal' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                    Journal
                </Button>
            </Link>

            <Link href="/goals" className="w-full md:w-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onMouseEnter={() => soundManager.playHover(activeSound)}
                    className={`w-full justify-start md:justify-center ${pathname === '/goals' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                    <Target className="w-4 h-4 mr-2 text-red-500" />
                    Goals
                </Button>
            </Link>

            <Link href="/analytics" className="w-full md:w-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onMouseEnter={() => soundManager.playHover(activeSound)}
                    className={`w-full justify-start md:justify-center ${pathname === '/analytics' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-500"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </div>
                    Analytics
                </Button>
            </Link>

            {user ? (
                <>
                    <Link href="/profile" className="w-full md:w-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onMouseEnter={() => soundManager.playHover(activeSound)}
                            className={`w-full justify-start md:justify-center ${pathname === '/profile' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        onMouseEnter={() => soundManager.playHover(activeSound)}
                        className="w-full justify-start md:justify-center"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </>
            ) : (
                <Link href="/login" className="w-full md:w-auto">
                    <Button
                        variant="default"
                        size="sm"
                        onMouseEnter={() => soundManager.playHover(activeSound)}
                        className="w-full justify-start md:justify-center"
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                    </Button>
                </Link>
            )}
        </>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        SM
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white hidden sm:inline-block">Student Manager</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-2">
                    <NavItems />
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-slate-600 dark:text-slate-300"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
                    >
                        <nav className="flex flex-col p-4 gap-2">
                            <NavItems />
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
