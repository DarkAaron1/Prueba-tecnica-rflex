import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FileDown, Search, Filter } from 'lucide-react';

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

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Reporte de Remuneraciones</h2>}>
            <Head title="Reportes" />

            <div className="py-12 px-4 max-w-7xl mx-auto">
                {/* Panel de Filtros */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Desde</label>
                            <input type="date" name="start_date" defaultValue={filters.start_date} className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Hasta</label>
                            <input type="date" name="end_date" defaultValue={filters.end_date} className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Área</label>
                            <select name="area_id" defaultValue={filters.area_id} className="w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black">
                                <option value="">Todas las áreas</option>
                                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="bg-black text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition">
                            <Search size={18} /> Filtrar Datos
                        </button>
                    </form>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase">Empleado / RUT</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase">H. Trabajadas</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase text-red-500">Atrasos (min)</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase text-green-600">Extras (min)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportData.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{row.empleado}</div>
                                            <div className="text-[10px] text-gray-400 font-mono">{row.rut}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                                row.estado === 'present' ? 'bg-green-100 text-green-700' : 
                                                row.estado === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {row.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-700">{row.horas_trabajadas}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-red-500">{row.atraso_minutos}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-green-600">{row.extra_minutos}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}