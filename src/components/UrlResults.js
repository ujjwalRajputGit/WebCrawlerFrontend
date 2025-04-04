import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const UrlResults = ({ selectedTask }) => {
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  
  useEffect(() => {
    // Reset state when selected task changes
    setUrls([]);
    setError(null);
    setSelectedDomain(null);
  }, [selectedTask]);
  
  const fetchUrls = async (domain) => {
    if (!selectedTask || !domain) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getUrls(selectedTask.task_id, domain);
      setUrls(data.urls || []);
      setSelectedDomain(domain);
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
      toast.error(`Failed to fetch URLs: ${error.response?.data?.detail || error.message}`);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (!selectedTask) {
    return (
      <div className="card">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Crawled URLs</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">Select a task to view crawled URLs</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">Crawled URLs</h5>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">Select Domain to View Results</label>
            <div className="d-flex gap-2">
              {selectedTask.domains.map((domain) => (
                <button
                  key={domain}
                  className={`btn ${selectedDomain === domain ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => fetchUrls(domain)}
                  disabled={loading}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {!loading && !error && urls.length > 0 && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Found {urls.length} URLs for {selectedDomain}</h6>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(urls.join('\n'));
                  toast.success("URLs copied to clipboard");
                }}
              >
                Copy All
              </button>
            </div>
            
            <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {urls.map((url, index) => (
                <div key={index} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-truncate me-2"
                    >
                      {url}
                    </a>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        toast.success("URL copied to clipboard");
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {!loading && !error && urls.length === 0 && selectedDomain && (
          <div className="alert alert-info" role="alert">
            No URLs found for {selectedDomain}. If the crawl is still in progress, try again later.
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlResults; 