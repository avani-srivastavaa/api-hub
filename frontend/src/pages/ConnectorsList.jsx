import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Edit2, Eye, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConnectorStore } from '../store';

function ConnectorsList() {
  const {
    connectors,
    loading,
    error,
    filters,
    fetchConnectors,
    deleteConnector,
    setFilters,
  } = useConnectorStore();

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    try {
      await fetchConnectors();
    } catch (err) {
      toast.error('Failed to load connectors');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete connector "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteConnector(id);
      toast.success('Connector deleted successfully');
    } catch (err) {
      toast.error('Failed to delete connector');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading connectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
        <div>
          <label className="label">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div>
          <label className="label">Provider</label>
          <select
            value={filters.provider}
            onChange={(e) => setFilters({ provider: e.target.value })}
            className="input-field"
          >
            <option value="all">All Providers</option>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={loadConnectors}
            className="btn btn-secondary"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Connectors List */}
      {connectors.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {connectors.map((connector) => (
                <tr
                  key={connector.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{connector.name}</div>
                    <div className="text-sm text-gray-600">
                      {connector.endpoint_path}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="badge badge-primary capitalize">
                      {connector.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {connector.model}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`badge ${
                        connector.status === 'active'
                          ? 'badge-success'
                          : 'badge-warning'
                      } capitalize`}
                    >
                      {connector.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/connectors/${connector.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        to={`/connectors/${connector.id}/test`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Test connector"
                      >
                        <Play size={18} />
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(connector.id, connector.name)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete connector"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 mb-4">No connectors found</p>
          <Link
            to="/connectors/new"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create your first connector
          </Link>
        </div>
      )}
    </div>
  );
}

export default ConnectorsList;
