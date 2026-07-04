import React from 'react';
import { ShoppingBag } from 'lucide-react';
import EmptyState from './EmptyState';

interface InventoryListProps {
  premiumStatus: boolean;
  xpBoosterActive: boolean;
}

const ActiveBadge = () => (
  <span className="bg-success-emerald/15 text-success-emerald text-[10px] px-2 py-0.5 rounded-full">Active</span>
);

const InventoryList: React.FC<InventoryListProps> = ({ premiumStatus, xpBoosterActive }) => {
  if (!xpBoosterActive && !premiumStatus) {
    return <EmptyState icon={<ShoppingBag size={48} />} message="No items yet. Visit the Shop." />;
  }

  return (
    <div className="space-y-3">
      {xpBoosterActive && (
        <div className="bg-secondary-layer rounded-xl p-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-text-primary font-semibold text-sm">
            ⚡ XP Booster <ActiveBadge />
          </span>
        </div>
      )}
      {premiumStatus && (
        <div className="bg-secondary-layer rounded-xl p-4 flex items-center gap-2">
          <span className="text-text-primary font-semibold text-sm">⭐ Premium Pass</span>
          <ActiveBadge />
        </div>
      )}
    </div>
  );
};

export default InventoryList;
