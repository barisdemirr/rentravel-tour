import { apiPost } from "@/lib/api/client";

/** VIP talep formu: backend e-posta olarak iletir */
export const createVipRequest = (body) => apiPost("/api/vip-requests", body);