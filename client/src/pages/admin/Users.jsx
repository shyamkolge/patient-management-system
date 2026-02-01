import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Table } from '../../components/common/Table.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { api } from '../../services/api.js';
import { formatName } from '../../utils/format.js';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/users?search=${encodeURIComponent(query)}`);
      setUsers(response.data.users || []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    setError('');
    try {
      await api.patch(`/users/${id}/role`, { role });
      await fetchUsers(search);
    } catch (err) {
      setError(err.message || 'Unable to update role');
    }
  };

  return (
    <DashboardLayout title="User Management" subtitle="Control access and roles across the system">
      <div className="space-y-6">
        <PageHeader title="Users" subtitle="Search users and update access roles." />

        <div className="flex flex-wrap items-center gap-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users"
            className="w-full max-w-sm rounded-xl border border-slate-400 px-4 py-2 text-sm"
          />
          <button
            onClick={() => fetchUsers(search)}
            className="rounded-xl border bg-blue-600 border-slate-200 px-4 py-2 text-md font-medium text-white"
          >
            Search
          </button>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try another filter or add new staff." />
        ) : (
          <Table
            columns={['User', 'Email', 'Role', 'Status', 'Action']}
            rows={users}
            renderRow={(user) => (
              <tr key={user._id} className="text-sm text-slate-700">
                <td className="px-5 py-4">{formatName(user)}</td>
                <td className="px-5 py-4">{user.email}</td>
                <td className="px-5 py-4 capitalize">{user.role}</td>
                <td className="px-5 py-4 capitalize">{user.status}</td>
                <td className="px-5 py-4">
                  <select
                    defaultValue={user.role}
                    onChange={(event) => handleRoleChange(user._id, event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="admin">admin</option>
                    <option value="doctor">doctor</option>
                    <option value="patient">patient</option>
                  </select>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
