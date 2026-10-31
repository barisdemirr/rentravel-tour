/**
 * Herkese açık verilerin önbellek ayarı.
 *
 * Eskiden her istek 60 sn'de bir yeniden üretiliyordu: bot ve ziyaretçi trafiğiyle sayfalar sürekli
 * yeniden render edilip sunucu CPU'su harcanıyordu. Artık içerik 30 dk boyunca önbellekte kalır;
 * panelden yapılan her değişiklik ise vekil rotasında `revalidateTag` ile anında sitede görünür
 * (bkz. app/api/backend/[...path]/route.js). Yani süre uzun, ama içerik bayat kalmaz.
 */
export const TTL = 1800;
export const PUBLIC_TAGS = ["catalog"];
export const PUBLIC_CACHE = { revalidate: TTL, tags: PUBLIC_TAGS };
