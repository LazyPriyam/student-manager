import { create } from 'zustand';
import { REWARDS, Reward } from '@/lib/data/rewards';
import { useUserStore } from './useUserStore';

interface ShopState {
    items: Reward[];
    inventory: string[]; // List of item IDs owned
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
            .select('item_id')
            .eq('user_id', user.id);

        if (inventory) {
            set({ inventory: inventory.map(i => i.item_id) });
        }
    },

    purchaseItem: async (itemId, cost) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;

        // Deduct points from user store
        useUserStore.getState().spendPoints(cost);

        set((state) => ({
            inventory: [...state.inventory, itemId]
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('inventory').insert({
                user_id: user.id,
                item_id: itemId
            });
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
