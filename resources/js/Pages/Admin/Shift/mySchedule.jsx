import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MySchedule({ auth, employee, weekConfig }) {
    
    const navigateWeek = (direction) => {
        const date = new Date(weekConfig.start);
        date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
        router.get(route('my.schedule'), { date: date.toISOString().split('T')[0] });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Mi Horario de Trabajo</h2>}>
            <Head title="Mi Horario" />

            <div className="py-8 px-4 max-w-5xl mx-auto">
                {/* Selector de Semana */}
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm">
                    <button onClick={() => navigateWeek('prev')} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft /></button>
                    <div className="text-center">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Semana Actual</p>
                        <p className="text-lg font-bold text-indigo-600">{weekConfig.start} — {weekConfig.end}</p>
                    </div>
                    <button onClick={() => navigateWeek('next')} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronRight /></button>
                </div>

                {/* Grid Semanal */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {weekConfig.days.map((day) => {
                        const dayShifts = employee.shifts.filter(s => s.scheduled_in.startsWith(day.full_date));
                        
                        return (
                            <div key={day.full_date} className={`flex flex-col min-h-[200px] rounded-3xl border-2 transition-all ${day.is_today ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-100 bg-white'}`}>
                                {/* Header del Día */}
                                <div className={`p-4 text-center border-b-2 ${day.is_today ? 'border-indigo-100' : 'border-gray-50'}`}>
                                    <p className={`text-[10px] font-black uppercase ${day.is_today ? 'text-indigo-600' : 'text-gray-400'}`}>{day.label.split(' ')[0]}</p>
                                    <p className={`text-xl font-black ${day.is_today ? 'text-indigo-700' : 'text-gray-700'}`}>{day.label.split(' ')[1]}</p>
                                </div>

                                {/* Turnos del Día */}
                                <div className="p-3 flex flex-col gap-3">
                                    {dayShifts.length > 0 ? dayShifts.map(shift => (
                                        <div key={shift.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-1 mb-1">
                                                {shift.status === 'completed' ? <CheckCircle2 size={10} className="text-green-500"/> : <Clock size={10} className="text-amber-500"/>}
                                                <span className="text-[8px] font-black uppercase text-gray-400">{shift.status}</span>
                                            </div>
                                            <div className="text-xs font-black text-gray-800">
                                                {formatTime(shift.scheduled_in)} - {formatTime(shift.scheduled_out)}
                                            </div>
                                            {shift.delay_minutes > 0 && (
                                                <div className="mt-2 text-[9px] font-bold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={10}/> +{shift.delay_minutes} min atraso
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="mt-4 text-center opacity-20">
                                            <Calendar size={24} className="mx-auto mb-1"/>
                                            <span className="text-[9px] font-bold uppercase">Libre</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Resumen de la Semana */}
                <div className="mt-8 bg-gray-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-around items-center shadow-2xl">
                    <div className="text-center mb-4 md:mb-0">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Horas</p>
                        <p className="text-3xl font-black italic">-- hrs</p>
                    </div>
                    <div className="h-12 w-[1px] bg-gray-800 hidden md:block"></div>
                    <div className="text-center">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Puntualidad</p>
                        <p className="text-3xl font-black text-green-400 italic">100%</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}