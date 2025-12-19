import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface Stats {
    users: { total: number; pending: number; approved: number };
    companies: number;
    research: { total: number; completed: number; running: number };
    reports: number;
}

interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'USER';
    accountStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    createdAt: string;
    _count: { companies: number; researchJobs: number; reports: number };
}

interface Prompt {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    prompt: string;
    category: string;
    isActive: boolean;
}

export default function AdminPage() {
    const { token, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'prompts'>('dashboard');
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');

    // Redirect non-admins
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            if (activeTab === 'dashboard') {
                const [statsRes, pendingRes] = await Promise.all([
                    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/users/pending', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                if (statsRes.ok) setStats(await statsRes.json());
                if (pendingRes.ok) {
                    const data = await pendingRes.json();
                    setPendingUsers(data.users);
                }
            } else if (activeTab === 'users') {
                const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users);
                }
            } else if (activeTab === 'prompts') {
                const res = await fetch('/api/admin/prompts', { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    setPrompts(data.prompts);
                }
            }
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId: string, action: 'approve' | 'reject' | 'suspend') => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/${action}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setActionMessage(`User ${action}d successfully`);
                loadData();
                setTimeout(() => setActionMessage(''), 3000);
            }
        } catch {
            setError('Action failed');
        }
    };

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'users', label: '👥 Users' },
        { id: 'prompts', label: '✏️ Prompts' },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600">Manage users, prompts, and system settings</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === tab.id
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {actionMessage && (
                <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-lg">{actionMessage}</div>
            )}
            {error && <div className="mb-4 p-3 bg-danger-50 text-danger-600 rounded-lg">{error}</div>}

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <>
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && stats && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="card">
                                    <div className="text-3xl font-bold text-primary-600">{stats.users.total}</div>
                                    <div className="text-slate-600">Total Users</div>
                                </div>
                                <div className="card">
                                    <div className="text-3xl font-bold text-warning-600">{stats.users.pending}</div>
                                    <div className="text-slate-600">Pending Approval</div>
                                </div>
                                <div className="card">
                                    <div className="text-3xl font-bold text-primary-600">{stats.companies}</div>
                                    <div className="text-slate-600">Companies</div>
                                </div>
                                <div className="card">
                                    <div className="text-3xl font-bold text-primary-600">{stats.reports}</div>
                                    <div className="text-slate-600">Reports</div>
                                </div>
                            </div>

                            {/* Pending Approvals */}
                            {pendingUsers.length > 0 && (
                                <div className="card">
                                    <h3 className="font-semibold text-lg mb-4">⏳ Pending Approvals</h3>
                                    <div className="space-y-3">
                                        {pendingUsers.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <div className="font-medium">{user.name || user.email}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'approve')}
                                                        className="px-3 py-1 bg-success-500 text-white rounded hover:bg-success-600"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'reject')}
                                                        className="px-3 py-1 bg-danger-500 text-white rounded hover:bg-danger-600"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="card overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left p-3">User</th>
                                        <th className="text-left p-3">Role</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-left p-3">Companies</th>
                                        <th className="text-left p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-t">
                                            <td className="p-3">
                                                <div className="font-medium">{user.name || 'No name'}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : ''}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`badge ${user.accountStatus === 'APPROVED' ? 'badge-success' :
                                                        user.accountStatus === 'PENDING' ? 'badge-warning' :
                                                            'badge-danger'
                                                    }`}>
                                                    {user.accountStatus}
                                                </span>
                                            </td>
                                            <td className="p-3">{user._count.companies}</td>
                                            <td className="p-3">
                                                {user.accountStatus === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'approve')}
                                                        className="text-success-600 hover:text-success-700 mr-2"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {user.accountStatus === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'suspend')}
                                                        className="text-danger-600 hover:text-danger-700"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Prompts Tab */}
                    {activeTab === 'prompts' && (
                        <div className="space-y-4">
                            {prompts.map((prompt) => (
                                <div key={prompt.id} className="card">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">{prompt.displayName}</h3>
                                            <span className="text-sm text-slate-500">{prompt.category}</span>
                                        </div>
                                        <span className={`badge ${prompt.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                            {prompt.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {prompt.description && (
                                        <p className="text-sm text-slate-600 mb-2">{prompt.description}</p>
                                    )}
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-primary-600 hover:text-primary-700">
                                            View Prompt
                                        </summary>
                                        <pre className="mt-2 p-3 bg-slate-50 rounded text-sm whitespace-pre-wrap">
                                            {prompt.prompt}
                                        </pre>
                                    </details>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
