import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { UserPlus, Shield, MapPin, Edit, X, Trash2, ChevronRight, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Index({ auth, users, holdings, errors }) {
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, put, processing, reset } = useForm({
        name: '', email: '', password: '', role: 'employee',
        rut: '', phone: '', holding_id: '', company_id: '', branch_id: '', area_id: ''
    });

    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);

    // 1. Cargar Empresas cuando cambia Holding
    useEffect(() => {
        const holding = holdings.find(h => h.id == data.holding_id);
        const availableCompanies = holding ? holding.companies : [];
        setCompanies(availableCompanies);
        
        // Si el ID de compañía actual no está en el nuevo holding, limpiar hacia abajo
        if (!availableCompanies.find(c => c.id == data.company_id)) {
            if (!editingUser) {
                setData(prev => ({ ...prev, company_id: '', branch_id: '', area_id: '' }));
            }
        }
    }, [data.holding_id, holdings]);

    // 2. Cargar Sucursales cuando cambia Empresa
    useEffect(() => {
        const company = companies.find(c => c.id == data.company_id);
        const availableBranches = company ? company.branches : [];
        setBranches(availableBranches);

        if (!availableBranches.find(b => b.id == data.branch_id)) {
            if (!editingUser) {
                setData(prev => ({ ...prev, branch_id: '', area_id: '' }));
            }
        }
    }, [data.company_id, companies]);

    // 3. Cargar Áreas cuando cambia Sucursal
    useEffect(() => {
        const branch = branches.find(b => b.id == data.branch_id);
        const availableAreas = branch ? branch.areas : [];
        setAreas(availableAreas);

        if (!availableAreas.find(a => a.id == data.area_id)) {
            if (!editingUser) {
                setData(prev => ({ ...prev, area_id: '' }));
            }
        }
    }, [data.branch_id, branches]);

    const startEdit = (user) => {
        setEditingUser(user);
        const emp = user.employee;
        
        // Seteamos todos los IDs de una vez. 
        // Los useEffect se encargarán de llenar las listas companies/branches/areas en milisegundos.
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            rut: emp?.rut || '',
            phone: emp?.phone || '',
            holding_id: emp?.branch?.company?.holding_id || '',
            company_id: emp?.branch?.company_id || '',
            branch_id: emp?.branch_id || '',
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
            put(route('users.update', editingUser.id), { onSuccess: () => cancelEdit() });
        } else {
            post(route('users.store'), { onSuccess: () => reset() });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Gestión de Usuarios</h2>}>
            <Head title="Usuarios" />
            <div className="py-12 max-w-7xl mx-auto px-4 space-y-6">
                
                {/* Formulario */}
                <form onSubmit={submit} className={`p-6 rounded-2xl border shadow-sm transition-all ${editingUser ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-bold mb-6 flex items-center text-gray-700">
                        {editingUser ? <Edit className="mr-2 text-amber-600 w-5 h-5" /> : <UserPlus className="mr-2 text-indigo-600 w-5 h-5" />}
                        {editingUser ? `Modificando: ${editingUser.name}` : 'Registrar Nuevo Usuario'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-gray-400">Nombre</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl border-gray-200" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full rounded-xl border-gray-200" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400">Rol</label>
                            <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full rounded-xl border-gray-200">
                                <option value="employee">Empleado</option>
                                <option value="manager">Jefe de Área</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input type="text" placeholder="RUT (12345678-9)" value={data.rut} onChange={e => setData('rut', e.target.value)} className="rounded-xl border-gray-200" />
                        <input type="text" placeholder="Teléfono" value={data.phone} onChange={e => setData('phone', e.target.value)} className="rounded-xl border-gray-200" />
                        <input type="password" placeholder={editingUser ? "Nueva clave (opcional)" : "Contraseña"} value={data.password} onChange={e => setData('password', e.target.value)} className="rounded-xl border-gray-200" />
                    </div>

                    {data.role !== 'admin' && (
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-4 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Ubicación en la Estructura</p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <select value={data.holding_id} onChange={e => setData('holding_id', e.target.value)} className="text-sm rounded-xl border-gray-200">
                                    <option value="">Holding...</option>
                                    {holdings.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                                <select value={data.company_id} onChange={e => setData('company_id', e.target.value)} disabled={!companies.length} className="text-sm rounded-xl border-gray-200">
                                    <option value="">Empresa...</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)} disabled={!branches.length} className="text-sm rounded-xl border-gray-200">
                                    <option value="">Sucursal...</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <select value={data.area_id} onChange={e => setData('area_id', e.target.value)} disabled={!areas.length} className="text-sm rounded-xl border-gray-200">
                                    <option value="">Área...</option>
                                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        {editingUser && (
                            <button type="button" onClick={cancelEdit} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">Cancelar</button>
                        )}
                        <button disabled={processing} className="bg-black text-white px-10 py-3 rounded-xl font-bold hover:opacity-80 transition">
                            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>

                {/* Tabla */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 text-left">Ficha Empleado</th>
                                <th className="px-6 py-4 text-left">Sucursal / Área</th>
                                <th className="px-6 py-4 text-left">Rol</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><UserIcon size={20}/></div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.name}</div>
                                                <div className="text-[10px] font-mono text-gray-400">{user.employee?.rut || 'S/R'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.employee ? (
                                            <div className="text-xs">
                                                <div className="font-bold text-gray-700">{user.employee.branch?.name}</div>
                                                <div className="text-gray-400 flex items-center italic"><ChevronRight size={10}/> {user.employee.area?.name}</div>
                                            </div>
                                        ) : <span className="text-[10px] text-gray-300">N/A (Admin)</span>}
                                    </td>
                                    <td className="px-6 py-4 italic text-xs font-bold capitalize">{user.role}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => startEdit(user)} className="text-gray-400 hover:text-indigo-600 transition"><Edit size={18}/></button>
                                        {user.id !== auth.user.id && (
                                            <button onClick={() => router.delete(route('users.destroy', user.id))} className="text-gray-400 hover:text-red-600 transition"><Trash2 size={18}/></button>
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