import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Activity, Zap } from 'lucide-react';
import { systemAPI, connectorsAPI } from '../services/api';

function Dashboard() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sysRes, statsRes] = await Promise.all([
        systemAPI.systemInfo(),
        connectorsAPI.getAllStats(),
      ]);
      setSystemInfo(sysRes.data);
      setStats(statsRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-red-600" size={20} />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const toNumber = (value) => Number(value ?? 0);
  const totalRequests = stats?.reduce((sum, s) => sum + toNumber(s.total_requests), 0) || 0;
  const totalTokens = stats?.reduce((sum, s) => sum + toNumber(s.total_tokens_used), 0) || 0;
  const totalCost = stats?.reduce((sum, s) => sum + toNumber(s.estimated_total_cost), 0) || 0;

  return (
    <div className="space-y-8">
      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <p className="text-green-600 flex items-center gap-2 mt-1">
              <CheckCircle size={16} />
              All systems operational
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Environment</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {systemInfo?.service?.environment}
            </p>
          </div>
        </div>
      </div>

      {/* Providers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemInfo?.providers?.available?.map((provider) => (
            <div
              key={provider}
              className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
                systemInfo.providers.configured?.[provider]
                  ? 'border-green-500'
                  : 'border-amber-500'
              }`}
            >
              <p className="font-semibold text-gray-900 capitalize">{provider}</p>
              <p
                className={`text-sm mt-1 ${
                  systemInfo.providers.configured?.[provider]
                    ? 'text-green-700'
                    : 'text-amber-700'
                }`}
              >
                {systemInfo.providers.configured?.[provider]
                  ? 'API key configured'
                  : 'Add API key to .env'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {totalRequests.toLocaleString()}
                </p>
              </div>
              <Activity className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tokens Used</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {(totalTokens / 1000).toFixed(1)}K
                </p>
              </div>
              <Zap className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimated Cost</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
              <Zap className="text-green-500" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Connectors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Connectors</h3>
          <Link
            to="/connectors"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>

        {stats && stats.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Avg Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.slice(0, 5).map((stat) => {
                  const totalRequestsValue = toNumber(stat.total_requests);
                  const successfulRequestsValue = toNumber(stat.successful_requests);
                  const avgResponseTimeValue = toNumber(stat.avg_response_time_ms);

                  return (
                    <tr key={stat.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {stat.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {totalRequestsValue}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="badge badge-success">
                          {totalRequestsValue
                            ? (
                                (successfulRequestsValue / totalRequestsValue) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {avgResponseTimeValue > 0 ? avgResponseTimeValue.toFixed(0) : 'N/A'}
                        {avgResponseTimeValue > 0 ? ' ms' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No connectors yet</p>
            <Link
              to="/connectors/new"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first connector
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
