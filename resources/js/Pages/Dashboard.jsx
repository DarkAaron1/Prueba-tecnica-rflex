import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Users, Clock, AlertTriangle, Cpu, 
    ArrowRightLeft, Calendar, CheckCircle2, 
    XCircle, ShieldCheck, UserCircle 
} from 'lucide-react';

export default function Dashboard({ auth, summary, date, latestMarks, userRole }) {
    
    const canManage = ['admin', 'manager'].includes(userRole);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
                        <RoleBadge role={userRole} />
                    </div>
                    <div className="flex items-center text-sm text-gray-500 bg-white px-4 py-1.5 rounded-full border shadow-sm font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                        {date}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* GRILLA DE KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title={userRole === 'manager' ? "Mi Equipo" : "Total Empleados"}
                            value={summary.total_employees} 
                            icon={<Users size={22} />} 
                            color="bg-blue-600" 
                        />
                        <StatCard 
                            title="Presentes Hoy" 
                            value={summary.present_today} 
                            icon={<CheckCircle2 size={22} />} 
                            color="bg-emerald-500" 
                            trend={`${summary.shifts_today} programados`}
                        />
                        <StatCard 
                            title="Atrasos" 
                            value={summary.late_today} 
                            icon={<AlertTriangle size={22} />} 
                            color="bg-amber-500" 
                        />
                        <StatCard 
                            title="Relojes Activos" 
                            value={summary.active_devices} 
                            icon={<Cpu size={22} />} 
                            color="bg-indigo-600" 
                        />
                    </div>

                    {/* TABLA DE ÚLTIMOS MOVIMIENTOS */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                                <h3 className="text-lg font-bold text-gray-800">Últimos Registros</h3>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Empleado</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hora</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dispositivo</th>
                                        {canManage && <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {latestMarks?.length > 0 ? (
                                        latestMarks.map((mark) => (
                                            <tr key={mark.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{mark.rut}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        mark.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {mark.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{mark.hora}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">{mark.dispositivo}</td>
                                                {canManage && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <button className="text-indigo-600 hover:text-indigo-900 font-semibold underline-offset-4 hover:underline">
                                                            Validar
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No hay marcas registradas.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Componentes Auxiliares
function StatCard({ title, value, icon, color, trend }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-black text-gray-800 mt-1">{value}</h3>
                {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
            </div>
            <div className={`p-4 rounded-2xl text-white shadow-lg shadow-${color.split('-')[1]}-200 ${color}`}>
                {icon}
            </div>
        </div>
    );
}

function RoleBadge({ role }) {
    const config = {
        admin: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <ShieldCheck className="w-3.5 h-3.5 mr-1"/>, label: 'Admin' },
        manager: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Users className="w-3.5 h-3.5 mr-1"/>, label: 'Jefe Área' },
        employee: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <UserCircle className="w-3.5 h-3.5 mr-1"/>, label: 'Personal' }
    };
    const { color, icon, label } = config[role] || config.employee;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${color}`}>
            {icon} {label}
        </span>
    );
}