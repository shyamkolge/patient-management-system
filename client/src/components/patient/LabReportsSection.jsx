import { useState, useEffect } from 'react';
import { Plus, X, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { LabReportCard } from './LabReportCard';
import { api } from '../../services/api';

export const LabReportsSection = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.getReports();
            setReports(response || []);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('description', description);

            const response = await api.uploadReport(formData);
            setReports([response, ...reports]);
            setIsUploadModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload report. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteReport(id);
            setReports(reports.filter(r => r._id !== id));
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete report.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setFile(null);
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Lab Reports & Documents</h2>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                    <Plus className="h-4 w-4" /> Upload New
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                        <FileText className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-slate-900">No reports uploaded</h3>
                    <p className="text-sm text-slate-500">Upload your blood tests, X-rays, or other medical documents.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {reports.map((report) => (
                        <LabReportCard key={report._id} report={report} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-900">Upload Report</h3>
                            <button onClick={() => setIsUploadModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Blood Test Results"
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add any notes..."
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">File</label>
                                <div
                                    className={`relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {file ? (
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <FileText className="h-5 w-5" />
                                            <span className="text-sm font-medium line-clamp-1 max-w-[200px]">{file.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                            <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !file || !title}
                                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 cursor-pointer"
                            >
                                {uploading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</span> : 'Upload Report'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};
