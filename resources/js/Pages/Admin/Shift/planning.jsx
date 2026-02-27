import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon,
    AlertCircle, CheckCircle2, Trash2, Edit2, Lock, Copy
} from 'lucide-react';
import Modal from '@/Components/Modal';

export default function Planning({ auth, employees, weekConfig }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [now, setNow] = useState(new Date());

    // Actualizamos el reloj interno cada minuto para que el bloqueo sea reactivo en tiempo real
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        employee_id: '',
        date: '',
        in_time: '08:00',
        out_time: '18:00',
    });

    // --- LÓGICA DE VALIDACIÓN ---
    // Un turno es editable solo si su hora de inicio es mayor a la hora actual
    const canEditShift = (scheduledInString) => {
        return now < new Date(scheduledInString);
    };

    // Un día está cerrado si ya pasó su último segundo (23:59:59)
    const isDayPast = (dateString) => {
        const endOfDay = new Date(dateString + 'T23:59:59');
        return now > endOfDay;
    };

    // --- ACCIONES DE NAVEGACIÓN ---
    const navigateWeek = (direction) => {
        const date = new Date(weekConfig.start);
        date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
        router.get(route('shifts.planning'), { date: date.toISOString().split('T')[0] }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleCopyWeek = () => {
    // Confirmación visual
    if (confirm('¿Copiar todos los turnos de la semana anterior a esta?')) {
        router.post(route('shifts.planning.copy'), {
            // Enviamos el 'start' que viene del backend en weekConfig
            target_date: weekConfig.start 
        }, {
            onSuccess: () => alert('Turnos copiados correctamente'),
            onError: (errors) => alert(errors.error || 'Ocurrió un error al copiar')
        });
    }
};

    // --- MANEJO DE MODALES ---
    const openCreateModal = (employeeId, date) => {
        setEditingShift(null);
        setData({ employee_id: employeeId, date: date, in_time: '08:00', out_time: '18:00' });
        setIsModalOpen(true);
    };

    const openEditModal = (shift) => {
        setEditingShift(shift);
        // Extraemos solo la hora HH:mm de los timestamps
        const startTime = new Date(shift.scheduled_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = new Date(shift.scheduled_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        setData({ in_time: startTime, out_time: endTime });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingShift) {
            put(route('shifts.planning.update', editingShift.id), {
                onSuccess: () => { setIsModalOpen(false); reset(); }
            });
        } else {
            post(route('shifts.planning.store'), {
                onSuccess: () => { setIsModalOpen(false); reset(); }
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este turno?')) {
            destroy(route('shifts.planning.destroy', id));
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Planificador Maestro de Turnos</h2>}
        >
            <Head title="Planificación Semanal" />

            <div className="py-6 px-4 max-w-[1600px] mx-auto">
                
                {/* Cabecera de Herramientas */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigateWeek('prev')} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
                            <ChevronLeft size={24}/>
                        </button>
                        <div className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black flex items-center gap-3 border border-indigo-100 shadow-sm">
                            <CalendarIcon size={18}/>
                            <span className="uppercase tracking-tighter text-sm">Semana: {weekConfig.start} al {weekConfig.end}</span>
                        </div>
                        <button onClick={() => navigateWeek('next')} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
                            <ChevronRight size={24}/>
                        </button>
                    </div>

                    <button 
                        onClick={handleCopyWeek}
                        className="flex items-center gap-2 bg-white border-2 border-indigo-100 text-indigo-600 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                    >
                        <Copy size={18} />
                        Copiar Semana Anterior
                    </button>
                </div>

                {/* Grid de Planificación */}
                <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200 backdrop-blur-md">
                                    <th className="sticky left-0 z-20 bg-gray-50 p-6 border-r text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] min-w-[280px]">Colaborador</th>
                                    {weekConfig.days.map(day => (
                                        <th key={day.full_date} className="p-4 text-center min-w-[160px] border-r border-gray-100">
                                            <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{day.label.split(' ')[0]}</div>
                                            <div className="text-xl font-bold text-gray-700">{day.label.split(' ')[1]}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map(emp => (
                                    <tr key={emp.id} className="group/row">
                                        <td className="sticky left-0 z-10 bg-white p-6 border-r shadow-sm transition-colors group-hover/row:bg-indigo-50/30">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100 uppercase">
                                                    {emp?.user?.name?.charAt(0) || 'E'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-800 leading-none mb-1">{emp?.user?.name || 'Sin Nombre'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{emp?.area?.name || 'General'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {weekConfig.days.map(day => {
                                            const dayShifts = (emp.shifts || []).filter(s => s.scheduled_in.startsWith(day.full_date));
                                            const dayIsPast = isDayPast(day.full_date);

                                            return (
                                                <td key={day.full_date} className="p-3 border-r border-gray-50 align-top min-h-[160px] transition-colors group-hover/row:bg-gray-50/20">
                                                    <div className="flex flex-col gap-3">
                                                        {dayShifts.map(shift => {
                                                            const editable = canEditShift(shift.scheduled_in);
                                                            return (
                                                                <div key={shift.id} className={`group relative p-3 rounded-[1rem] border transition-all ${!editable ? 'bg-gray-50/80 border-gray-100 opacity-70' : 'bg-white border-indigo-100 shadow-sm hover:border-indigo-400 hover:shadow-md'}`}>
                                                                    <div className="flex justify-between items-center mb-1.5">
                                                                        <span className={`text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 ${!editable ? 'text-gray-400' : 'text-indigo-600'}`}>
                                                                            {!editable && <Lock size={10} />}
                                                                            {shift.status}
                                                                        </span>
                                                                        
                                                                        {editable && (
                                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button onClick={() => openEditModal(shift)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit2 size={12}/></button>
                                                                                <button onClick={() => handleDelete(shift.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={12}/></button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className={`font-mono font-black text-[12px] flex items-center gap-1 ${!editable ? 'text-gray-400' : 'text-gray-700'}`}>
                                                                        <Clock size={12} className="opacity-40"/>
                                                                        {formatTime(shift.scheduled_in)} - {formatTime(shift.scheduled_out)}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        
                                                        {!dayIsPast ? (
                                                            <button 
                                                                onClick={() => openCreateModal(emp.id, day.full_date)}
                                                                className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all group/plus"
                                                            >
                                                                <Plus size={20} className="group-hover/plus:scale-110 transition-transform" />
                                                            </button>
                                                        ) : (
                                                            <div className="py-3 text-center text-[9px] font-black text-gray-300 uppercase italic tracking-widest border border-gray-50 rounded-2xl">Cerrado</div>
                                                        )}
                                                    </div>
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

            {/* Modal de Gestión de Turnos */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                            <Clock size={28}/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 leading-none mb-1">
                                {editingShift ? 'Modificar Turno' : 'Nuevo Turno'}
                            </h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                                {data.date}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Entrada</label>
                            <input 
                                type="time" 
                                value={data.in_time} 
                                onChange={e => setData('in_time', e.target.value)} 
                                className="w-full rounded-2xl border-gray-200 border-2 p-4 focus:border-indigo-600 focus:ring-0 font-black text-lg text-gray-700 shadow-inner" 
                            />
                            {errors.in_time && <p className="text-red-500 text-[10px] font-bold mt-1 px-2">{errors.in_time}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Salida</label>
                            <input 
                                type="time" 
                                value={data.out_time} 
                                onChange={e => setData('out_time', e.target.value)} 
                                className="w-full rounded-2xl border-gray-200 border-2 p-4 focus:border-indigo-600 focus:ring-0 font-black text-lg text-gray-700 shadow-inner" 
                            />
                            {errors.out_time && <p className="text-red-500 text-[10px] font-bold mt-1 px-2">{errors.out_time}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="flex-1 py-4 font-black text-gray-400 hover:bg-gray-100 rounded-2xl transition-colors uppercase text-xs tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase text-xs tracking-[0.2em] disabled:opacity-50"
                        >
                            {processing ? 'Procesando...' : (editingShift ? 'Actualizar Turno' : 'Crear Turno')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}