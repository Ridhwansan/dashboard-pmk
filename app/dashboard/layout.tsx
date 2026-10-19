import React from 'react';
import { DashboardLayoutClient } from './DashboardLayoutClient';

export const metadata = {
  title: 'Dashboard PMK - Executive Overview & Analytics',
  description: 'Dashboard eksekutif dan pelaporan operasional PMK',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
