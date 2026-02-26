import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, MapPin, Building2, X, Factory } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, branches, companies, errors }) {
    const [editingBranch, setEditingBranch] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        address: '',
        company_id: '',
    });

    const startEdit = (branch) => {
        setEditingBranch(branch);
        setData({
            name: branch.name,
            address: branch.address || '',
            company_id: branch.company_id,
        });
    };

    const cancelEdit = () => {
        setEditingBranch(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingBranch) {
            put(route('branches.update', editingBranch.id), { onSuccess: () => cancelEdit() });
        } else {
            post(route('branches.store'), { onSuccess: () => reset() });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta sucursal? Se podrían afectar las áreas vinculadas.')) {
            destroy(route('branches.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Gestión de Sucursales</h2>}>
            <Head title="Sucursales" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Formulario Crear/Editar */}
                <div className={`p-6 rounded-xl shadow-sm border transition-colors ${editingBranch ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        {editingBranch ? <Edit className="mr-2 text-blue-500" /> : <Plus className="mr-2 text-indigo-500" />}
                        {editingBranch ? `Editando: ${editingBranch.name}` : 'Nueva Sucursal / Sede'}
                    </h3>
                    
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre Sede</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300" placeholder="Ej: Casa Matriz" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Compañía</label>
                            <select value={data.company_id} onChange={e => setData('company_id', e.target.value)} className="mt-1 w-full rounded-md border-gray-300">
                                <option value="">Seleccionar...</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Dirección (Opcional)</label>
                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="mt-1 w-full rounded-md border-gray-300" placeholder="Calle #123..." />
                        </div>
                        <div className="flex gap-2">
                            <button disabled={processing} className={`flex-1 px-4 py-2 rounded-md font-bold text-white ${editingBranch ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                                {editingBranch ? 'Actualizar' : 'Guardar'}
                            </button>
                            {editingBranch && (
                                <button type="button" onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded-md"><X size={20}/></button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Tabla de Sucursales */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Sucursal</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Dirección</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Compañía</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {branches.map((branch) => (
                                <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center font-bold text-gray-900">
                                            <MapPin className="w-4 h-4 mr-2 text-red-400" /> {branch.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{branch.address || 'Sin dirección'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-700">{branch.company?.name}</span>
                                            <span className="text-xs text-gray-400">{branch.company?.holding?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => startEdit(branch)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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