import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useStatsStore } from '../store';

function Statistics() {
  const { stats, loading, fetchStats } = useStatsStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      await fetchStats();
    } catch (err) {
      toast.error('Failed to load statistics');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <button
          onClick={loadStats}
          className="btn btn-secondary"
        >
          Refresh
        </button>
      </div>

      {stats && stats.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Connector
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Total Requests
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Avg Response Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Tokens Used
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Estimated Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => {
                const totalRequestsValue = Number(stat.total_requests ?? 0);
                const successfulRequestsValue = Number(stat.successful_requests ?? 0);
                const avgResponseTimeValue = Number(stat.avg_response_time_ms ?? 0);
                const estimatedCostValue = Number(stat.estimated_total_cost ?? 0);

                return (
                  <tr key={stat.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{stat.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {totalRequestsValue}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="badge badge-success">
                        {totalRequestsValue
                          ? ((successfulRequestsValue / totalRequestsValue) * 100).toFixed(0)
                          : 0}
                        %
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {avgResponseTimeValue > 0 ? avgResponseTimeValue.toFixed(0) : 'N/A'}
                      {avgResponseTimeValue > 0 ? ' ms' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {Number(stat.total_tokens_used ?? 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${estimatedCostValue.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">No statistics available yet</p>
        </div>
      )}
    </div>
  );
}

export default Statistics;
