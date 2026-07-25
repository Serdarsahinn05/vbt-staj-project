"use client";

import { AdminDashboard } from "./admin-dashboard";
import { AdminGuard } from "./admin-guard";

export function AdminPanel() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
