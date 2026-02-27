import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Clock, 
    User as UserIcon,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Modal from '@/Components/Modal'; // Componente estándar de Laravel Breeze

export default function Planning({ auth, employees, weekConfig }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Formulario para asignar turnos
    const { data, setData, post, processing, reset, errors } = useForm({
        employee_id: '',
        date: '',
        in_time: '08:00',
        out_time: '18:00',
    });

    // Helper para formatear horas de strings ISO
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Función para abrir modal y pre-cargar datos
    const openAssignmentModal = (employeeId, date) => {
        setData({
            ...data,
            employee_id: employeeId,
            date: date,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('shifts.planning.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    // Lógica de colores según el status calculado por tus Jobs
    const getShiftStyle = (status) => {
        const base = "group relative p-2 rounded-lg border-2 text-[11px] h-full flex flex-col justify-between transition-all shadow-sm";
        switch (status) {
            case 'present': 
                return `${base} bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400`;
            case 'late': 
                return `${base} bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400`;
            case 'absent': 
                return `${base} bg-red-50 border-red-200 text-red-700 hover:border-red-400`;
            case 'early_departure': 
                return `${base} bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-400`;
            default: // pending
                return `${base} bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-400`;
        }
    };

    // Función para buscar el turno en el array de turnos del empleado
    const findShift = (employeeShifts, dateString) => {
        return employeeShifts.find(shift => {
            const shiftDate = new Date(shift.scheduled_in).toISOString().split('T')[0];
            return shiftDate === dateString;
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Planificación de Turnos</h2>}
        >
            <Head title="Planificación Semanal" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
                
                {/* Cabecera con Controles */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                            <ChevronLeft size={20}/>
                        </button>
                        <div className="px-6 py-2 font-bold text-gray-700 flex items-center gap-2 border-x border-gray-100">
                            <CalendarIcon size={18} className="text-indigo-600"/>
                            Semana del {weekConfig.start} al {weekConfig.end}
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                            <ChevronRight size={20}/>
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm">
                            Copiar Semana Anterior
                        </button>
                    </div>
                </div>

                {/* Tabla de Planificación */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 backdrop-blur-sm">
                                    <th className="sticky left-0 z-20 bg-gray-50 p-5 border-b border-r text-left text-xs font-black text-gray-400 uppercase tracking-widest min-w-[280px]">
                                        Colaborador
                                    </th>
                                    {weekConfig.days.map((day) => (
                                        <th key={day.full_date} className="p-4 border-b text-center min-w-[160px]">
                                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day.label.split(' ')[0]}</span>
                                            <span className="block text-lg font-bold text-gray-700">{day.label.split(' ')[1]}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Celda de Empleado */}
                                        <td className="sticky left-0 z-10 bg-white p-5 border-r shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold mr-4 shadow-indigo-200 shadow-lg">
                                                    {emp?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-800 leading-tight">{emp?.name || 'Sin nombre'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{emp.area?.name || 'General'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Celdas de Días */}
                                        {weekConfig.days.map((day) => {
                                            const shift = findShift(emp.shifts || [], day.full_date);
                                            
                                            return (
                                                <td key={day.full_date} className="p-2 border-r last:border-r-0 h-32 align-top">
                                                    {shift ? (
                                                        <div className={getShiftStyle(shift.status)}>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-black uppercase tracking-widest text-[9px]">
                                                                    {shift.status === 'pending' ? 'Programado' : shift.status.replace('_', ' ')}
                                                                </span>
                                                                {shift.status === 'present' && <CheckCircle2 size={12} />}
                                                                {(shift.status === 'late' || shift.status === 'absent') && <AlertCircle size={12} />}
                                                            </div>

                                                            <div className="flex items-center gap-1 font-mono font-bold text-sm">
                                                                <Clock size={12}/>
                                                                {formatTime(shift.scheduled_in)} - {formatTime(shift.scheduled_out)}
                                                            </div>

                                                            {/* Mini indicadores de marcas reales vinculadas por el Job */}
                                                            <div className="mt-3 flex gap-1.5 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                                                <div className={`h-full w-1/2 transition-colors ${shift.actual_in_id ? 'bg-current opacity-100' : 'bg-transparent'}`} />
                                                                <div className={`h-full w-1/2 transition-colors ${shift.actual_out_id ? 'bg-current opacity-100' : 'bg-transparent'}`} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => openAssignmentModal(emp.id, day.full_date)}
                                                            className="w-full h-full border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center group/btn hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer"
                                                        >
                                                            <Plus size={20} className="text-gray-200 group-hover/btn:text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Asignación */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800">Programar Turno</h2>
                            <p className="text-sm text-gray-500 font-medium">Define el horario de entrada y salida</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Entrada</label>
                                <input 
                                    type="time" 
                                    value={data.in_time} 
                                    onChange={e => setData('in_time', e.target.value)} 
                                    className="w-full rounded-xl border-gray-200 border-2 focus:border-indigo-500 focus:ring-0 font-bold text-gray-700"
                                />
                                {errors.in_time && <span className="text-red-500 text-xs">{errors.in_time}</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Salida</label>
                                <input 
                                    type="time" 
                                    value={data.out_time} 
                                    onChange={e => setData('out_time', e.target.value)} 
                                    className="w-full rounded-xl border-gray-200 border-2 focus:border-indigo-500 focus:ring-0 font-bold text-gray-700"
                                />
                                {errors.out_time && <span className="text-red-500 text-xs">{errors.out_time}</span>}
                            </div>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 font-medium">
                                Si la hora de salida es menor a la de entrada, el sistema asumirá automáticamente que el turno finaliza el día siguiente.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                            {processing ? 'Guardando...' : 'Confirmar Turno'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}