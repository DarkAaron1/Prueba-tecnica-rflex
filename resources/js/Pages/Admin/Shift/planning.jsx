import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon,
    AlertCircle, CheckCircle2, Trash2, Edit2, Lock
} from 'lucide-react';
import Modal from '@/Components/Modal';

export default function Planning({ auth, employees, weekConfig }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [now, setNow] = useState(new Date());

    // Actualizamos el reloj interno cada minuto para que el bloqueo sea reactivo
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
    const canEditShift = (scheduledInString) => {
        return now < new Date(scheduledInString);
    };

    const isDayPast = (dateString) => {
        const endOfDay = new Date(dateString + 'T23:59:59');
        return now > endOfDay;
    };

    // --- ACCIONES ---
    const navigateWeek = (direction) => {
        const date = new Date(weekConfig.start);
        date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
        router.get(route('shifts.planning'), { date: date.toISOString().split('T')[0] });
    };

    const openCreateModal = (employeeId, date) => {
        setEditingShift(null);
        setData({ employee_id: employeeId, date: date, in_time: '08:00', out_time: '18:00' });
        setIsModalOpen(true);
    };

    const openEditModal = (shift) => {
        setEditingShift(shift);
        const startTime = new Date(shift.scheduled_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = new Date(shift.scheduled_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        setData({ in_time: startTime, out_time: endTime });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = editingShift
            ? put(route('shifts.planning.update', editingShift.id))
            : post(route('shifts.planning.store'));

        action.onSuccess = () => { setIsModalOpen(false); reset(); };
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
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Planificador de Turnos</h2>}>
            <Head title="Planificación" />

            <div className="py-6 px-4 max-w-[1600px] mx-auto">
                {/* Cabecera de Navegación */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigateWeek('prev')} className="p-2 hover:bg-gray-100 rounded-xl transition"><ChevronLeft size={20} /></button>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold flex items-center gap-2">
                            <CalendarIcon size={18} />
                            Semana: {weekConfig.start} / {weekConfig.end}
                        </div>
                        <button onClick={() => navigateWeek('next')} className="p-2 hover:bg-gray-100 rounded-xl transition"><ChevronRight size={20} /></button>
                    </div>
                </div>

                {/* Tabla de Planificación */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200">
                                    <th className="sticky left-0 z-20 bg-gray-50 p-5 border-r text-left text-xs font-black text-gray-400 uppercase tracking-widest min-w-[260px]">Colaborador</th>
                                    {weekConfig.days.map(day => (
                                        <th key={day.full_date} className="p-4 text-center min-w-[160px] border-r border-gray-100">
                                            <div className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{day.label.split(' ')[0]}</div>
                                            <div className="text-lg font-bold text-gray-700">{day.label.split(' ')[1]}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="sticky left-0 z-10 bg-white p-5 border-r shadow-sm font-bold text-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">{emp?.user?.name?.charAt(0) || 'E'}</div>
                                                {emp?.user?.name || 'Sin Nombre'}
                                            </div>
                                            <div className="ml-auto text-xs font-black text-gray-500">{emp?.area?.name || 'Sin Área'}</div>
                                        </td>

                                        {weekConfig.days.map(day => {
                                            const dayShifts = (emp.shifts || []).filter(s => s.scheduled_in.startsWith(day.full_date));
                                            const editableDay = !isDayPast(day.full_date);

                                            return (
                                                <td key={day.full_date} className="p-3 border-r border-gray-50 align-top min-h-[140px]">
                                                    <div className="flex flex-col gap-2">
                                                        {dayShifts.map(shift => {
                                                            const editable = canEditShift(shift.scheduled_in);
                                                            return (
                                                                <div key={shift.id} className={`group relative p-3 rounded-xl border transition-all ${!editable ? 'bg-gray-50 border-gray-100 opacity-80' : 'bg-white border-indigo-100 shadow-sm hover:border-indigo-300'}`}>
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${!editable ? 'text-gray-400' : 'text-indigo-500'}`}>
                                                                            {shift.status} {!editable && <Lock size={8} className="inline ml-1" />}
                                                                        </span>
                                                                        {editable && (
                                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button onClick={() => openEditModal(shift)} className="text-gray-400 hover:text-indigo-600"><Edit2 size={12} /></button>
                                                                                <button onClick={() => handleDelete(shift.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className={`font-mono font-bold text-xs ${!editable ? 'text-gray-400' : 'text-gray-700'}`}>
                                                                        {formatTime(shift.scheduled_in)} - {formatTime(shift.scheduled_out)}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        {editableDay ? (
                                                            <button
                                                                onClick={() => openCreateModal(emp.id, day.full_date)}
                                                                className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-300 hover:border-indigo-200 hover:text-indigo-400 hover:bg-indigo-50/50 transition-all"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        ) : (
                                                            <div className="py-2 text-center text-[9px] font-black text-gray-300 uppercase italic">Cerrado</div>
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

            {/* Modal de Formulario */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="p-8">
                    <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <Clock className="text-indigo-600" size={24} /> {editingShift ? 'Editar Horario' : 'Nuevo Turno'}
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Entrada</label>
                            <input type="time" value={data.in_time} onChange={e => setData('in_time', e.target.value)} className="w-full rounded-2xl border-gray-200 border-2 focus:border-indigo-500 focus:ring-0 font-bold text-gray-700" />
                            {errors.in_time && <p className="text-red-500 text-xs mt-1">{errors.in_time}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Salida</label>
                            <input type="time" value={data.out_time} onChange={e => setData('out_time', e.target.value)} className="w-full rounded-2xl border-gray-200 border-2 focus:border-indigo-500 focus:ring-0 font-bold text-gray-700" />
                            {errors.out_time && <p className="text-red-500 text-xs mt-1">{errors.out_time}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancelar</button>
                        <button type="submit" disabled={processing} className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50">
                            {editingShift ? 'Guardar Cambios' : 'Confirmar Turno'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}