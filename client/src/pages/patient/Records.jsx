import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { formatDate, formatName } from '../../utils/format.js';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medical-records?limit=20');
      setRecords(response.data.records || []);
    } catch (err) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <DashboardLayout title="Medical Records" subtitle="Your visit history and diagnoses">
      <div className="space-y-6">
        <PageHeader title="Medical records" subtitle="Review notes and diagnoses from your visits." />

        {loading ? (
          <Spinner />
        ) : records.length === 0 ? (
          <EmptyState title="No records yet" description="Your medical records will appear here." />
        ) : (
          <Table
            columns={['Visit date', 'Doctor', 'Diagnosis', 'Treatment']}
            rows={records}
            renderRow={(record) => (
              <tr key={record._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatDate(record.visitDate)}</td>
                <td className="px-5 py-4">{formatName(record.doctor?.user)}</td>
                <td className="px-5 py-4">{record.diagnosis}</td>
                <td className="px-5 py-4">{record.treatment}</td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientRecords;
