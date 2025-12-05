'use client';

import { useState } from 'react';
import { useJournalStore, Mood } from '@/lib/store/useJournalStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Meh, Frown, AlertCircle, Zap, Trash2, Calendar, Pencil } from 'lucide-react';

const MOODS: { type: Mood; icon: any; label: string; color: string }[] = [
    { type: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500 bg-green-100 dark:bg-green-900/20' },
    { type: 'focused', icon: Zap, label: 'Focused', color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20' },
    { type: 'neutral', icon: Meh, label: 'Neutral', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
    { type: 'stressed', icon: AlertCircle, label: 'Stressed', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/20' },
    { type: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20' },
];

import { ManualSessionModal } from '@/components/features/timer/ManualSessionModal';

export default function JournalPage() {
    const { entries, addEntry, updateEntry, deleteEntry } = useJournalStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood>('neutral');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (existing submit logic)
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        if (editingId) {
            await updateEntry(editingId, title, content, selectedMood);
            setEditingId(null);
        } else {
            await addEntry(title, content, selectedMood);
        }

        setTitle('');
        setContent('');
        setSelectedMood('neutral');
    };

    // ... (existing edit handlers)
    const handleEdit = (entry: any) => {
        setEditingId(entry.id);
        setTitle(entry.title);
        setContent(entry.content);
        setSelectedMood(entry.mood);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setSelectedMood('neutral');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Daily Journal</h1>
                        <p className="text-slate-500 dark:text-slate-400">Reflect on your day and track your mood.</p>
                    </div>
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                    >
                        Forgot to Timer?
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ... (existing grid content) */}
                    {/* Entry Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-8">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                {editingId ? 'Edit Entry' : 'New Entry'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Summary of today..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mood</label>
                                    <div className="flex gap-2 justify-between">
                                        {MOODS.map((m) => (
                                            <button
                                                key={m.type}
                                                type="button"
                                                onClick={() => setSelectedMood(m.type)}
                                                className={`p-2 rounded-lg transition-all ${selectedMood === m.type
                                                    ? `${m.color} ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900`
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                                                    }`}
                                                title={m.label}
                                            >
                                                <m.icon size={20} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reflection</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="What went well? What could be better?"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-2">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                    >
                                        {editingId ? 'Update Entry' : 'Save Entry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Entry List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Entries</h2>
                        <AnimatePresence mode='popLayout'>
                            {entries.length > 0 ? (
                                entries.map((entry) => {
                                    const moodData = MOODS.find(m => m.type === entry.mood) || MOODS[2];
                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${moodData.color}`}>
                                                        <moodData.icon size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 dark:text-white">{entry.title}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <Calendar size={12} />
                                                            {new Date(entry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => handleEdit(entry)}
                                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteEntry(entry.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                                {entry.content}
                                            </p>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <p>No entries yet. Start your journaling habit today!</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <ManualSessionModal
                    isOpen={isManualModalOpen}
                    onClose={() => setIsManualModalOpen(false)}
                />
            </div>
        </div>
    );
}
