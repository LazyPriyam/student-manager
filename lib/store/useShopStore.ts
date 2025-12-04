import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { useUserStore } from './useUserStore';

import { REWARDS, Reward } from '@/lib/data/rewards';

interface InventoryItem {
    itemId: string;
    quantity: number;
}

interface ActiveItem {
    itemId: string;
    expiresAt: string;
}

interface ShopState {
    items: Reward[];
    inventory: InventoryItem[];
    activeItems: ActiveItem[];
    fetchInventory: () => Promise<void>;
    purchaseItem: (itemId: string, cost: number) => Promise<void>;
    consumeItem: (itemId: string, durationMinutes: number) => Promise<void>;
    resetData: () => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
    items: REWARDS,
    inventory: [],
    activeItems: [],

    fetchInventory: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Inventory
        const { data: inv } = await supabase
            .from('inventory')
            .select('item_id, quantity')
            .eq('user_id', user.id);

        if (inv) {
            set({
                inventory: inv.map(i => ({ itemId: i.item_id, quantity: i.quantity || 1 }))
            });
        }

        // Fetch Active Items
        const { data: active } = await supabase
            .from('active_items')
            .select('item_id, expires_at')
            .eq('user_id', user.id)
            .gt('expires_at', new Date().toISOString());

        if (active) {
            set({
                activeItems: active.map(a => ({ itemId: a.item_id, expiresAt: a.expires_at }))
            });
        }
    },

    purchaseItem: async (itemId, cost) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check points
        const { points } = useUserStore.getState();
        if (points < cost) {
            alert('Not enough points!');
            return;
        }

        // Deduct points
        useUserStore.getState().spendPoints(cost);

        const currentInventory = get().inventory;
        const existingItemIndex = currentInventory.findIndex(i => i.itemId === itemId);

        if (existingItemIndex >= 0) {
            // Update local
            const newInventory = [...currentInventory];
            newInventory[existingItemIndex].quantity += 1;
            set({ inventory: newInventory });

            // Update DB
            await supabase
                .from('inventory')
                .update({ quantity: newInventory[existingItemIndex].quantity })
                .eq('user_id', user.id)
                .eq('item_id', itemId);
        } else {
            // Insert local
            set((state) => ({
                inventory: [...state.inventory, { itemId, quantity: 1 }]
            }));

            // Insert DB
            await supabase.from('inventory').insert({
                user_id: user.id,
                item_id: itemId,
                quantity: 1
            });
        }
    },

    consumeItem: async (itemId, durationMinutes) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentInventory = get().inventory;
        const itemIndex = currentInventory.findIndex(i => i.itemId === itemId);

        if (itemIndex === -1 || currentInventory[itemIndex].quantity <= 0) return;

        // Decrement Quantity
        const newInventory = [...currentInventory];
        newInventory[itemIndex].quantity -= 1;
        set({ inventory: newInventory });

        // Update DB Inventory
        if (newInventory[itemIndex].quantity === 0) {
            await supabase.from('inventory').delete().eq('user_id', user.id).eq('item_id', itemId);
            set({ inventory: newInventory.filter(i => i.quantity > 0) });
        } else {
            await supabase
                .from('inventory')
                .update({ quantity: newInventory[itemIndex].quantity })
                .eq('user_id', user.id)
                .eq('item_id', itemId);
        }

        // Activate Item (if duration > 0)
        if (durationMinutes > 0) {
            const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();

            set(state => ({
                activeItems: [...state.activeItems, { itemId, expiresAt }]
            }));

            await supabase.from('active_items').insert({
                user_id: user.id,
                item_id: itemId,
                expires_at: expiresAt
            });
        } else {
            // Handle Instant Effects
            if (itemId === 'power-jackpot') {
                useUserStore.getState().addPoints(1000);
            }
            if (itemId === 'power-quote') {
                // Trigger quote refresh (we'll implement this in useUserStore or just rely on the toast for now)
                // For now, let's just assume the Quote component will listen to a change, 
                // or we can add a 'rerollQuote' action to userStore.
                useUserStore.getState().rerollQuote();
            }
        }
    },

    resetData: async () => {
        set({ inventory: [], activeItems: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('inventory').delete().eq('user_id', user.id);
            await supabase.from('active_items').delete().eq('user_id', user.id);
        }
    },
}));
