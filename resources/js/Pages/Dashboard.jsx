import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Users, Clock, AlertTriangle, Cpu,
    ArrowRightLeft, Calendar, CheckCircle2,
    XCircle, ShieldCheck, UserCircle, Briefcase, LogIn, LogOut, Info
} from 'lucide-react';

export default function Dashboard({ auth, summary, date, latestMarks, userRole, todayShift }) {

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

                    {/* GRILLA DE KPIs DINÁMICA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                        {/* Card 1: Mi Equipo / Mi Estado (Ya lo teníamos) */}
                        {userRole !== 'employee' ? (
                            <StatCard
                                title="Total Empleados"
                                value={summary.total_employees}
                                icon={<Users size={22} />}
                                color="bg-blue-600"
                            />
                        ) : (
                            <StatCard
                                title="Mi Estado Hoy"
                                value={todayShift ? todayShift.status : 'Libre'}
                                icon={<UserCircle size={22} />}
                                color="bg-indigo-600"
                            />
                        )}

                        {/* Card 2: Marcas del día */}
                        <StatCard
                            title={userRole === 'employee' ? "Marcas Hoy" : "Presentes Hoy"}
                            value={userRole === 'employee' ? summary.marks_today : summary.present_today}
                            icon={<CheckCircle2 size={22} />}
                            color="bg-emerald-500"
                        />

                        {/* Card 3: Atrasos (Siempre importante) */}
                        <StatCard
                            title={userRole === 'employee' ? "Mis Atrasos" : "Atrasos Totales"}
                            value={summary.late_today}
                            icon={<AlertTriangle size={22} />}
                            color="bg-amber-500"
                        />

                        {/* Card 4: INDICADOR DE HORAS TRABAJADAS (Nueva lógica) */}
                        {userRole === 'employee' ? (
                            <StatCard
                                title="Horas del Mes"
                                value={summary.monthly_hours}
                                icon={<Briefcase size={22} />}
                                color="bg-slate-800"
                                trend="Acumulado mensual"
                            />
                        ) : (
                            <StatCard
                                title="Relojes Activos"
                                value={summary.active_devices}
                                icon={<Cpu size={22} />}
                                color="bg-slate-800"
                            />
                        )}
                    </div>

                    {/* SECCIÓN EXCLUSIVA PARA EMPLEADO: MI TURNO DE HOY */}
                    {userRole === 'employee' && (
                        <div className="mb-8 bg-white p-1 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                            <div className="bg-indigo-600 p-6 rounded-[1.4rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                        <Clock className="text-white" size={32} />
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-xs font-black uppercase tracking-widest">Mi Turno de Hoy</p>
                                        <h3 className="text-2xl font-black">
                                            {todayShift ? `${todayShift.scheduled_in_time} - ${todayShift.scheduled_out_time}` : 'Sin turno programado'}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex gap-4 w-full md:w-auto">
                                    <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-bold uppercase opacity-60">Entrada Real</p>
                                        <p className="font-black text-lg">{todayShift?.actual_in?.timestamp ? todayShift.actual_in.timestamp : '--:--'}</p>
                                    </div>
                                    <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-bold uppercase opacity-60">Salida Real</p>
                                        <p className="font-black text-lg">{todayShift?.actual_out?.timestamp ? todayShift.actual_out.timestamp : '--:--'}</p>
                                    </div>
                                </div>

                                <div className={`px-6 py-2 rounded-full font-black uppercase text-xs border-2 ${todayShift?.status === 'present' ? 'bg-emerald-400/20 border-emerald-400 text-emerald-100' : 'bg-amber-400/20 border-amber-400 text-amber-100'
                                    }`}>
                                    {todayShift?.status || 'Pendiente'}
                                </div>
                            </div>
                        </div>
                    )}
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
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${mark.tipo === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
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
                                            <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center text-gray-400 italic">No hay marcas registradas.</td>
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
        admin: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />, label: 'Admin' },
        manager: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Users className="w-3.5 h-3.5 mr-1" />, label: 'Jefe Área' },
        employee: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <UserCircle className="w-3.5 h-3.5 mr-1" />, label: 'Personal' }
    };
    const { color, icon, label } = config[role] || config.employee;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${color}`}>
            {icon} {label}
        </span>
    );
}