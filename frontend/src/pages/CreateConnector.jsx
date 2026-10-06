import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useConnectorStore } from '../store';

function CreateConnector() {
  const navigate = useNavigate();
  const { createConnector, loading } = useConnectorStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    system_prompt: '',
    input_schema: [],
    output_schema: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Connector name is required');
      return;
    }

    if (!formData.system_prompt.trim()) {
      toast.error('System prompt is required');
      return;
    }

    try {
      await createConnector(formData);
      toast.success('Connector created successfully');
      navigate('/connectors');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create connector');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Connector</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="label">Connector Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Card Scanner"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What does this connector do?"
                className="input-field"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Provider</label>
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="anthropic">Anthropic</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>

              <div>
                <label className="label">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">System Prompt</label>
              <textarea
                name="system_prompt"
                value={formData.system_prompt}
                onChange={handleChange}
                placeholder="Enter the system instructions for this connector..."
                className="input-field"
                rows="6"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Connector'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/connectors')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateConnector;
