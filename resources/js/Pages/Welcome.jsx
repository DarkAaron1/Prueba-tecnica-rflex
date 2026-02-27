import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    const features = [
        { emoji: '👥', title: 'Gestión de Usuarios', description: 'Control de usuarios y perfiles con roles configurables' },
        { emoji: '🏢', title: 'Estructura Empresarial', description: 'Administra Holding, Empresa, Sucursal y Áreas' },
        { emoji: '📱', title: 'Gestión de Dispositivos', description: 'Registro y administración de dispositivos de marcaje' },
        { emoji: '📅', title: 'Planificación de Turnos', description: 'Creación y gestión de horarios de trabajo' },
        { emoji: '📝', title: 'Control de Asistencia', description: 'Registro automático con procesamiento en background' },
        { emoji: '📊', title: 'Reportes', description: 'Generación de reportes con exportación a Excel' },
        { emoji: '🔒', title: 'Autenticación Segura', description: 'Sistema seguro con verificación de email' },
        { emoji: '⚡', title: 'Dashboard Inteligente', description: 'Panel de control con métricas de asistencia en tiempo real' },
    ];

    const testUsers = [
        { role: 'Administrador', email: 'admin@test.com', password: 'password' },
        { role: 'Jefe de Desarrollo', email: 'jefe@test.com', password: 'password' },
        { role: 'Empleado (Juan Pérez)', email: 'juan@test.com', password: 'password' },
    ];

    return (
        <>
            <Head title="Prueba Técnica - Sistema de Gestión de Asistencia" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-indigo-600">Prueba Técnica Felipe Burgos</h1>
                            <p className="text-sm text-gray-500">Sistema de Gestión de Asistencia y Planificación de Turnos para Ingeniero Full-Stack Semi-Senior</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/login" className="px-4 py-2 border rounded bg-white text-sm">Iniciar Sesión</Link>
                            <Link href="/register" className="px-4 py-2 rounded bg-indigo-600 text-white text-sm">Registrarse</Link>
                        </div>
                    </div>
                </header>

                <main className="py-16">
                    <div className="max-w-4xl mx-auto text-center mb-12 px-4">
                        <div className="inline-block bg-white/20 px-3 py-1 rounded-lg text-indigo-700 font-semibold mb-4">🧪 Ambiente de Pruebas</div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mt-4">Sistema de Control de Asistencia</h2>
                        <p className="text-gray-600 mt-3">Plataforma integral construida con Laravel e Inertia para gestionar asistencia, planificación de turnos y reportes de forma simple y eficiente.</p>
                        <div className="mt-6 flex justify-center gap-3">
                            <Link href="/login" className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold">Acceder a la Aplicación</Link>
                            <a href="#credentials" className="px-5 py-3 bg-white border rounded-lg">Ver Credenciales</a>
                        </div>
                    </div>

                    <section id="credentials" className="max-w-4xl mx-auto px-4 mb-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Usuarios de Prueba</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {testUsers.map((user) => (
                                <div key={user.email} className="bg-white p-4 rounded border border-yellow-300">
                                    <p className="font-semibold text-gray-900">{user.role}</p>
                                    <p className="text-sm text-gray-600 mt-2"><strong>Email:</strong> {user.email}</p>
                                    <p className="text-sm text-gray-600"><strong>Contraseña:</strong> {user.password}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="max-w-7xl mx-auto px-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Características Principales</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {features.map((f) => (
                                <div key={f.title} className="bg-white rounded-lg p-5 shadow hover:shadow-md transition">
                                    <div className="text-3xl mb-3">{f.emoji}</div>
                                    <div className="font-semibold text-gray-900">{f.title}</div>
                                    <p className="text-sm text-gray-500 mt-1">{f.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="max-w-4xl mx-auto mt-16 px-4">
                        <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">Tecnología Moderna</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            {['Laravel 10','React + Inertia.js','MySQL','API RESTful'].map(t => (
                                <div key={t} className="bg-white p-4 rounded shadow">{t}</div>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="bg-gray-900 text-white py-10 mt-12">
                    <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-300">© 2026 Prueba Técnica de Felipe Burgos. Todos los derechos reservados.</div>
                </footer>
            </div>
        </>
    );
}