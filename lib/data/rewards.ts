export type RewardType = 'theme' | 'sound' | 'effect' | 'title' | 'coupon' | 'powerup';

export interface Reward {
    id: string;
    name: string;
    description: string;
    type: RewardType;
    unlockLevel: number;
    cost: number; // 0 if free unlock
    icon: string;
    duration?: number; // Duration in minutes
}

export const REWARDS: Reward[] = [
    // ... (Themes, Sounds, Effects, Titles omitted for brevity, they don't have duration)

    // --- COUPONS ---
    { id: 'coupon-stretch', name: '5-Min Stretch', description: 'Limber up.', type: 'coupon', unlockLevel: 2, cost: 20, icon: '🧘', duration: 5 },
    { id: 'coupon-water', name: 'Glass of Water', description: 'Hydrate.', type: 'coupon', unlockLevel: 3, cost: 10, icon: '💧', duration: 0 },
    { id: 'coupon-song', name: 'Listen to 1 Song', description: 'Jam out.', type: 'coupon', unlockLevel: 4, cost: 30, icon: '🎵', duration: 4 },
    { id: 'coupon-coffee', name: 'Coffee Break', description: 'Caffeine fix.', type: 'coupon', unlockLevel: 5, cost: 50, icon: '☕', duration: 15 },
    { id: 'coupon-social', name: 'Social Media (5m)', description: 'Quick scroll.', type: 'coupon', unlockLevel: 6, cost: 60, icon: '📱', duration: 5 },
    { id: 'coupon-snack', name: 'Eat a Snack', description: 'Fuel up.', type: 'coupon', unlockLevel: 7, cost: 40, icon: '🍪', duration: 10 },
    { id: 'coupon-walk', name: 'Walk Outside', description: 'Fresh air.', type: 'coupon', unlockLevel: 8, cost: 50, icon: '🚶', duration: 20 },
    { id: 'coupon-yt', name: 'YouTube Video', description: 'Watch one.', type: 'coupon', unlockLevel: 9, cost: 80, icon: '▶️', duration: 15 },
    { id: 'coupon-nap', name: '15-Min Power Nap', description: 'Recharge.', type: 'coupon', unlockLevel: 10, cost: 100, icon: '💤', duration: 15 },
    { id: 'coupon-read', name: 'Read Fiction', description: 'Escape reality.', type: 'coupon', unlockLevel: 11, cost: 70, icon: '📖', duration: 30 },
    { id: 'coupon-call', name: 'Call a Friend', description: 'Catch up.', type: 'coupon', unlockLevel: 12, cost: 60, icon: '📞', duration: 20 },
    { id: 'coupon-pet', name: 'Play with Pet', description: 'Cuddles.', type: 'coupon', unlockLevel: 13, cost: 50, icon: '🐕', duration: 15 },
    { id: 'coupon-drink', name: 'Fancy Drink', description: 'Boba or Latte.', type: 'coupon', unlockLevel: 14, cost: 150, icon: '🧋', duration: 20 },
    { id: 'coupon-tv', name: '1 TV Episode', description: 'Binge watch.', type: 'coupon', unlockLevel: 15, cost: 200, icon: '📺', duration: 45 },
    { id: 'coupon-sleep', name: 'Sleep In (30m)', description: 'Snooze button.', type: 'coupon', unlockLevel: 16, cost: 250, icon: '🛌', duration: 30 },
    { id: 'coupon-food', name: 'Order Takeout', description: 'No cooking.', type: 'coupon', unlockLevel: 17, cost: 300, icon: '🍕', duration: 60 },
    { id: 'coupon-book', name: 'Buy a Book', description: 'New reading.', type: 'coupon', unlockLevel: 18, cost: 400, icon: '📚', duration: 0 },
    { id: 'coupon-movie', name: 'Movie Night', description: 'Popcorn time.', type: 'coupon', unlockLevel: 19, cost: 500, icon: '🎬', duration: 120 },
    { id: 'coupon-cheat', name: 'Cheat Day', description: 'Skip habits.', type: 'coupon', unlockLevel: 20, cost: 1000, icon: '🍔', duration: 1440 }, // 24h
    { id: 'coupon-game', name: 'Buy a Game', description: 'New adventure.', type: 'coupon', unlockLevel: 21, cost: 1500, icon: '🎮', duration: 0 },
    { id: 'coupon-cinema', name: 'Go to Cinema', description: 'Big screen.', type: 'coupon', unlockLevel: 22, cost: 800, icon: '🎟️', duration: 180 },
    { id: 'coupon-dessert', name: 'Dessert Dinner', description: 'Sweet tooth.', type: 'coupon', unlockLevel: 23, cost: 600, icon: '🍰', duration: 60 },
    { id: 'coupon-chores', name: 'No Chores Day', description: 'Freedom.', type: 'coupon', unlockLevel: 24, cost: 1200, icon: '🧹', duration: 1440 },
    { id: 'coupon-spa', name: 'Spa Day', description: 'Relaxation.', type: 'coupon', unlockLevel: 25, cost: 2000, icon: '🧖', duration: 240 },
    { id: 'coupon-clothes', name: 'Buy Clothes', description: 'New fit.', type: 'coupon', unlockLevel: 26, cost: 1500, icon: '👕', duration: 120 },
    { id: 'coupon-concert', name: 'Concert Ticket', description: 'Live music.', type: 'coupon', unlockLevel: 27, cost: 3000, icon: '🎫', duration: 240 },
    { id: 'coupon-trip', name: 'Day Trip', description: 'Mini adventure.', type: 'coupon', unlockLevel: 28, cost: 2500, icon: '🚗', duration: 720 },
    { id: 'coupon-dinner', name: 'Fancy Dinner', description: 'Fine dining.', type: 'coupon', unlockLevel: 29, cost: 2000, icon: '🍽️', duration: 120 },
    { id: 'coupon-weekend', name: 'Full Weekend Off', description: 'Do nothing.', type: 'coupon', unlockLevel: 30, cost: 5000, icon: '🏖️', duration: 2880 }, // 48h
    { id: 'coupon-tech', name: 'Buy Gadget', description: 'New toy.', type: 'coupon', unlockLevel: 35, cost: 4000, icon: '📱', duration: 0 },
    { id: 'coupon-stay', name: 'Staycation', description: 'Home holiday.', type: 'coupon', unlockLevel: 40, cost: 3000, icon: '🏠', duration: 1440 },
    { id: 'coupon-park', name: 'Theme Park', description: 'Rollercoasters.', type: 'coupon', unlockLevel: 45, cost: 4500, icon: '🎢', duration: 480 },
    { id: 'coupon-fund', name: 'Vacation Fund', description: 'Save up.', type: 'coupon', unlockLevel: 50, cost: 5000, icon: '✈️', duration: 0 },
    { id: 'coupon-laptop', name: 'New Laptop Fund', description: 'Upgrade.', type: 'coupon', unlockLevel: 60, cost: 8000, icon: '💻', duration: 0 },
    { id: 'coupon-dream', name: 'Dream Trip', description: 'Once in a lifetime.', type: 'coupon', unlockLevel: 75, cost: 20000, icon: '🌍', duration: 0 },

    // --- POWERUPS ---
    { id: 'power-xp1', name: 'XP Potion (1.1x)', description: '+10% XP for 1h.', type: 'powerup', unlockLevel: 2, cost: 100, icon: '🧪' },
    { id: 'power-quote', name: 'Reroll Quote', description: 'New inspiration.', type: 'powerup', unlockLevel: 4, cost: 20, icon: '🎲' },
    { id: 'power-freeze', name: 'Streak Freeze', description: 'Protect 1 day.', type: 'powerup', unlockLevel: 6, cost: 200, icon: '🧊' },
    { id: 'power-slot', name: 'Extra Shop Slot', description: 'More choices.', type: 'powerup', unlockLevel: 8, cost: 500, icon: '🎒' },
    { id: 'power-xp2', name: 'Double XP Potion', description: '2x XP for 1h.', type: 'powerup', unlockLevel: 10, cost: 500, icon: '⚗️' },
    { id: 'power-mercy', name: 'Habit Mercy', description: 'Restore streak.', type: 'powerup', unlockLevel: 12, cost: 1000, icon: '🙏' },
    { id: 'power-point', name: 'Point Booster', description: '1.5x Points for 1h.', type: 'powerup', unlockLevel: 14, cost: 400, icon: '📈' },
    { id: 'power-shield', name: 'Focus Shield', description: 'Block distractions.', type: 'powerup', unlockLevel: 16, cost: 300, icon: '🛡️' },
    { id: 'power-color', name: 'Matrix Color', description: 'New quadrant color.', type: 'powerup', unlockLevel: 18, cost: 200, icon: '🎨' },
    { id: 'power-xp3', name: 'Triple XP Potion', description: '3x XP for 30m.', type: 'powerup', unlockLevel: 20, cost: 1000, icon: '🧪' },
    { id: 'power-auto', name: 'Instant Complete', description: 'Auto-check habit.', type: 'powerup', unlockLevel: 22, cost: 150, icon: '✅' },
    { id: 'power-sale', name: 'Shop Discount', description: '10% off for 24h.', type: 'powerup', unlockLevel: 25, cost: 800, icon: '🏷️' },
    { id: 'power-bg', name: 'Profile BG', description: 'Customize profile.', type: 'powerup', unlockLevel: 28, cost: 1000, icon: '🖼️' },
    { id: 'power-name', name: 'Rename App', description: 'Change title.', type: 'powerup', unlockLevel: 30, cost: 2000, icon: '✏️' },
    { id: 'power-icon', name: 'Custom Icon', description: 'Change app icon.', type: 'powerup', unlockLevel: 35, cost: 2500, icon: '📱' },
    { id: 'power-key', name: 'Master Key', description: 'Unlock themes 1h.', type: 'powerup', unlockLevel: 40, cost: 3000, icon: '🔑' },
    { id: 'power-rain', name: 'XP Rain', description: 'Instant 500 XP.', type: 'powerup', unlockLevel: 45, cost: 2000, icon: '🌧️' },
    { id: 'power-jackpot', name: 'Point Jackpot', description: 'Instant 1000 Pts.', type: 'powerup', unlockLevel: 50, cost: 4000, icon: '🎰' },
    { id: 'power-skip', name: 'Level Skip', description: 'Instant Level Up.', type: 'powerup', unlockLevel: 60, cost: 10000, icon: '⏭️' },
    { id: 'power-god', name: 'God Mode', description: 'Infinite Points.', type: 'powerup', unlockLevel: 99, cost: 99999, icon: '👑' },
];
