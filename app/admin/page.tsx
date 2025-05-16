import { Suspense } from "react";
import Link from "next/link";
import { getTickets } from "@/lib/actions";
import { checkAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import AdminTicketTable from "./ticket-table";

// Configuración de la rifa (podría venir de un archivo de configuración o props)
const raffleConfig = {
  id: "default",
  title: "Gran Rifa Benéfica",
  totalTickets: 1000,
};

export default async function AdminPage({
  searchParams: search,
}: {
  searchParams: any;
}) {
  // Verificar autenticación
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }
  const searchParams = await search;
  const page = Number.parseInt(searchParams.page) || 1;
  const pageSize = 10;
  const filter = searchParams.filter || "";

  const tickets = await getTickets(raffleConfig.id);
  const soldTickets = tickets.filter((ticket) => ticket.sold);
  const availableTickets = tickets.filter((ticket) => !ticket.sold);

  // Obtener datos paginados para la tabla
  const initialData = {
    tickets: soldTickets,
    filter,
    page,
    pageSize,
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/">Ver sitio público</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/vender">Vender Boleto</Link>
          </Button>
          {/* <Button asChild variant="outline">
            <Link href="/admin/initialize">Inicializar Boletos</Link>
          </Button> */}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Boletos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Boletos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">
              {soldTickets.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Boletos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">
              {availableTickets.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boletos Vendidos</CardTitle>
          <CardDescription>
            Administra todos los boletos vendidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando datos...</div>}>
            <AdminTicketTable initialData={initialData} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
