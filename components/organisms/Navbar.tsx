import React from 'react';
import { Logo } from '@/components/atoms/Logo';
import { PillButton } from '@/components/atoms/PillButton';
import { LayerType, PillarId } from '@/types/dashboard';
import { Database } from 'lucide-react';

interface NavbarProps {
  currentLayer: LayerType;
  selectedPillar: PillarId;
  onSelectLayer1: () => void;
  onSelectPillar: (pillarId: PillarId) => void;
  onSelectMasterData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLayer,
  selectedPillar,
  onSelectLayer1,
  onSelectPillar,
  onSelectMasterData,
}) => {
  const navItems: { label: string; pillarId?: PillarId }[] = [
    { label: 'Ringkasan Eksekutif' },
    { label: 'Pendidikan', pillarId: 'pendidikan' },
    { label: 'Kesehatan', pillarId: 'kesehatan' },
    { label: 'Ketahanan Bencana', pillarId: 'bencana' },
    { label: 'Penurunan Kemiskinan', pillarId: 'kemiskinan' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/80 px-4 lg:px-8 py-2.5 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
        {/* Left: Brand Logos & Title as accessible button */}
        <button
          type="button"
          onClick={onSelectLayer1}
          aria-label="Kembali ke Ringkasan Nasional Layer 1"
          className="text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-400 rounded-lg p-1 -m-1"
        >
          <Logo />
        </button>

        {/* Center: Clean Text Pill Nav Menu */}
        <nav
          aria-label="Navigasi Utama Dashboard"
          className="order-3 lg:order-2 w-full lg:w-auto flex items-center justify-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/80 overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const isRingkasan = !item.pillarId;
            const isActive = isRingkasan
              ? currentLayer === 'layer1'
              : currentLayer === 'layer2' && selectedPillar === item.pillarId;

            return (
              <PillButton
                key={item.label}
                variant="nav"
                size="sm"
                active={isActive}
                onClick={() => {
                  if (isRingkasan) {
                    onSelectLayer1();
                  } else if (item.pillarId) {
                    onSelectPillar(item.pillarId);
                  }
                }}
                className="whitespace-nowrap shrink-0 text-xs md:text-sm"
              >
                {item.label}
              </PillButton>
            );
          })}
        </nav>

        {/* Right: Master Data DTSEN Button */}
        <div className="order-2 lg:order-3 flex items-center gap-2 ml-auto lg:ml-0">
          <PillButton
            variant="action"
            size="sm"
            active={currentLayer === 'layer3'}
            onClick={onSelectMasterData}
            icon={<Database className="h-3.5 w-3.5" />}
            className="whitespace-nowrap"
          >
            Master Data DTSEN
          </PillButton>
        </div>
      </div>
    </header>
  );
};
