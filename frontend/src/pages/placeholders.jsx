// ConnectorDetail.jsx
import { useParams } from 'react-router-dom';

export function ConnectorDetail() {
  const { id } = useParams();
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Connector Details</h2>
      <p className="text-gray-600">Connector ID: {id}</p>
      <p className="text-gray-600 mt-2">Details page (to be implemented)</p>
    </div>
  );
}

// CreateConnector.jsx
export function CreateConnector() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Create New Connector</h2>
      <p className="text-gray-600">Create connector form (to be implemented)</p>
    </div>
  );
}

// TestConnector.jsx
export function TestConnector() {
  const { id } = useParams();
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Test Connector</h2>
      <p className="text-gray-600">Connector ID: {id}</p>
      <p className="text-gray-600 mt-2">Test interface (to be implemented)</p>
    </div>
  );
}

// Documentation.jsx
export function Documentation() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
      <p className="text-gray-600">Documentation viewer (to be implemented)</p>
    </div>
  );
}

// Statistics.jsx
export function Statistics() {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Statistics</h2>
      <p className="text-gray-600">Analytics dashboard (to be implemented)</p>
    </div>
  );
}
