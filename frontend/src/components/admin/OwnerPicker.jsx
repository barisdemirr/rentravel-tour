"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { SelectInput } from "./fields";

/**
 * Fiyatlama sayfalarının üstündeki sahip seçici. Seçim adres çubuğuna yazılır.
 * groups: [{ value, label, icon, items: [{ id, label }] }]
 * typeParam / idParam: backend'in beklediği sorgu adları
 */
export default function OwnerPicker({ groups, typeParam, idParam, type, id }) {
    const router = useRouter();
    const params = useSearchParams();

    const group = groups.find((g) => g.value === type) ?? groups[0];

    const go = (nextType, nextId) => {
        const next = new URLSearchParams(params.toString());
        next.set(typeParam, nextType);
        if (nextId) next.set(idParam, nextId);
        else next.delete(idParam);
        router.replace(`?${next.toString()}`);
    };

    return (
        <div className="ad-card mb-5 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ad-body">Tür</span>
                    <SelectInput value={group.value} onChange={(e) => go(e.target.value, "")}>
                        {groups.map((g) => (
                            <option key={g.value} value={g.value}>
                                {g.label}
                            </option>
                        ))}
                    </SelectInput>
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ad-body">Kayıt</span>
                    <SelectInput value={id ?? ""} onChange={(e) => go(group.value, e.target.value)}>
                        <option value="">Seçiniz</option>
                        {group.items.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.label}
                            </option>
                        ))}
                    </SelectInput>
                </label>
            </div>

            {group.items.length === 0 && (
                <p className="mt-3 flex items-start gap-2 text-xs text-ad-warn">
                    <Icon name="info" className="mt-px shrink-0 text-[14px]" />
                    Bu türde henüz kayıt yok.
                </p>
            )}
        </div>
    );
}