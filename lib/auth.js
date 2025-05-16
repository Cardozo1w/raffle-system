"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Credenciales hardcodeadas (en producción, usar variables de entorno)
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123"

// Función para iniciar sesión
export async function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Crear una cookie de sesión simple
    const cookieStore = cookies()
    cookieStore.set("auth_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    return true
  }

  return false
}

// Función para verificar autenticación
export async function checkAuth() {
  const cookieStore = cookies()
  const session = cookieStore.get("auth_session")

  return session?.value === "authenticated"
}

// Función para cerrar sesión
export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("auth_session")

  redirect("/admin/login")
}
