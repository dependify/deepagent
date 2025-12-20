import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Companies', path: '/companies', icon: '🏢' },
    { name: 'Upload CSV', path: '/upload', icon: '📤' },
    { name: 'Research', path: '/research', icon: '🔍' },
    { name: 'Reports', path: '/reports', icon: '📄' },
];

export default function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                        DCIP
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            {item.name}
                        </NavLink>
                    ))}

                    {/* Admin Link */}
                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mt-4 border-t border-slate-100 pt-4 ${
                                    isActive
                                        ? 'bg-warning-50 text-warning-700'
                                        : 'text-warning-600 hover:bg-warning-50'
                                }`
                            }
                        >
                            <span>⚙️</span>
                            Admin Panel
                        </NavLink>
                    )}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                            {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {user?.name || user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full btn-ghost text-sm text-slate-500"
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
