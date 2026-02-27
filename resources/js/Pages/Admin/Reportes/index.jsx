import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FileDown, Search, Filter, FileSpreadsheet } from 'lucide-react';

export default function ReportIndex({ auth, reportData, filters, areas }) {
    
    const handleFilter = (e) => {
        e.preventDefault();
        const form = e.target;
        router.get(route('reports.index'), {
            start_date: form.start_date.value,
            end_date: form.end_date.value,
            area_id: form.area_id.value,
        });
    };

    // Función para descargar el Excel con los filtros actuales
    const handleExport = () => {
        // Construimos los queries basados en los filtros que vienen de Laravel
        const queryParams = new URLSearchParams({
            start_date: filters.start_date || '',
            end_date: filters.end_date || '',
            area_id: filters.area_id || '',
        }).toString();

        // Redirigimos a la ruta de exportación (ajusta el nombre de la ruta según tu web.php)
        window.location.href = `/reports/export?${queryParams}`;
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-semibold text-xl text-gray-800">Reporte de Remuneraciones</h2>}
        >
            <Head title="Reportes" />

            <div className="py-12 px-4 max-w-7xl mx-auto">
                {/* Panel de Filtros */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Desde</label>
                            <input 
                                type="date" 
                                name="start_date" 
                                defaultValue={filters.start_date} 
                                className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Hasta</label>
                            <input 
                                type="date" 
                                name="end_date" 
                                defaultValue={filters.end_date} 
                                className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Área</label>
                            <select 
                                name="area_id" 
                                defaultValue={filters.area_id} 
                                className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black uppercase text-[11px] font-bold"
                            >
                                <option value="">Todas las áreas</option>
                                {areas.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Botón Filtrar */}
                        <button 
                            type="submit" 
                            className="bg-black text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition active:scale-95"
                        >
                            <Search size={18} /> Filtrar
                        </button>

                        {/* Botón Exportar Excel */}
                        <button 
                            type="button"
                            onClick={handleExport}
                            className="bg-green-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition shadow-sm shadow-green-100 active:scale-95 text-sm"
                        >
                            <FileSpreadsheet size={18} /> Excel
                        </button>
                    </form>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Empleado / RUT</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">H. Trabajadas</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase text-red-500 tracking-widest">Atrasos (min)</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase text-green-600 tracking-widest">Extras (min)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportData.length > 0 ? (
                                    reportData.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{row.empleado}</div>
                                                <div className="text-[10px] text-gray-400 font-mono tracking-tighter">{row.rut}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                    row.estado === 'present' ? 'bg-green-100 text-green-700' : 
                                                    row.estado === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {row.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-700">{row.horas_trabajadas}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-red-500">-{row.atraso_minutos}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-600">+{row.extra_minutos}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            No hay datos registrados para este periodo o área.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}