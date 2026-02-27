import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    UserPlus,
    Mail,
    Shield,
    Phone,
    Fingerprint,
    ChevronRight,
    User,
    Trash2,
    MapPin,
    Edit,
    X,
    RotateCcw
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Index({ auth, users, holdings, errors }) {
    const [editingUser, setEditingUser] = useState(null);

    // 1. Formulario de Inertia
    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        rut: '',
        phone: '',
        holding_id: '',
        company_id: '',
        branch_id: '',
        area_id: ''
    });

    // 2. Estados para selectores dinámicos
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);

    // 3. Efectos de Cascada (Filtros)
    useEffect(() => {
        const holding = holdings.find(h => h.id == data.holding_id);
        setCompanies(holding ? holding.companies : []);
        if (!editingUser) { // Solo resetear si es creación manual, no carga de edición
            setBranches([]); setAreas([]);
        }
    }, [data.holding_id]);

    useEffect(() => {
        const company = companies.find(c => c.id == data.company_id);
        setBranches(company ? company.branches : []);
        if (!editingUser) setAreas([]);
    }, [data.company_id]);

    useEffect(() => {
        const branch = branches.find(b => b.id == data.branch_id);
        setAreas(branch ? branch.areas : []);
    }, [data.branch_id]);

    // 4. Funciones de Acción
    const startEdit = (user) => {
        setEditingUser(user);
        const emp = user.employee;

        setData({
            name: user.name,
            email: user.email,
            password: '', // Password se deja vacío
            role: user.role,
            rut: emp?.rut || '',
            phone: emp?.phone || '',
            holding_id: emp?.area?.branch?.company?.holding_id || '',
            company_id: emp?.area?.branch?.company_id || '',
            branch_id: emp?.area?.branch_id || '',
            area_id: emp?.area_id || ''
        });
    };

    const cancelEdit = () => {
        setEditingUser(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => cancelEdit(),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            router.delete(route('users.destroy', id));
        }
    };

    const handleResetPassword = (user) => {
        if (confirm(`¿Reestablecer la contraseña de ${user.name} a su RUT?`)) {
            router.post(route('users.reset-password', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gestión de Usuarios</h2>}
        >
            <Head title="Usuarios" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* FORMULARIO DINÁMICO */}
                <form onSubmit={submit} className={`p-6 rounded-xl shadow-sm border transition-all duration-300 ${editingUser ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-bold mb-6 flex items-center text-gray-700">
                        {editingUser ? <Edit className="mr-2 text-amber-600 w-5 h-5" /> : <UserPlus className="mr-2 text-indigo-600 w-5 h-5" />}
                        {editingUser ? `Modificando: ${editingUser.name}` : 'Registrar Nuevo Usuario'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Contraseña {editingUser && '(Opcional)'}</label>
                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" placeholder={editingUser ? '••••••' : ''} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase italic">RUT</label>
                            <input type="text" value={data.rut} onChange={e => setData('rut', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" placeholder="12.345.678-9" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase italic">Teléfono</label>
                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase italic">Rol</label>

                            {/* Si es un admin (nuevo o editado), mostramos un texto fijo, si no, el selector */}
                            {data.role === 'admin' && editingUser ? (
                                <div className="mt-1 w-full bg-gray-100 border border-gray-200 text-gray-600 rounded-md px-3 py-2 text-sm font-bold flex items-center">
                                    <Shield className="w-4 h-4 mr-2 text-red-500" />
                                    Administrador (Protegido)
                                </div>
                            ) : (
                                <select
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
                                    disabled={editingUser && data.role === 'admin'} // Doble seguridad
                                >
                                    <option value="employee">Empleado</option>
                                    <option value="manager">Jefe de Área</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {data.role !== 'admin' && (
                        <div className={`p-5 rounded-xl mb-6 border transition-colors ${editingUser ? 'bg-white/50 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest flex items-center">
                                <MapPin className="w-3 h-3 mr-1" /> Ubicación Laboral
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <select value={data.holding_id} onChange={e => setData('holding_id', e.target.value)} className="text-sm rounded-md border-gray-300">
                                    <option value="">Holding...</option>
                                    {holdings.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                                <select value={data.company_id} onChange={e => setData('company_id', e.target.value)} disabled={!companies.length} className="text-sm rounded-md border-gray-300">
                                    <option value="">Compañía...</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)} disabled={!branches.length} className="text-sm rounded-md border-gray-300">
                                    <option value="">Sucursal...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <select value={data.area_id} onChange={e => setData('area_id', e.target.value)} disabled={!areas.length} className="text-sm rounded-md border-gray-300">
                                    <option value="">Área...</option>
                                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        {editingUser && (
                            <button type="button" onClick={cancelEdit} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition flex items-center">
                                <X size={18} className="mr-1" /> Cancelar
                            </button>
                        )}
                        <button disabled={processing} className={`${editingUser ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-10 py-2.5 rounded-lg font-bold transition shadow-lg shadow-indigo-100`}>
                            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>

                {/* TABLA DE USUARIOS */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Ficha</th>
                                <th className="px-6 py-4 text-left">Asignación</th>
                                <th className="px-6 py-4 text-left">Rol</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mr-3 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.name}</div>
                                                <div className="text-[11px] text-gray-400 font-mono uppercase">{user.employee?.rut}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.employee?.area ? (
                                            <div className="text-xs">
                                                <div className="font-semibold text-gray-700">{user.employee.area.branch?.company?.name}</div>
                                                <div className="text-gray-400 flex items-center mt-0.5">
                                                    <ChevronRight size={10} className="mr-1" /> {user.employee.area.name}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded italic">Sin Asignar (Admin)</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'text-red-600' :
                                            user.role === 'manager' ? 'text-amber-600' : 'text-blue-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleResetPassword(user)} title="Reset Password al RUT" className="text-gray-400 hover:text-orange-500 transition">
                                            <RotateCcw size={16} />
                                        </button>
                                        <button onClick={() => startEdit(user)} title="Editar" className="text-gray-400 hover:text-indigo-600 transition">
                                            <Edit size={16} />
                                        </button>
                                        {/* Evitar que un admin se borre a sí mismo basado en el role o ID */}
                                        {auth.user.role === 'admin' && user.id !== auth.user.id && (
                                            <button onClick={() => handleDelete(user.id)} title="Eliminar" className="text-gray-400 hover:text-red-600 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
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