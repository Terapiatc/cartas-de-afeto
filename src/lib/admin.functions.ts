import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const matriculaSchema = z
  .string()
  .trim()
  .min(2, "Matrícula muito curta")
  .max(40)
  .regex(/^[A-Za-z0-9._-]+$/, "Use apenas letras, números, ponto, hífen ou underline");

function toEmail(matricula: string) {
  return `${matricula.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@cartas.local`;
}

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(80),
        matricula: matriculaSchema,
        password: z.string().min(8, "A senha precisa de ao menos 8 caracteres").max(72),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("Já existe um administrador cadastrado.");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: toEmail(data.matricula),
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar administrador");

    await supabaseAdmin
      .from("profiles")
      .insert({ id: created.user.id, name: data.name, matricula: data.matricula });
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });

    return { ok: true };
  });

export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return { exists: (count ?? 0) > 0 };
});

export const createVolunteer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(80),
        email: z.string().trim().email().max(255),
        matricula: matriculaSchema,
        password: z.string().min(8).max(72),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: toEmail(data.matricula),
      password: data.password,
      email_confirm: true,
      user_metadata: { contact_email: data.email },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar voluntário");

    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .insert({ id: created.user.id, name: data.name, matricula: data.matricula });
    if (pErr) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("Matrícula já cadastrada");
    }
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "volunteer" });

    return { ok: true };
  });

export const deleteVolunteer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado");
    if (data.id === context.userId) throw new Error("Você não pode excluir a si mesmo");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.deleteUser(data.id);
    return { ok: true };
  });
