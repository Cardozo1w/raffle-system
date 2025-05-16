"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { env } from "process"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

// Función para iniciar sesión
export async function login(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Crear una cookie de sesión simple
    const cookieStore = await cookies()
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
  const cookieStore = await cookies()
  const session = cookieStore.get("auth_session")

  return session?.value === "authenticated"
}

// Función para cerrar sesión
export async function logout() {
  const cookieStore = await cookies()
  await cookieStore.delete("auth_session")

  redirect("/admin/login")
}
