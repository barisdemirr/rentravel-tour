import { apiPost } from "@/lib/api/client";

/** Kurumsal kiralama talebi: backend e-posta olarak iletir */
export const createCorporateRequest = (body) => apiPost("/api/corporate-requests", body);