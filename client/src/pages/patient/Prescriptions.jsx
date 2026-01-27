import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
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

  return (
    <DashboardLayout title="Prescriptions" subtitle="Medication plans and instructions">
      <div className="space-y-6">
        <PageHeader title="Prescriptions" subtitle="View active and past prescriptions." />

        {loading ? (
          <Spinner />
        ) : prescriptions.length === 0 ? (
          <EmptyState title="No prescriptions" description="Prescriptions will appear here once issued." />
        ) : (
          <Table
            columns={['Doctor', 'Issue date', 'Diagnosis', 'Status']}
            rows={prescriptions}
            renderRow={(item) => (
              <tr key={item._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(item.doctor?.user)}</td>
                <td className="px-5 py-4">{formatDate(item.issueDate)}</td>
                <td className="px-5 py-4">{item.diagnosis || '—'}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
