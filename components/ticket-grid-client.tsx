"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function TicketGridClient({
  initialData,
  showOwnerInfo = false,
}: {
  initialData: any;
  showOwnerInfo?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener la página actual de los parámetros de búsqueda
  const currentPage = Number(searchParams.get("page") || "1");

  // Función para cambiar de página sin recargar
  const changePage = async (newPage: any) => {
    if (
      newPage === currentPage ||
      newPage < 1 ||
      newPage > data.pagination.totalPages
    ) {
      return;
    }

    setIsLoading(true);

    try {
      // Construir la nueva URL con los parámetros de búsqueda actualizados
      const params = new URLSearchParams(searchParams);
      params.set("page", newPage.toString());

      // Actualizar la URL sin recargar la página
      window.history.pushState({}, "", `?${params.toString()}`);

      // Obtener los datos de la nueva página
      const response = await fetch(
        `/api/tickets?page=${newPage}&pageSize=${data.pagination.pageSize}`
      );
      const newData = await response.json();

      // Actualizar los datos
      setData(newData);

      // Mantener la posición de desplazamiento
      window.scrollTo({
        top:
          document.getElementById("ticket-grid-container")?.offsetTop! - 20 ||
          0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Error al cambiar de página:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ticket-grid-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          {data.pagination.currentPage * data.pagination.pageSize -
            data.pagination.pageSize +
            1}{" "}
          a{" "}
          {Math.min(
            data.pagination.currentPage * data.pagination.pageSize,
            data.pagination.total
          )}{" "}
          de {data.pagination.total} boletos
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={data.pagination.currentPage <= 1 || isLoading}
            onClick={() => changePage(data.pagination.currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm mx-2">
            Página {data.pagination.currentPage} de {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={
              data.pagination.currentPage >= data.pagination.totalPages ||
              isLoading
            }
            onClick={() => changePage(data.pagination.currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {isLoading
          ? // Mostrar esqueleto de carga mientras se cargan los datos
            Array.from({ length: data.pagination.pageSize }).map((_, index) => (
              <div
                key={index}
                className="aspect-square flex items-center justify-center rounded-md border text-sm font-bold bg-gray-100 animate-pulse"
              />
            ))
          : // Mostrar los boletos
            data.tickets.map((ticket: any) => (
              <TooltipProvider key={ticket.number}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                      aspect-square flex items-center justify-center rounded-md border text-sm font-bold
                      ${
                        ticket.sold
                          ? "bg-red-100 border-red-300 text-red-700 cursor-not-allowed"
                          : "bg-green-100 border-green-300 text-green-700 cursor-pointer hover:bg-green-200"
                      }
                    `}
                    >
                      {ticket.number}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {ticket.sold ? (
                      <div className="text-center">
                        <Badge variant="destructive" className="mb-1">
                          Vendido
                        </Badge>
                        {showOwnerInfo && ticket.name && (
                          <p className="text-sm font-medium">{ticket.name}</p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-green-50">
                        Disponible
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
      </div>

      {/* <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          {data.pagination.currentPage * data.pagination.pageSize -
            data.pagination.pageSize +
            1}{" "}
          a{" "}
          {Math.min(
            data.pagination.currentPage * data.pagination.pageSize,
            data.pagination.total
          )}{" "}
          de {data.pagination.total} boletos
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={data.pagination.currentPage <= 1 || isLoading}
            onClick={() => changePage(data.pagination.currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm mx-2">
            Página {data.pagination.currentPage} de {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={
              data.pagination.currentPage >= data.pagination.totalPages ||
              isLoading
            }
            onClick={() => changePage(data.pagination.currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div> */}
    </div>
  );
}
