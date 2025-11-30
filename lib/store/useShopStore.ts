import { create } from 'zustand';
import { REWARDS, Reward } from '@/lib/data/rewards';
import { useUserStore } from './useUserStore';

interface ShopState {
    items: Reward[];
    inventory: { itemId: string; quantity: number }[]; // List of items owned with quantity
    purchaseItem: (itemId: string, cost: number) => void;
    fetchInventory: () => Promise<void>;
    resetData: () => Promise<void>;
}

import { supabase } from '@/lib/supabase/client';

export const useShopStore = create<ShopState>((set, get) => ({
    items: REWARDS,
    inventory: [],

    fetchInventory: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: inventory } = await supabase
            .from('inventory')
            .select('item_id, quantity')
            .eq('user_id', user.id);

        if (inventory) {
            set({ inventory: inventory.map(i => ({ itemId: i.item_id, quantity: i.quantity })) });
        }
    },

    purchaseItem: async (itemId, cost) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;

        // Deduct points from user store
        useUserStore.getState().spendPoints(cost);

        const currentInventory = get().inventory;
        const existingItemIndex = currentInventory.findIndex(i => i.itemId === itemId);

        if (existingItemIndex >= 0) {
            // Update local
            const newInventory = [...currentInventory];
            newInventory[existingItemIndex].quantity += 1;
            set({ inventory: newInventory });

            // Update DB
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // We need to fetch the current quantity from DB to be safe, or just increment
                // Supabase doesn't have a simple "increment" without a function, so we'll use the known value
                // actually, we can just upsert if we knew the ID, but we have a unique constraint on user_id + item_id

                // Fetch current to be sure? Or just trust local?
                // Let's trust local for speed, but for DB integrity:
                const { error } = await supabase
                    .from('inventory')
                    .update({ quantity: newInventory[existingItemIndex].quantity })
                    .eq('user_id', user.id)
                    .eq('item_id', itemId);
            }
        } else {
            // Insert local
            set((state) => ({
                inventory: [...state.inventory, { itemId, quantity: 1 }]
            }));

            // Insert DB
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('inventory').insert({
                    user_id: user.id,
                    item_id: itemId,
                    quantity: 1
                });
            }
        }
    },

    resetData: async () => {
        set({ inventory: [] });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('inventory').delete().eq('user_id', user.id);
        }
    },
}));
