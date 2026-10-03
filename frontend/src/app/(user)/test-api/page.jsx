import { getVehicleSegments } from "@/services/vehicleSegments";
import { getBungalowRegions } from "@/services/bungalowRegions";
import { getTourCategories } from "@/services/tourCategories";

export default async function TestApiPage() {
    const [segments, regions, categories] = await Promise.all([
        getVehicleSegments(),
        getBungalowRegions(),
        getTourCategories("daily"),
    ]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API Test</h1>

            <section className="mb-6">
                <h2 className="text-lg font-semibold">Araç Segmentleri ({segments.length})</h2>
                <pre className="bg-gray-100 p-4 rounded text-xs">
                    {JSON.stringify(segments, null, 2)}
                </pre>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-semibold">Bungalov Bölgeleri ({regions.length})</h2>
                <pre className="bg-gray-100 p-4 rounded text-xs">
                    {JSON.stringify(regions, null, 2)}
                </pre>
            </section>

            <section>
                <h2 className="text-lg font-semibold">Günübirlik Tur Kategorileri ({categories.length})</h2>
                <pre className="bg-gray-100 p-4 rounded text-xs">
                    {JSON.stringify(categories, null, 2)}
                </pre>
            </section>
        </div>
    );
}