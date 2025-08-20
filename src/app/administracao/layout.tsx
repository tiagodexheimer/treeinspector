// src/app/administracao/layout.tsx
import DashboardLayout from "../dashboard/DashboardLayout";

export default function AdministracaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}