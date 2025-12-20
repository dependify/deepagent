import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Stats {
    total: number;
    pending: number;
    researching: number;
    completed: number;
    failed: number;
}

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/companies/stats/summary', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const statCards = [
        { label: 'Total Companies', value: stats?.total || 0, icon: '🏢', color: 'primary' },
        { label: 'Pending', value: stats?.pending || 0, icon: '⏳', color: 'warning' },
        { label: 'Researching', value: stats?.researching || 0, icon: '🔍', color: 'info' },
        { label: 'Completed', value: stats?.completed || 0, icon: '✅', color: 'success' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back, {user?.name || 'there'}!
                </h1>
                <p className="text-slate-600 mt-1">Here's an overview of your company research</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.label} className="card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {isLoading ? '-' : stat.value}
                                </p>
                            </div>
                            <span className="text-3xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/upload" className="btn-primary">
                        📤 Upload CSV
                    </Link>
                    <Link to="/companies" className="btn-secondary">
                        🏢 View Companies
                    </Link>
                    <Link to="/research" className="btn-secondary">
                        🔍 Research Queue
                    </Link>
                    <Link to="/reports" className="btn-secondary">
                        📄 View Reports
                    </Link>
                </div>
            </div>

            {/* Getting Started */}
            {stats?.total === 0 && !isLoading && (
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                    <h2 className="text-lg font-semibold text-primary-900 mb-2">Getting Started</h2>
                    <p className="text-primary-700 mb-4">
                        Welcome to DCIP! Start by uploading a CSV file with your Google Maps scraped
                        data.
                    </p>
                    <Link to="/upload" className="btn-primary inline-flex">
                        Upload your first CSV
                    </Link>
                </div>
            )}
        </div>
    );
}
