import React from 'react';
import { PILLARS_DATA } from '@/data/dashboardData';
import { PillarId } from '@/types/dashboard';
import { PendidikanDetailView } from './PendidikanDetailView';
import { KesehatanDetailView } from './KesehatanDetailView';
import { BencanaDetailView } from './BencanaDetailView';
import { KemiskinanDetailView } from './KemiskinanDetailView';

interface Layer2PillarDetailProps {
  pillarId: PillarId;
  onBackToHome: () => void;
}

export const Layer2PillarDetail: React.FC<Layer2PillarDetailProps> = ({
  pillarId,
  onBackToHome,
}) => {
  const pillar = PILLARS_DATA[pillarId];

  switch (pillarId) {
    case 'pendidikan':
      return <PendidikanDetailView onBackToHome={onBackToHome} pillar={pillar} category="PKPN" />;
    case 'kesehatan':
      return <KesehatanDetailView onBackToHome={onBackToHome} pillar={pillar} category="PKPN" />;
    case 'bencana':
      return <BencanaDetailView onBackToHome={onBackToHome} pillar={pillar} category="PKPN" />;
    case 'kemiskinan':
      return <KemiskinanDetailView onBackToHome={onBackToHome} pillar={pillar} category="PKPN" />;
    default:
      return <PendidikanDetailView onBackToHome={onBackToHome} pillar={pillar} category="PKPN" />;
  }
};
