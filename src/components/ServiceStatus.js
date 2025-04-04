import React, { useState, useEffect } from 'react';
import api from '../api';

const ServiceStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await api.healthCheck();
        setStatus(data);
      } catch (error) {
        setError(error.message);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Check on mount and then every 30 seconds
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIndicator = (serviceStatus) => {
    if (serviceStatus && serviceStatus === 'UP') {
      return <span className="badge bg-success">Online</span>;
    }
    return <span className="badge bg-danger">Offline</span>;
  };

  if (loading && !status) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">Service Status</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">Service Status</h5>
        </div>
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            <strong>API Unavailable:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Service Status</h5>
        {loading && (
          <div className="spinner-border spinner-border-sm text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
      <div className="card-body">
        {status && (
          <div className="row">
            <div className="col-md-6">
              <div className="mb-2">
                <strong>API:</strong> {getStatusIndicator(status.services?.api)}
              </div>
              <div className="mb-2">
                <strong>Redis:</strong> {getStatusIndicator(status.services?.redis)}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-2">
                <strong>Overall:</strong> {getStatusIndicator(status.status === 'healthy' ? 'UP' : 'DOWN')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceStatus; 