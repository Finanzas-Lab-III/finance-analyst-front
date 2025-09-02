import { redirect } from "next/navigation";

export default function Page() {
  // Mantener compat y enviar a la página original de archivo asignado al usuario
  redirect("/backoffice/archive");
}


