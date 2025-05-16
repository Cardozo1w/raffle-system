"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { initializeTickets } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function InitializeTicketsForm() {
  const [loading, setLoading] = useState(false)
  const [totalTickets, setTotalTickets] = useState(1000)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    try {
      const result = await initializeTickets(totalTickets)
      toast({
        title: "Éxito",
        description: result.message || "Boletos inicializados correctamente",
      })
      router.refresh()
      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron inicializar los boletos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Esta acción solo debe realizarse una vez cuando se configura el sistema por primera vez. Si ya existen
          boletos, no se crearán duplicados.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totalTickets">Número total de boletos</Label>
          <Input
            id="totalTickets"
            type="number"
            min="1"
            max="10000"
            value={totalTickets}
            onChange={(e) => setTotalTickets(Number.parseInt(e.target.value))}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Inicializando..." : "Inicializar Boletos"}
        </Button>
      </form>
    </div>
  )
}
