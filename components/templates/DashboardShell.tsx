'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/organisms/Navbar';
import { Layer1BentoGrid } from '@/components/organisms/Layer1BentoGrid';
import { Layer2PillarDetail } from '@/components/organisms/Layer2PillarDetail';
import { Layer3MasterData } from '@/components/organisms/Layer3MasterData';
import { LayerType, Layer1ViewMode, PillarId } from '@/types/dashboard';

export const DashboardShell: React.FC = () => {
  const [currentLayer, setCurrentLayer] = useState<LayerType>('layer1');
  const [selectedPillar, setSelectedPillar] = useState<PillarId>('pendidikan');
  const [viewMode, setViewMode] = useState<Layer1ViewMode>('cards');

  const handleSelectLayer1 = () => {
    setCurrentLayer('layer1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPillar = (pillarId: PillarId) => {
    setSelectedPillar(pillarId);
    setCurrentLayer('layer2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMasterData = () => {
    setCurrentLayer('layer3');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans">
      {/* 1. Top Navbar (White Theme) */}
      <Navbar
        currentLayer={currentLayer}
        selectedPillar={selectedPillar}
        onSelectLayer1={handleSelectLayer1}
        onSelectPillar={handleSelectPillar}
        onSelectMasterData={handleSelectMasterData}
      />

      {/* 2. Main Dashboard Content Area - Perfectly aligned with Navbar */}
      <div className="w-full px-4 lg:px-8 flex-1 flex flex-col">
        <main className="flex-1 w-full max-w-[1600px] mx-auto py-6">
          {currentLayer === 'layer1' && (
            <Layer1BentoGrid
              viewMode={viewMode}
              onSelectPillar={handleSelectPillar}
            />
          )}

          {currentLayer === 'layer2' && (
            <Layer2PillarDetail
              pillarId={selectedPillar}
              onBackToHome={handleSelectLayer1}
            />
          )}

          {currentLayer === 'layer3' && (
            <Layer3MasterData onBackToHome={handleSelectLayer1} />
          )}
        </main>
      </div>
    </div>
  );
};
