"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { sellTicket } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SellTicketForm({ raffleId = "default" }) {
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState([])
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const ticketsPerPage = 100

  // Cargar todos los boletos
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const response = await fetch(`/api/tickets?pageSize=1000&raffleId=${raffleId}`)
        if (!response.ok) throw new Error("Error al cargar boletos")
        const data = await response.json()
        setTickets(data.tickets || [])
      } catch (error) {
        console.error("Error al cargar boletos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los boletos",
          variant: "destructive",
        })
      }
    }
    loadTickets()
  }, [raffleId, toast])

  const filteredTickets = searchValue
    ? tickets.filter((t) => t.number.toString().includes(searchValue))
    : tickets

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage)
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ticketsPerPage,
    currentPage * ticketsPerPage
  )

  const toggleTicketSelection = (number: number) => {
    setSelectedTickets((prev) =>
      prev.includes(number)
        ? prev.filter((n) => n !== number)
        : [...prev, number]
    )
  }

  const handleTrySubmit = (e) => {
    e.preventDefault()
    if (selectedTickets.length > 1) {
      setShowConfirm(true)
    } else {
      handleSubmit(new FormData(e.target))
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const data = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        status: formData.get("status"),
        ticketNumbers: selectedTickets,
      };

      await sellTicket(data)

      toast({
        title: "Boletos vendidos",
        description: `Se vendieron ${selectedTickets.length} boletos a ${data.name}`,
      })
      router.refresh()
      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudo vender. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <form onSubmit={handleTrySubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="searchTicket">Buscar boleto</Label>
          <Input
            id="searchTicket"
            placeholder="Ingrese número de boleto"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Seleccione boletos</Label>
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
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket) => {
                const isSelected = selectedTickets.includes(ticket.number);
                return (
                  <div
                    key={ticket.number}
                    onClick={() =>
                      !ticket.sold && toggleTicketSelection(ticket.number)
                    }
                    className={`
                      aspect-square flex items-center justify-center rounded-md border text-sm font-bold
                      ${
                        ticket.sold
                          ? "bg-red-100 border-red-300 text-red-700 cursor-not-allowed"
                          : isSelected
                          ? "bg-primary text-primary-foreground cursor-pointer"
                          : "bg-green-100 border-green-300 text-green-700 cursor-pointer hover:bg-green-200"
                      }
                    `}
                  >
                    {ticket.number}
                  </div>
                );
              })
            ) : (
              <div className="col-span-10 py-8 text-center text-muted-foreground">
                No se encontraron boletos
              </div>
            )}
          </div>

          {selectedTickets.length > 0 && (
            <div className="bg-muted p-2 rounded text-center">
              Boletos seleccionados:{" "}
              <span className="font-bold">{selectedTickets.join(", ")}</span>
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
          <div className="space-y-2">
            <Label htmlFor="status">Estado de Pago</Label>
            <select
              id="status"
              name="status"
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
              defaultValue="Pagado"
            >
              <option value="Pagado">Pagado</option>
              <option value="No pagado">No pagado</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || selectedTickets.length === 0}
        >
          {loading ? "Procesando..." : "Vender Boletos"}
        </Button>
      </form>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Venta</DialogTitle>
            <DialogDescription>
              Vas a vender <strong>{selectedTickets.length}</strong> boletos:
              <div className="mt-2 font-bold">{selectedTickets.join(", ")}</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(new FormData(e.target as HTMLFormElement));
              }}
              className="w-full"
            >
              <input
                type="hidden"
                name="name"
                value={
                  (document?.getElementById("name") as HTMLInputElement)?.value
                }
              />
              <input
                type="hidden"
                name="phone"
                value={
                  (document?.getElementById("phone") as HTMLInputElement)?.value
                }
              />
              <input type="hidden" name="status" value={(document.getElementById("status") as HTMLSelectElement)?.value} />
              <Button type="submit" disabled={loading} className="w-full">
                Confirmar y Vender
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
