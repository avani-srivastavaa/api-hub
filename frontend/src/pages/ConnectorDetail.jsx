import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConnectorStore } from '../store';

function ConnectorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedConnector, loading, fetchConnectorById } = useConnectorStore();

  useEffect(() => {
    loadConnector();
  }, [id]);

  const loadConnector = async () => {
    try {
      await fetchConnectorById(id);
    } catch (err) {
      toast.error('Failed to load connector');
      navigate('/connectors');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading connector...</p>
        </div>
      </div>
    );
  }

  if (!selectedConnector) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-900">Connector not found</p>
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/connectors')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedConnector.name}</h1>
          <p className="text-gray-600 mt-1">{selectedConnector.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Provider</p>
              <p className="text-gray-900 capitalize mt-1">{selectedConnector.provider}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Model</p>
              <p className="text-gray-900 mt-1">{selectedConnector.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Endpoint</p>
              <div className="flex items-center gap-2 mt-1 bg-gray-50 p-2 rounded">
                <code className="flex-1 text-sm text-gray-900">
                  {selectedConnector.endpoint_path}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedConnector.endpoint_path)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <span
                className={`badge mt-1 ${
                  selectedConnector.status === 'active'
                    ? 'badge-success'
                    : 'badge-warning'
                } capitalize`}
              >
                {selectedConnector.status}
              </span>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
          <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {selectedConnector.system_prompt}
            </p>
          </div>
        </div>
      </div>

      {/* Input Schema */}
      {selectedConnector.input_schema && selectedConnector.input_schema.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Input Parameters</h3>
          <div className="space-y-3">
            {selectedConnector.input_schema.map((field, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{field.name}</p>
                    <p className="text-sm text-gray-600">{field.type}</p>
                    {field.description && (
                      <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                    )}
                  </div>
                  <span
                    className={`badge ${
                      field.required ? 'badge-danger' : 'badge-warning'
                    }`}
                  >
                    {field.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output Schema */}
      {selectedConnector.output_schema && Object.keys(selectedConnector.output_schema).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Output Schema</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(selectedConnector.output_schema, null, 2)}
          </pre>
        </div>
      )}

      {/* Created Info */}
      <div className="text-sm text-gray-600">
        <p>Created: {new Date(selectedConnector.created_at).toLocaleString()}</p>
        <p>Last updated: {new Date(selectedConnector.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default ConnectorDetail;
