// src/app/solicitacoes/layout.tsx
import DashboardLayout from "../dashboard/DashboardLayout";

export default function SolicitacoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}