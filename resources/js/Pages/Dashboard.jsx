import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Users, 
    Clock, 
    AlertTriangle, 
    Cpu, 
    ArrowRightLeft, 
    Calendar,
    CheckCircle2,
    XCircle
} from 'lucide-react';

export default function Dashboard({ auth, summary, date, latestMarks }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Panel de Asistencia
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                        {date}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard de Asistencia" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- GRILLA DE INDICADORES (KPIs) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        
                        <StatCard 
                            title="Total Empleados" 
                            value={summary.total_employees} 
                            icon={<Users size={24} />} 
                            color="bg-blue-500" 
                        />
                        
                        <StatCard 
                            title="Presentes Hoy" 
                            value={summary.present_today} 
                            icon={<CheckCircle2 size={24} />} 
                            color="bg-green-500" 
                            trend={`${summary.shifts_today} turnos hoy`}
                        />

                        <StatCard 
                            title="Ausentes" 
                            value={summary.absent_today} 
                            icon={<XCircle size={24} />} 
                            color="bg-red-500" 
                        />

                        <StatCard 
                            title="Atrasos Detectados" 
                            value={summary.late_today} 
                            icon={<AlertTriangle size={24} />} 
                            color="bg-amber-500" 
                        />

                        <StatCard 
                            title="Marcas Totales" 
                            value={summary.marks_today} 
                            icon={<ArrowRightLeft size={24} />} 
                            color="bg-purple-500" 
                        />

                        <StatCard 
                            title="Relojes Online" 
                            value={summary.active_devices} 
                            icon={<Cpu size={24} />} 
                            color="bg-indigo-600" 
                        />
                    </div>

                    {/* --- TABLA DE ÚLTIMOS MOVIMIENTOS --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm border">
                                    <Clock className="w-5 h-5 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Últimas Marcas Registradas
                                </h3>
                            </div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actualizado en tiempo real
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Empleado (RUT)</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Hora de Registro</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Dispositivo</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {latestMarks?.length > 0 ? (
                                        latestMarks.map((mark) => (
                                            <tr key={mark.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{mark.rut}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        mark.tipo === 'Entrada' 
                                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${mark.tipo === 'Entrada' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                                        {mark.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {mark.hora}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                                                    {mark.dispositivo}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                                No se han detectado marcas el día de hoy.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                Ver todos los registros →
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/**
 * Componente interno para las tarjetas de estadísticas
 */
function StatCard({ title, value, icon, color, trend }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    {trend && (
                        <p className="text-xs text-gray-400 mt-1 font-medium italic">
                            {trend}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl text-white shadow-lg ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}