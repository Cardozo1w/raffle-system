"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { sellTicket, getTickets } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SellTicketForm({ raffleId = "default" }) {
  const [loading, setLoading] = useState(false)
  const [availableTickets, setAvailableTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [searchValue, setSearchValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()
  const router = useRouter()
  const ticketsPerPage = 100

  // Cargar boletos disponibles
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const tickets = await getTickets(raffleId)
        setAvailableTickets(tickets.filter((t) => !t.sold))
      } catch (error) {
        console.error("Error al cargar boletos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los boletos disponibles",
          variant: "destructive",
        })
      }
    }
    loadTickets()
  }, [raffleId, toast])

  // Filtrar boletos por búsqueda
  const filteredTickets = searchValue
    ? availableTickets.filter((t) => t.number.toString().includes(searchValue))
    : availableTickets

  // Paginar boletos
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage)
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage)

  async function handleSubmit(formData) {
    setLoading(true)
    try {
      await sellTicket(formData)
      toast({
        title: "Boleto vendido",
        description: `El boleto #${formData.get("ticketNumber")} ha sido vendido a ${formData.get("name")}`,
      })
      router.refresh()
      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo vender el boleto. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="searchTicket">Buscar boleto</Label>
        <Input
          id="searchTicket"
          placeholder="Ingrese número de boleto"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="ticketNumber">Seleccione un boleto</Label>
          <div className="flex items-center gap-2 text-sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span>
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
          {paginatedTickets.length > 0 ? (
            paginatedTickets.map((ticket) => (
              <div
                key={ticket.number}
                onClick={() => setSelectedTicket(ticket.number)}
                className={`
                  aspect-square flex items-center justify-center rounded-md border text-sm font-bold cursor-pointer
                  ${
                    selectedTicket === ticket.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                  }
                `}
              >
                {ticket.number}
              </div>
            ))
          ) : (
            <div className="col-span-10 py-8 text-center text-muted-foreground">
              No se encontraron boletos disponibles
            </div>
          )}
        </div>
        <input type="hidden" name="ticketNumber" value={selectedTicket || ""} required />

        {selectedTicket && (
          <div className="bg-muted p-2 rounded text-center">
            Boleto seleccionado: <span className="font-bold">{selectedTicket}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" type="tel" required />
      </div>

      <Button type="submit" className="w-full" disabled={loading || !selectedTicket}>
        {loading ? "Procesando..." : "Vender Boleto"}
      </Button>
    </form>
  )
}
