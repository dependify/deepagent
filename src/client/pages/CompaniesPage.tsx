import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Company {
    id: string;
    companyName: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    category: string | null;
    rating: number | null;
    reviewsCount: number | null;
    status: string;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function CompaniesPage() {
    const { token } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
            });
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/companies?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setCompanies(data.companies);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [token, currentPage, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCompanies();
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'badge bg-slate-100 text-slate-600',
            QUEUED: 'badge-info',
            RESEARCHING: 'badge-warning',
            COMPLETED: 'badge-success',
            FAILED: 'badge-danger',
        };
        return <span className={styles[status] || 'badge'}>{status}</span>;
    };

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
                    <p className="text-slate-600 mt-1">
                        {pagination?.total || 0} companies in your database
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input flex-1 min-w-[200px]"
                        placeholder="Search companies..."
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input w-40"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="QUEUED">Queued</option>
                        <option value="RESEARCHING">Researching</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                    </select>
                    <button type="submit" className="btn-primary">
                        Search
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="table-container bg-white">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : companies.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No companies found. Upload a CSV to get started.
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Rating</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company) => (
                                <tr key={company.id}>
                                    <td>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {company.companyName}
                                            </p>
                                            {company.website && (
                                                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                                    {company.website}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-slate-600">{company.category || '-'}</td>
                                    <td className="text-slate-600 max-w-[200px] truncate">
                                        {company.address || '-'}
                                    </td>
                                    <td>
                                        {company.rating ? (
                                            <span className="flex items-center gap-1">
                                                ⭐ {company.rating.toFixed(1)}
                                                {company.reviewsCount && (
                                                    <span className="text-slate-400 text-xs">
                                                        ({company.reviewsCount})
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>{statusBadge(company.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="btn-secondary text-sm"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                            }
                            disabled={currentPage === pagination.totalPages}
                            className="btn-secondary text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
