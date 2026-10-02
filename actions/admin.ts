"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { findOrCreateCanonicalQuestion } from "@/lib/deduplicate";

/**
 * ADMIN ONLY: Create a new recruiting company
 */
export async function createCompanyAction(data: {
  name: string;
  industry?: string;
  website?: string;
  description?: string;
}) {
  await requireAdmin();

  if (!data.name || !data.name.trim()) {
    return { error: "Company name is required." };
  }

  const name = data.name.trim();
  const slug = slugify(name);

  const existing = await prisma.company.findUnique({ where: { slug } });
  if (existing) {
    return { error: "A company with this name or slug already exists." };
  }

  const company = await prisma.company.create({
    data: {
      name,
      slug,
      industry: data.industry?.trim() || null,
      website: data.website?.trim() || null,
      description: data.description?.trim() || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/companies");
  revalidatePath("/share");
  return { success: true, company };
}

/**
 * ADMIN ONLY: Delete a company and cascade
 */
export async function deleteCompanyAction(companyId: string) {
  await requireAdmin();

  const count = await prisma.experience.count({ where: { companyId } });
  if (count > 0) {
    return {
      error: `Cannot delete company. It has ${count} existing interview experience(s) associated with it.`,
    };
  }

  await prisma.company.delete({ where: { id: companyId } });

  revalidatePath("/admin");
  revalidatePath("/companies");
  revalidatePath("/share");
  return { success: true };
}

/**
 * ADMIN ONLY: Add a role to a company
 */
export async function createCompanyRoleAction(companyId: string, title: string) {
  await requireAdmin();

  if (!companyId || !title || !title.trim()) {
    return { error: "Company and role title are required." };
  }

  const roleTitle = title.trim();
  const slug = slugify(roleTitle);

  const existing = await prisma.companyRole.findUnique({
    where: {
      companyId_slug: { companyId, slug },
    },
  });

  if (existing) {
    return { error: "This role already exists for this company." };
  }

  const role = await prisma.companyRole.create({
    data: {
      companyId,
      title: roleTitle,
      slug,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/companies");
  revalidatePath("/share");
  return { success: true, role };
}

/**
 * ADMIN ONLY: Delete a role from a company
 */
export async function deleteCompanyRoleAction(roleId: string) {
  await requireAdmin();

  const count = await prisma.experience.count({ where: { roleId } });
  if (count > 0) {
    return {
      error: `Cannot delete role. It is used in ${count} interview experience(s).`,
    };
  }

  await prisma.companyRole.delete({ where: { id: roleId } });

  revalidatePath("/admin");
  revalidatePath("/companies");
  revalidatePath("/share");
  return { success: true };
}

/**
 * ADMIN ONLY: Update a registered user's role (STUDENT <-> ADMIN)
 */
export async function updateUserRoleAction(userId: string, newRole: "STUDENT" | "ADMIN") {
  const currentAdmin = await requireAdmin();

  if (userId === currentAdmin.id && newRole === "STUDENT") {
    return { error: "You cannot demote yourself from admin status." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin");
  revalidatePath("/profile");
  return { success: true };
}

/**
 * ADMIN ONLY: Add a new canonical question directly to the Questions Bank
 */
export async function createQuestionAction(data: {
  text: string;
  topicId?: string;
  round?: string;
  difficulty?: string;
}) {
  await requireAdmin();

  if (!data.text || !data.text.trim()) {
    return { error: "Question text is required." };
  }

  try {
    const question = await findOrCreateCanonicalQuestion({
      text: data.text.trim(),
      topicId: data.topicId || null,
      round: data.round || "TECHNICAL",
      difficulty: data.difficulty || "MEDIUM",
    });

    revalidatePath("/admin");
    revalidatePath("/questions");
    return { success: true, question };
  } catch (err: any) {
    return { error: err.message || "Failed to create question." };
  }
}

/**
 * ADMIN ONLY: Delete a question from the Questions Bank
 */
export async function deleteQuestionAction(questionId: string) {
  await requireAdmin();

  try {
    await prisma.question.delete({
      where: { id: questionId },
    });

    revalidatePath("/admin");
    revalidatePath("/questions");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete question." };
  }
}

/**
 * USER & ADMIN: Find or create a company on-the-fly during experience submission
 */
export async function findOrCreateCompanyAction(name: string, industry?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to add a company." };
  }

  if (!name || !name.trim()) {
    return { error: "Company name is required." };
  }

  const trimmed = name.trim();
  const slug = slugify(trimmed);

  const existing = await prisma.company.findUnique({
    where: { slug },
    include: { roles: true },
  });

  if (existing) {
    return { success: true, company: existing };
  }

  // Only admins can register new companies
  if (user.role !== "ADMIN") {
    return { error: "Only administrators can register new companies. Please select an existing company from the directory." };
  }

  const company = await prisma.company.create({
    data: {
      name: trimmed,
      slug,
      industry: industry?.trim() || null,
    },
    include: { roles: true },
  });

  revalidatePath("/share");
  revalidatePath("/companies");
  revalidatePath("/admin");
  return { success: true, company };
}

/**
 * USER & ADMIN: Find or create a role on-the-fly during experience submission
 */
export async function findOrCreateRoleAction(companyId: string, title: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to add a role." };
  }

  if (!companyId || !title || !title.trim()) {
    return { error: "Company and role title are required." };
  }

  const roleTitle = title.trim();
  const slug = slugify(roleTitle);

  const existing = await prisma.companyRole.findUnique({
    where: {
      companyId_slug: { companyId, slug },
    },
  });

  if (existing) {
    return { success: true, role: existing };
  }

  const role = await prisma.companyRole.create({
    data: {
      companyId,
      title: roleTitle,
      slug,
    },
  });

  revalidatePath("/share");
  revalidatePath("/companies");
  revalidatePath("/admin");
  return { success: true, role };
}
