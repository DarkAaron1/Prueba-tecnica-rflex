import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Layers, MapPin, Building2, X, Save } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, areas, branches, errors }) {
    const [editingArea, setEditingArea] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        branch_id: '',
    });

    // Función para preparar la edición
    const startEdit = (area) => {
        setEditingArea(area);
        setData({
            name: area.name,
            branch_id: area.branch_id,
        });
    };

    // Cancelar edición
    const cancelEdit = () => {
        setEditingArea(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingArea) {
            put(route('areas.update', editingArea.id), {
                onSuccess: () => cancelEdit(),
            });
        } else {
            post(route('areas.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta área?')) {
            destroy(route('areas.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Gestión de Áreas</h2>}>
            <Head title="Áreas" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Formulario Dinámico (Crear/Editar) */}
                <div className={`p-6 rounded-xl shadow-sm border transition-colors ${editingArea ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        {editingArea ? <Edit className="mr-2 w-5 h-5 text-amber-500" /> : <Plus className="mr-2 w-5 h-5 text-indigo-500" />}
                        {editingArea ? `Editando Área: ${editingArea.name}` : 'Nueva Área Operativa'}
                    </h3>
                    
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Sucursal</label>
                            <select 
                                value={data.branch_id} 
                                onChange={e => setData('branch_id', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Seleccione...</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.company?.name} - {b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                disabled={processing}
                                className={`flex-1 px-4 py-2.5 rounded-md font-bold text-white transition ${editingArea ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {editingArea ? 'Actualizar' : 'Guardar'}
                            </button>
                            {editingArea && (
                                <button 
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabla con Acciones Reales */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Área</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {areas.map((area) => (
                                <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{area.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-700">{area.branch?.name}</span>
                                            <span className="text-xs">{area.branch?.company?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button 
                                            onClick={() => startEdit(area)}
                                            className="text-amber-600 hover:text-amber-900 transition"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(area.id)}
                                            className="text-red-600 hover:text-red-900 transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}