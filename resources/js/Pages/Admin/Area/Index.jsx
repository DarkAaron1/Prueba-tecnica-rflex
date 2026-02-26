import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Layers, MapPin, Building2 } from 'lucide-react';

export default function Index({ auth, areas, branches, errors }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        branch_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('areas.store'), { 
            onSuccess: () => reset(),
            preserveScroll: true 
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Áreas</h2>}
        >
            <Head title="Áreas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Formulario de Creación */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-700">
                            <Plus className="w-5 h-5 mr-2 text-indigo-600" /> Nueva Área Operativa
                        </h3>
                        
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Área</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ej: Desarrollo, RRHH, Bodega..."
                                    className={`w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sucursal / Branch</label>
                                <select 
                                    value={data.branch_id} 
                                    onChange={e => setData('branch_id', e.target.value)}
                                    className={`w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.branch_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Seleccione ubicación...</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.company?.name} - {b.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.branch_id && <p className="text-red-500 text-xs mt-1">{errors.branch_id}</p>}
                            </div>

                            <button 
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-md font-bold hover:bg-indigo-700 transition disabled:opacity-50 h-[42px]"
                            >
                                {processing ? 'Guardando...' : 'Registrar Área'}
                            </button>
                        </form>
                    </div>

                    {/* Tabla de Resultados */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Área</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación Jerárquica</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {areas.length > 0 ? areas.map((area) => (
                                    <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                                    <Layers className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <span className="font-bold text-gray-900">{area.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-700 flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1 text-gray-400" /> 
                                                    {area.branch?.name || 'Sin Sucursal'}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center mt-0.5">
                                                    <Building2 className="w-3 h-3 mr-1" />
                                                    {area.branch?.company?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-3">
                                                <button className="text-blue-600 hover:text-blue-900 p-1">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900 p-1">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-gray-400 italic">
                                            No hay áreas configuradas. Comience creando una arriba.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}