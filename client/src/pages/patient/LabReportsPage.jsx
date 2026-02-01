import { LabReportsSection } from '../../components/patient/LabReportsSection.jsx';
import DashboardLayout from '../../components/layouts/DashboardLayout.jsx';

const LabReportsPage = () => {
    return (
        <DashboardLayout
            title="Lab Reports"
            subtitle="View and manage your medical documents and test results"
        >
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <LabReportsSection />
            </div>
        </DashboardLayout>
    );
};

export default LabReportsPage;
