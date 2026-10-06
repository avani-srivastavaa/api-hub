import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function TestConnector() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/connectors')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Test Connector</h1>
      </div>

      <div className="card">
        <p className="text-gray-600">Testing interface for connector {id}</p>
        <p className="text-gray-600 mt-2">(To be fully implemented in Phase 2)</p>
      </div>
    </div>
  );
}

export default TestConnector;
