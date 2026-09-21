"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/admin/auth";
import { LOGIN_PATH } from "@/lib/admin/constants";

export async function signOutAction() {
  await signOut();
  redirect(LOGIN_PATH);
}
