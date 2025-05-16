import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-slate-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin" className="font-bold text-xl">
            Panel Administrativo
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/logout" className="flex items-center gap-1">
              <LogOut size={16} />
              Cerrar sesión
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
