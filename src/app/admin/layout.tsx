import React from 'react';
import { AdminPinGate } from '@/components/admin/AdminPinGate';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard | Rose Valley Kannauj',
  description: 'Luxury Perfumes & Essential Oils Management Platform',
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
