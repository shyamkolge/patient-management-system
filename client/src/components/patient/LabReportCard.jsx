import { FileText, Image as ImageIcon, Trash2, Eye, Download } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useState } from 'react';

export const LabReportCard = ({ report, onDelete }) => {
    const isPdf = report.fileType.includes('pdf') || report.fileUrl.endsWith('.pdf');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            setIsDeleting(true);
            await onDelete(report._id);
            setIsDeleting(false);
        }
    };

    return (
        <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-slate-50 overflow-hidden">
                {isPdf ? (
                    <FileText className="h-12 w-12 text-blue-500" />
                ) : (
                    <img
                        src={report.fileUrl}
                        alt={report.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
            </div>

            <div className="flex-1">
                <h3 className="font-semibold text-slate-900 line-clamp-1" title={report.title}>
                    {report.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{formatDate(report.uploadDate)}</p>

                {report.description && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2" title={report.description}>
                        {report.description}
                    </p>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" /> View
                </a>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete Report"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
