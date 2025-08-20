// src/app/rotas/layout.tsx
import DashboardLayout from "../dashboard/DashboardLayout";

export default function RotasLayout({ children }: { children: React.ReactNode }) {
  // Simplesmente envolve os filhos (a página) com o DashboardLayout
  return <DashboardLayout>{children}</DashboardLayout>;
}