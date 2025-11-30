'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, LogIn, LogOut, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    // Don't show header on login/signup pages
    if (pathname === '/login' || pathname === '/signup') return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        SM
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white hidden sm:inline-block">Student Manager</span>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link href="/shop">
                        <Button variant="ghost" size="sm" className={pathname === '/shop' ? 'bg-slate-100 dark:bg-slate-800' : ''}>
                            <ShoppingBag className="w-4 h-4 mr-2 text-amber-600" />
                            Shop
                        </Button>
                    </Link>

                    <Link href="/journal">
                        <Button variant="ghost" size="sm" className={pathname === '/journal' ? 'bg-slate-100 dark:bg-slate-800' : ''}>
                            <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                            Journal
                        </Button>
                    </Link>

                    {user ? (
                        <>
                            <Link href="/profile">
                                <Button variant="ghost" size="sm" className={pathname === '/profile' ? 'bg-slate-100 dark:bg-slate-800' : ''}>
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm">
                                <LogIn className="w-4 h-4 mr-2" />
                                Login
                            </Button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
