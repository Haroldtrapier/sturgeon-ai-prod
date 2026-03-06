import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export const metadata = {
  title: 'Analytics | Sturgeon AI',
  description: 'Proposal analytics, performance trends, and business intelligence',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-2">Track proposals, win rates, and business performance</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
