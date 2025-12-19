import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ResearchJob {
    id: string;
    status: string;
    progress: number;
    websiteAnalysis: string;
    socialMediaHunt: string;
    ownerInvestigation: string;
    competitorMapping: string;
    newsAggregation: string;
    businessAnalysis: string;
    createdAt: string;
    company: {
        companyName: string;
    };
}

export default function ResearchPage() {
    const { token } = useAuth();
    const [queue, setQueue] = useState<ResearchJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await fetch('/api/research/queue/status', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setQueue(data.queue);
                }
            } catch (error) {
                console.error('Failed to fetch queue:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [token]);

    const agentStatus = (status: string) => {
        const icons: Record<string, string> = {
            PENDING: '⏳',
            RUNNING: '🔄',
            COMPLETED: '✅',
            FAILED: '❌',
            SKIPPED: '⏭️',
        };
        return icons[status] || '❓';
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Research Queue</h1>
                <p className="text-slate-600 mt-1">
                    Monitor your active research jobs
                </p>
            </div>

            {isLoading ? (
                <div className="card text-center py-8 text-slate-500">Loading...</div>
            ) : queue.length === 0 ? (
                <div className="card text-center py-8">
                    <p className="text-slate-500 mb-4">No active research jobs</p>
                    <p className="text-sm text-slate-400">
                        Select companies from the Companies page to start researching
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {queue.map((job) => (
                        <div key={job.id} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-medium text-slate-900">
                                        {job.company.companyName}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Status: {job.status} • Progress: {job.progress}%
                                    </p>
                                </div>
                                <div className="text-2xl">
                                    {job.status === 'RUNNING' ? '🔄' : job.status === 'COMPLETED' ? '✅' : '⏳'}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-500"
                                    style={{ width: `${job.progress}%` }}
                                />
                            </div>

                            {/* Agent statuses */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    {agentStatus(job.websiteAnalysis)} Website Analysis
                                </div>
                                <div className="flex items-center gap-2">
                                    {agentStatus(job.socialMediaHunt)} Social Media
                                </div>
                                <div className="flex items-center gap-2">
                                    {agentStatus(job.ownerInvestigation)} Owner Research
                                </div>
                                <div className="flex items-center gap-2">
                                    {agentStatus(job.competitorMapping)} Competitors
                                </div>
                                <div className="flex items-center gap-2">
                                    {agentStatus(job.newsAggregation)} News & Reviews
                                </div>
                                <div className="flex items-center gap-2">
                                    {agentStatus(job.businessAnalysis)} Opportunities
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
