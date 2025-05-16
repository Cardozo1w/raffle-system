"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function TicketStatusToggle({ ticket }: { ticket: any }) {
  const [status, setStatus] = useState(ticket.status);
  const [open, setOpen] = useState(false);
  const [loading, startTransition] = useTransition();

  const toggleStatus = async () => {
    startTransition(async () => {
      const newStatus = status === "Pagado" ? "No pagado" : "Pagado";

      const res = await fetch(`/api/tickets/${ticket.number}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        toast.success("Estado actualizado");
        setOpen(false);
      } else {
        toast.error("No se pudo actualizar el estado");
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${
                status === "Pagado"
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              }
            `}
          >
            {status}
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Cambiar estado a {status === "Pagado" ? "No pagado" : "Pagado"}?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={toggleStatus} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
