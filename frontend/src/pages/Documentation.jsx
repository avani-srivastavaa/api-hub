import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { docsAPI } from '../services/api';

function Documentation() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const response = await docsAPI.listDocs();
      setDocs(response.data.data);
    } catch (err) {
      toast.error('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading documentation...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>

      {docs.length > 0 ? (
        <div className="grid gap-4">
          {docs.map((doc) => (
            <div key={doc.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
                  <p className="text-gray-600 mt-1">{doc.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="badge badge-primary capitalize">{doc.provider}</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {doc.endpoint}
                    </code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-sm"
                  >
                    JSON
                  </a>
                  <a
                    href={doc.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary text-sm"
                  >
                    HTML
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-600">No documentation available yet</p>
        </div>
      )}
    </div>
  );
}

export default Documentation;
