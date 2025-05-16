"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TicketStatusToggle } from "@/components/ticket-status-toggle";

export default function AdminTicketTable({
  initialData,
}: {
  initialData: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [tickets, setTickets] = useState(initialData.tickets);
  const [filter, setFilter] = useState(initialData.filter);
  const [page, setPage] = useState(initialData.page);
  const [pageSize] = useState(initialData.pageSize);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar boletos
  const filteredTickets = filter
    ? tickets.filter(
        (t: any) =>
          t.number.toString().includes(filter) ||
          (t.name && t.name.toLowerCase().includes(filter.toLowerCase())) ||
          (t.phone && t.phone.includes(filter))
      )
    : tickets;

  // Calcular paginación
  const totalPages = Math.ceil(filteredTickets.length / pageSize);
  const start = (page - 1) * pageSize;
  const paginatedTickets = filteredTickets.slice(start, start + pageSize);

  // Manejar cambio de filtro
  const handleFilterChange = (e: any) => {
    setFilter(e.target.value);
    setPage(1);

    // Actualizar URL sin recargar
    const params = new URLSearchParams(searchParams);
    params.set("filter", e.target.value);
    params.set("page", "1");
    window.history.pushState({}, "", `?${params.toString()}`);
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: any) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);

    // Actualizar URL sin recargar
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    window.history.pushState({}, "", `?${params.toString()}`);
  };

  // Manejar eliminación de boleto
  const handleDeleteTicket = async (ticketNumber: any) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("ticketNumber", ticketNumber);

      const response = await fetch("/api/tickets/delete", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la venta del boleto");
      }

      // Actualizar la lista de boletos
      setTickets(
        tickets.map((t: any) =>
          t.number === ticketNumber
            ? { ...t, sold: false, name: null, phone: null, sold_date: null }
            : t
        )
      );

      toast({
        title: "Venta eliminada",
        description: `La venta del boleto #${ticketNumber} ha sido eliminada`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la venta del boleto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por número, nombre o teléfono..."
          className="pl-8 w-full md:max-w-sm"
          value={filter}
          onChange={handleFilterChange}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.map((ticket: any) => (
              <TableRow key={ticket.number}>
                <TableCell className="font-medium">{ticket.number}</TableCell>
                <TableCell>{ticket.name}</TableCell>
                <TableCell>{ticket.phone}</TableCell>
                <TableCell>
                  {ticket.sold_date
                    ? new Date(ticket.sold_date).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <TicketStatusToggle ticket={ticket} />
                </TableCell>
              </TableRow>
            ))}
            {paginatedTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No hay boletos vendidos que coincidan con la búsqueda
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTickets.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {start + 1} a{" "}
            {Math.min(start + pageSize, filteredTickets.length)} de{" "}
            {filteredTickets.length} boletos vendidos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {page} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || totalPages === 0 || isLoading}
              onClick={() => handlePageChange(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
