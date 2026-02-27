import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Cpu, Server, Monitor, Plus, Trash2, Edit2, Wifi, WifiOff } from 'lucide-react';

export default function DeviceIndex({ auth, devices, areas }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);

    const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
        name: '',
        serial_number: '',
        type: 'biometric',
        area_id: ''
    });

    const openCreateModal = () => {
        setEditingDevice(null);
        reset();
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingDevice) {
            put(route('devices.update', editingDevice.id), {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post(route('devices.store'), {
                onSuccess: () => { setIsModalOpen(false); reset(); }
            });
        }
    };

    // Helper para iconos según tipo de migración
    const getDeviceIcon = (type) => {
        switch(type) {
            case 'biometric': return <Cpu className="text-indigo-600" />;
            case 'gateway': return <Server className="text-amber-600" />;
            case 'virtual': return <Monitor className="text-emerald-600" />;
            default: return <Cpu />;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Infraestructura de Marcaje</h2>}>
            <Head title="Dispositivos" />

            <div className="py-12 px-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Dispositivos</h1>
                        <p className="text-gray-500">Gestión de puntos de captura según migración activa</p>
                    </div>
                    <button onClick={openCreateModal} className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10">
                        <Plus size={20} /> Nuevo Dispositivo
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <div key={device.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-4 rounded-2xl bg-gray-50`}>
                                    {getDeviceIcon(device.type)}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800">{device.name}</h3>
                                <p className="text-xs font-mono text-gray-400">SN: {device.serial_number}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50 mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Ubicación</p>
                                    <p className="text-sm font-bold text-gray-700">{device.area_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Último Pulso</p>
                                    <p className="text-sm font-bold text-gray-700">{device.last_sync}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => { setEditingDevice(device); setData(device); setIsModalOpen(true); }} className="flex-1 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition">Editar</button>
                                <button onClick={() => confirm('¿Eliminar?') && destroy(route('devices.destroy', device.id))} className="p-3 text-red-400 hover:text-red-600 transition"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Registro/Edición */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl">
                        <h2 className="text-3xl font-black text-gray-800 mb-2">{editingDevice ? 'Editar' : 'Registrar'}</h2>
                        <p className="text-gray-500 mb-8 italic">Configuración técnica de hardware</p>
                        
                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nombre del Dispositivo</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black" placeholder="Ej: Reloj Acceso Principal" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">S/N (Único)</label>
                                    <input type="text" value={data.serial_number} disabled={!!editingDevice} onChange={e => setData('serial_number', e.target.value)} className={`w-full bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black font-mono ${editingDevice && 'opacity-50'}`} placeholder="XYZ-123" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Tipo de Hardware</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black">
                                        <option value="biometric">Biométrico</option>
                                        <option value="gateway">Puerta / Enlace</option>
                                        <option value="virtual">Virtual (App/Web)</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Asignar a Área</label>
                                    <select value={data.area_id} onChange={e => setData('area_id', e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black" required>
                                        <option value="">Seleccione un área...</option>
                                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-gray-400 font-bold hover:text-gray-600 transition">Cancelar</button>
                                <button type="submit" disabled={processing} className="flex-[2] bg-black text-white py-4 rounded-2xl font-black shadow-xl shadow-black/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50">
                                    {editingDevice ? 'Guardar Cambios' : 'Vincular Dispositivo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}