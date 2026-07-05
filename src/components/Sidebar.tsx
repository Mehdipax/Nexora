import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAvatar } from '../context/AvatarContext';
import { avatarUrl } from '../lib/avatars';
import { APP_NAV_ITEMS } from '../lib/navigation';
import { cx } from '../lib/ui';

function shortAddr(address: string) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'No wallet';
}

const Sidebar: React.FC = () => {
  const { walletAddress, disconnectWallet, isConnected } = useWallet();
  const { avatarId } = useAvatar();
  const { pathname } = useLocation();

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed left-0 top-[72px] bottom-0 w-60 border-r border-white/5 bg-bg-primary/70 backdrop-blur-xl z-40">
        <nav className="flex-1 py-5 px-3 space-y-1" aria-label="Primary navigation">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'group focus-ring flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200',
                  isActive
                    ? 'bg-brand-purple/[0.12] text-text-primary ring-1 ring-brand-purple/20'
                    : 'text-muted hover:bg-white/[0.04] hover:text-text-primary'
                )}
              >
                <span className={cx('flex h-8 w-8 items-center justify-center rounded-xl transition-colors', isActive ? 'bg-brand-purple/20 text-interactive-cyan' : 'bg-white/[0.025] text-text-secondary group-hover:text-interactive-cyan')}>
                  <item.icon size={17} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-2 rounded-2xl border border-white/5 bg-bg-primary/35 p-3">
          <div className="flex items-center gap-2 min-w-0">
            {isConnected ? (
              <img src={avatarUrl(avatarId)} alt="Selected avatar" className="h-9 w-9 rounded-xl border border-brand-purple/25 bg-secondary-layer object-cover" />
            ) : (
              <Wallet size={16} className="text-text-secondary" />
            )}
            <span className="truncate text-xs font-bold text-text-primary">{shortAddr(walletAddress)}</span>
          </div>
          {isConnected && (
            <button
              onClick={disconnectWallet}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-danger/25 px-3 py-2 text-sm font-bold text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut size={15} />
              Disconnect
            </button>
          )}
        </div>
        <p className="px-3 pb-4 text-center text-[11px] font-medium tracking-wide text-text-secondary/55">
          Built by Meti pax
        </p>
      </aside>

      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-50 pb-safe">
        <p className="mx-auto mb-2 w-fit rounded-full border border-white/5 bg-bg-primary/55 px-3 py-1 text-[10px] font-semibold tracking-wide text-text-secondary/65 backdrop-blur-md">
          Built by Meti pax
        </p>
        <nav className="h-[68px] rounded-[24px] border border-white/10 bg-bg-primary/82 shadow-[0_16px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl" aria-label="Mobile navigation">
          <div className="grid h-full grid-cols-6 items-center gap-0.5 px-1.5 py-1.5">
            {APP_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cx(
                    'focus-ring flex h-[56px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-[18px] px-0.5 text-[9.5px] font-semibold leading-tight transition-all duration-200 sm:text-[10.5px]',
                    isActive
                      ? 'bg-gold/14 text-gold ring-1 ring-gold/25'
                      : 'text-muted hover:bg-white/[0.04] hover:text-text-primary'
                  )}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.6 : 2.2} />
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
