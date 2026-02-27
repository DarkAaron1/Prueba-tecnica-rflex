import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Factory, Building2, Hash, X } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, companies, holdings, errors }) {
    const [editingCompany, setEditingCompany] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
        name: '',
        rut: '',
        holding_id: '',
    });

    const startEdit = (company) => {
        setEditingCompany(company);
        setData({
            name: company.name,
            rut: company.rut,
            holding_id: company.holding_id,
        });
    };

    const cancelEdit = () => {
        setEditingCompany(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingCompany) {
            put(route('companies.update', editingCompany.id), { onSuccess: () => cancelEdit() });
        } else {
            post(route('companies.store'), { onSuccess: () => reset() });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta compañía? Se perderá la vinculación con sus sucursales y áreas.')) {
            destroy(route('companies.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Gestión de Compañías</h2>}>
            <Head title="Compañías" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Formulario de Creación/Edición */}
                <div className={`p-6 rounded-xl shadow-sm border transition-all ${editingCompany ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-bold mb-4 flex items-center text-gray-700">
                        {editingCompany ? <Edit className="mr-2 text-indigo-500" /> : <Plus className="mr-2 text-blue-600" />}
                        {editingCompany ? `Editando Empresa: ${editingCompany.name}` : 'Registrar Nueva Empresa'}
                    </h3>
                    
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Razón Social</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500" placeholder="Ej: Tech Solutions SpA" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">RUT Empresa</label>
                            <input type="text" value={data.rut} onChange={e => setData('rut', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500" placeholder="77.666.555-4" />
                            {errors.rut && <p className="text-red-500 text-xs mt-1">{errors.rut}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Holding</label>
                            <select value={data.holding_id} onChange={e => setData('holding_id', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500">
                                <option value="">Seleccionar Holding...</option>
                                {holdings.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button disabled={processing} className={`flex-1 px-4 py-2 rounded-md font-bold text-white transition ${editingCompany ? 'bg-indigo-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {editingCompany ? 'Actualizar' : 'Guardar'}
                            </button>
                            {editingCompany && (
                                <button type="button" onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition">
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Compañía / RUT</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Holding Asociado</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                                <Factory className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{company.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center">
                                                    <Hash className="w-3 h-3 mr-1" /> {company.rut}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                            <Building2 className="w-3 h-3 mr-1 text-gray-400" />
                                            {company.holding?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => startEdit(company)} className="text-blue-600 hover:text-blue-900 transition">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(company.id)} className="text-red-600 hover:text-red-900 transition">
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