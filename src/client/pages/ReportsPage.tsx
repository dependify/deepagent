import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Report {
    id: string;
    title: string;
    digitalMaturityScore: number | null;
    socialPresenceScore: number | null;
    reputationScore: number | null;
    opportunityScore: number | null;
    generatedAt: string;
    company: {
        id: string;
        companyName: string;
        category: string | null;
    };
}

export default function ReportsPage() {
    const { token } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/reports', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setReports(data.reports);
                }
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, [token]);

    const scoreColor = (score: number | null) => {
        if (score === null) return 'text-slate-400';
        if (score >= 70) return 'text-success-600';
        if (score >= 40) return 'text-warning-600';
        return 'text-danger-600';
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Intelligence Reports</h1>
                <p className="text-slate-600 mt-1">
                    View and download generated company reports
                </p>
            </div>

            {isLoading ? (
                <div className="card text-center py-8 text-slate-500">Loading...</div>
            ) : reports.length === 0 ? (
                <div className="card text-center py-8">
                    <p className="text-slate-500 mb-4">No reports generated yet</p>
                    <p className="text-sm text-slate-400">
                        Complete company research to generate intelligence reports
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <div key={report.id} className="card-hover">
                            <h3 className="font-medium text-slate-900 mb-1">
                                {report.company.companyName}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                {report.company.category || 'Uncategorized'}
                            </p>

                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                <div>
                                    <p className="text-slate-500">Digital</p>
                                    <p className={`font-semibold ${scoreColor(report.digitalMaturityScore)}`}>
                                        {report.digitalMaturityScore ?? '-'}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Social</p>
                                    <p className={`font-semibold ${scoreColor(report.socialPresenceScore)}`}>
                                        {report.socialPresenceScore ?? '-'}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Reputation</p>
                                    <p className={`font-semibold ${scoreColor(report.reputationScore)}`}>
                                        {report.reputationScore ?? '-'}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Opportunity</p>
                                    <p className={`font-semibold ${scoreColor(report.opportunityScore)}`}>
                                        {report.opportunityScore ?? '-'}%
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <a
                                    href={`/api/reports/${report.id}/download/md`}
                                    className="btn-secondary text-sm flex-1 text-center"
                                >
                                    📄 Markdown
                                </a>
                                <a
                                    href={`/api/reports/${report.id}/download/pdf`}
                                    className="btn-primary text-sm flex-1 text-center"
                                >
                                    📕 PDF
                                </a>
                            </div>

                            <p className="text-xs text-slate-400 mt-3">
                                Generated {new Date(report.generatedAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
