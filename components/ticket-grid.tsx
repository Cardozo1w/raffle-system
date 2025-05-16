import { getPaginatedTickets } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default async function TicketGrid({ page = 1, pageSize = 100, raffleId = "default", showOwnerInfo = false }) {
  const { tickets, pagination } = await getPaginatedTickets(page, pageSize, raffleId)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {tickets.map((ticket) => (
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
                    {showOwnerInfo && ticket.name && <p className="text-sm font-medium">{ticket.name}</p>}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {pagination.currentPage * pagination.pageSize - pagination.pageSize + 1} a{" "}
          {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} de {pagination.total} boletos
        </div>
        <div className="flex items-center gap-1">
          <form>
            <input type="hidden" name="page" value={Math.max(1, pagination.currentPage - 1)} />
            <Button variant="outline" size="icon" disabled={pagination.currentPage <= 1} type="submit">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </form>
          <span className="text-sm mx-2">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <form>
            <input type="hidden" name="page" value={Math.min(pagination.totalPages, pagination.currentPage + 1)} />
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.currentPage >= pagination.totalPages}
              type="submit"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
