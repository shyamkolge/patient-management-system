import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';

const statusTone = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'info';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
};

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/prescriptions?limit=20');
      setPrescriptions(response.data.prescriptions || []);
    } catch (err) {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const getDurationDays = (prescription) => {
    const durationText = prescription.medications?.[0]?.duration || '';
    const match = String(durationText).match(/\d+/);
    return match ? Number(match[0]) : null;
  };

  const getProgress = (prescription) => {
    const days = getDurationDays(prescription);
    if (!days || !prescription.issueDate) return { percent: 60, remaining: '—' };
    const start = new Date(prescription.issueDate).getTime();
    const elapsedDays = Math.max(0, (Date.now() - start) / (1000 * 60 * 60 * 24));
    const percent = Math.min(100, Math.round((elapsedDays / days) * 100));
    const remaining = Math.max(0, Math.ceil(days - elapsedDays));
    return { percent, remaining: `${remaining} days remaining` };
  };

  return (
    <DashboardLayout title="Prescriptions" subtitle="Medication plans and instructions">
      <div className="space-y-6">
        <PageHeader title="Prescriptions" subtitle="View active and past prescriptions." />

        {loading ? (
          <Spinner />
        ) : prescriptions.length === 0 ? (
          <EmptyState title="No prescriptions" description="Prescriptions will appear here once issued." />
        ) : (
          <div className="space-y-4">
            {prescriptions.map((item) => {
              const progress = getProgress(item);
              return (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                        💊
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {formatName(item.doctor?.user) || 'Doctor'}
                          </p>
                          <Badge tone={statusTone(item.status)}>{item.status || 'active'}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          Prescribed: {formatDate(item.issueDate)}
                        </p>
                      </div>
                    </div>
                    <Badge tone={statusTone(item.status)}>{item.status || 'active'}</Badge>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Treatment Progress</span>
                      <span className="font-semibold text-slate-800">{progress.remaining}</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {item.medications?.map((med, idx) => (
                      <div
                        key={`${med.name}-${idx}`}
                        className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {med.name} {med.dosage ? `(${med.dosage})` : ''}
                            </p>
                            <p className="text-sm text-slate-600">{med.instructions || 'Take as directed'}</p>
                          </div>
                          <div className="text-sm text-slate-500">{med.frequency || 'Once daily'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
