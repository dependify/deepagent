import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface UploadResult {
    success: boolean;
    stats: {
        totalRows: number;
        validRows: number;
        duplicatesRemoved: number;
        alreadyExists: number;
        companiesCreated: number;
        errors: number;
    };
    errors: Array<{ row: number; error: string }>;
}

export default function UploadPage() {
    const { token } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState('');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files?.[0]) {
            if (files[0].name.endsWith('.csv')) {
                setFile(files[0]);
                setError('');
                setResult(null);
            } else {
                setError('Please upload a CSV file');
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files?.[0]) {
            setFile(files[0]);
            setError('');
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload/csv', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setResult(data);
            setFile(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Upload Companies</h1>
                <p className="text-slate-600 mt-1">
                    Upload a CSV file with your Google Maps scraped data
                </p>
            </div>

            {/* Template Download */}
            <div className="card mb-6 bg-primary-50 border-primary-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-primary-900">Need a template?</h3>
                        <p className="text-sm text-primary-700">
                            Download our CSV template to ensure correct formatting
                        </p>
                    </div>
                    <a href="/api/upload/template" className="btn-primary text-sm" download>
                        Download Template
                    </a>
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`card border-2 border-dashed transition-colors ${
                    isDragging
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-300 hover:border-primary-400'
                }`}
            >
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">📄</div>
                    {file ? (
                        <div>
                            <p className="font-medium text-slate-900">{file.name}</p>
                            <p className="text-sm text-slate-500">
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                                onClick={() => setFile(null)}
                                className="mt-2 text-sm text-danger-600 hover:text-danger-700"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-slate-600 mb-2">
                                Drag and drop your CSV file here, or
                            </p>
                            <label className="btn-secondary cursor-pointer inline-block">
                                Browse Files
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Upload Button */}
            {file && (
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="mt-4 w-full btn-primary"
                >
                    {isUploading ? 'Uploading...' : 'Upload CSV'}
                </button>
            )}

            {/* Result */}
            {result && (
                <div className="mt-6 card bg-success-50 border-success-200">
                    <h3 className="font-medium text-success-900 mb-3">Upload Complete!</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-success-700">Total Rows</p>
                            <p className="font-semibold text-success-900">
                                {result.stats.totalRows}
                            </p>
                        </div>
                        <div>
                            <p className="text-success-700">Valid Rows</p>
                            <p className="font-semibold text-success-900">
                                {result.stats.validRows}
                            </p>
                        </div>
                        <div>
                            <p className="text-success-700">Duplicates Removed</p>
                            <p className="font-semibold text-success-900">
                                {result.stats.duplicatesRemoved}
                            </p>
                        </div>
                        <div>
                            <p className="text-success-700">Companies Created</p>
                            <p className="font-semibold text-success-900">
                                {result.stats.companiesCreated}
                            </p>
                        </div>
                    </div>
                    {result.stats.alreadyExists > 0 && (
                        <p className="mt-3 text-sm text-success-700">
                            {result.stats.alreadyExists} companies already existed and were skipped
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
