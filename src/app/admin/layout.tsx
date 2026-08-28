import React from 'react';
import { AdminPinGate } from '@/components/admin/AdminPinGate';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard | RoseOil.in',
  description: 'Pure Essential Oils & Botanical Management Platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPinGate>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminPinGate>
  );
}
