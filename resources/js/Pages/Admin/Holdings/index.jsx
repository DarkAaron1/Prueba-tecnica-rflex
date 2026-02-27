import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Building2, X, Save } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, holdings, errors }) {
    const [editingHolding, setEditingHolding] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
    });

    const startEdit = (holding) => {
        setEditingHolding(holding);
        setData({ name: holding.name });
    };

    const cancelEdit = () => {
        setEditingHolding(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingHolding) {
            put(route('holdings.update', editingHolding.id), { 
                onSuccess: () => cancelEdit() 
            });
        } else {
            post(route('holdings.store'), { 
                onSuccess: () => reset() 
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este Holding? Se perderá la jerarquía superior de sus empresas.')) {
            destroy(route('holdings.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Holdings</h2>}
        >
            <Head title="Holdings" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Formulario Crear/Editar */}
                <div className={`p-6 rounded-xl shadow-sm border transition-all ${editingHolding ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-700">
                        {editingHolding ? <Edit className="mr-2 text-purple-500" /> : <Plus className="mr-2 text-indigo-500" />}
                        {editingHolding ? `Editando Holding: ${editingHolding.name}` : 'Nuevo Holding / Grupo Económico'}
                    </h3>
                    
                    <form onSubmit={submit} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre del Grupo</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500" 
                                placeholder="Ej: Grupo Cencosud, Empresas Copec..." 
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                disabled={processing} 
                                className={`px-6 py-2 rounded-md font-bold text-white transition ${editingHolding ? 'bg-purple-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {editingHolding ? 'Actualizar' : 'Guardar'}
                            </button>
                            {editingHolding && (
                                <button type="button" onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                                    <X size={20} className="text-gray-600" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabla de Resultados */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre del Holding</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {holdings.map((holding) => (
                                <tr key={holding.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-400">#{holding.id}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        <div className="flex items-center">
                                            <Building2 className="w-5 h-5 mr-3 text-purple-400" />
                                            {holding.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => startEdit(holding)} className="text-purple-600 hover:text-purple-900">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(holding.id)} className="text-red-600 hover:text-red-900">
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