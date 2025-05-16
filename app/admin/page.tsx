import { Suspense } from "react"
import Link from "next/link"
import { getTickets } from "@/lib/actions"
import { checkAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import { Search } from "lucide-react"

// Configuración de la rifa (podría venir de un archivo de configuración o props)
const raffleConfig = {
  id: "default",
  title: "Gran Rifa Benéfica",
  totalTickets: 1000,
}

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

  // Filtrar boletos vendidos
  let filteredSoldTickets = soldTickets;
  if (filter) {
    filteredSoldTickets = soldTickets.filter(
      (t) =>
        t.number.toString().includes(filter) ||
        (t.name && t.name.toLowerCase().includes(filter.toLowerCase())) ||
        (t.phone && t.phone.includes(filter))
    );
  }

  // Paginar boletos vendidos
  const totalPages = Math.ceil(filteredSoldTickets.length / pageSize);
  const start = (page - 1) * pageSize;
  const paginatedSoldTickets = filteredSoldTickets.slice(
    start,
    start + pageSize
  );

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
          <Button asChild variant="outline">
            <Link href="/admin/initialize">Inicializar Boletos</Link>
          </Button>
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
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <form>
                <Input
                  type="search"
                  name="filter"
                  placeholder="Buscar por número, nombre o teléfono..."
                  className="pl-8 w-full md:max-w-sm"
                  defaultValue={filter}
                />
                <input type="hidden" name="page" value="1" />
                <button type="submit" className="sr-only">
                  Buscar
                </button>
              </form>
            </div>

            <Suspense fallback={<div>Cargando datos...</div>}>
              <TicketTable tickets={paginatedSoldTickets} />
            </Suspense>

            {filteredSoldTickets.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {start + 1} a{" "}
                  {Math.min(start + pageSize, filteredSoldTickets.length)} de{" "}
                  {filteredSoldTickets.length} boletos vendidos
                </div>
                <div className="flex items-center gap-2">
                  <form>
                    <input type="hidden" name="filter" value={filter} />
                    <input
                      type="hidden"
                      name="page"
                      value={Math.max(1, page - 1)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      type="submit"
                    >
                      Anterior
                    </Button>
                  </form>
                  <span className="text-sm">
                    Página {page} de {totalPages || 1}
                  </span>
                  <form>
                    <input type="hidden" name="filter" value={filter} />
                    <input
                      type="hidden"
                      name="page"
                      value={Math.min(totalPages, page + 1)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || totalPages === 0}
                      type="submit"
                    >
                      Siguiente
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function TicketTable({ tickets }: {tickets: any}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket: any) => (
            <TableRow key={ticket.number}>
              <TableCell className="font-medium">{ticket.number}</TableCell>
              <TableCell>{ticket.name}</TableCell>
              <TableCell>{ticket.phone}</TableCell>
              <TableCell>{ticket.sold_date ? new Date(ticket.sold_date).toLocaleDateString() : "-"}</TableCell>
              <TableCell>
                <form
                  action={async (formData) => {
                    "use server"
                    const { deleteTicket } = await import("@/lib/actions")
                    await deleteTicket(formData)
                  }}
                >
                  <input type="hidden" name="ticketNumber" value={ticket.number} />
                  <Button variant="destructive" size="sm" type="submit">
                    Eliminar
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No hay boletos vendidos que coincidan con la búsqueda
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
