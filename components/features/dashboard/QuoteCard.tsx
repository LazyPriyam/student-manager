'use client';

import { useUserStore } from '@/lib/store/useUserStore';
import { Quote } from 'lucide-react';
import { useEffect, useState } from 'react';

const QUOTES = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It always seems impossible until it's done. - Nelson Mandela",
    "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
    "Quality is not an act, it is a habit. - Aristotle",
    "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
    "The secret of getting ahead is getting started. - Mark Twain"
];

export function QuoteCard() {
    const { quoteIndex } = useUserStore();
    const [quote, setQuote] = useState(QUOTES[0]);

    useEffect(() => {
        // Use quoteIndex to cycle through quotes, or random if we prefer
        // But since rerollQuote increments index, let's use that.
        setQuote(QUOTES[quoteIndex % QUOTES.length]);
    }, [quoteIndex]);

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
                <Quote size={24} />
            </div>
            <div>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200 italic">
                    "{quote.split(' - ')[0]}"
                </p>
                <p className="text-sm text-slate-500 mt-2 font-bold">
                    - {quote.split(' - ')[1]}
                </p>
            </div>
        </div>
    );
}
