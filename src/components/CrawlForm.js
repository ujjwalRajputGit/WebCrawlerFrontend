import React, { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const CrawlForm = ({ onTaskCreated }) => {
  const [domains, setDomains] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validate domain format
  const validateDomain = (domain) => {
    // Allow domains with or without http://, https:// or www. prefixes
    // First strip any protocol and www prefix if present
    let processedDomain = domain;
    
    // Remove protocol if present (http:// or https://)
    if (processedDomain.startsWith('http://')) {
      processedDomain = processedDomain.substring(7);
    } else if (processedDomain.startsWith('https://')) {
      processedDomain = processedDomain.substring(8);
    }
    
    // Remove www. prefix if present
    if (processedDomain.startsWith('www.')) {
      processedDomain = processedDomain.substring(4);
    }
    
    // Basic domain validation - should be like example.com or subdomain.example.co.uk
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(processedDomain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    let hasErrors = false;
    
    if (!domains.trim()) {
      setErrors(prev => ({ ...prev, domains: 'Please enter at least one domain' }));
      hasErrors = true;
    }
    
    // Parse domains (comma or newline separated)
    const domainList = domains
      .split(/[\n,]/)
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
    
    if (domainList.length === 0 && !hasErrors) {
      setErrors(prev => ({ ...prev, domains: 'Please enter at least one valid domain' }));
      hasErrors = true;
    }

    // Validate each domain
    const invalidDomains = domainList.filter(domain => !validateDomain(domain));
    if (invalidDomains.length > 0 && !hasErrors) {
      setErrors(prev => ({ 
        ...prev, 
        domains: `Invalid domain format: ${invalidDomains.join(', ')}. Use format like example.com, www.example.com, or http://example.com` 
      }));
      hasErrors = true;
    }
    
    // Validate max depth - ensure it's not empty/undefined
    if (maxDepth === null || maxDepth === undefined || isNaN(maxDepth)) {
      setErrors(prev => ({ ...prev, maxDepth: 'Max depth is required' }));
      hasErrors = true;
    }
    // Validate max depth range
    else if (maxDepth < 1 || maxDepth > 5) {
      setErrors(prev => ({ ...prev, maxDepth: 'Max depth must be between 1 and 5' }));
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await api.startCrawl(domainList, maxDepth);
      toast.success(`Crawl started for ${domainList.length} domains`);
      
      // Add status to the response to make sure it's saved in localStorage
      const enhancedResponse = {
        ...response,
        status: response.status || 'PENDING',
        timestamp: new Date().toISOString()
      };
      
      // Reset form
      setDomains('');
      
      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(enhancedResponse);
      }
    } catch (error) {
      toast.error(`Failed to start crawl: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Start New Crawl</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="domains" className="form-label">Domains to Crawl</label>
            <textarea
              id="domains"
              className={`form-control ${errors.domains ? 'is-invalid' : ''}`}
              placeholder="Enter domain(s) to crawl (one per line or comma separated)"
              value={domains}
              onChange={(e) => {
                setDomains(e.target.value);
                if (errors.domains) {
                  setErrors(prev => ({ ...prev, domains: null }));
                }
              }}
              rows={3}
              disabled={isLoading}
              required
            />
            {errors.domains ? (
              <div className="invalid-feedback">{errors.domains}</div>
            ) : (
              <div className="form-text">Example: amazon.com, www.ebay.com or http://example.com</div>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor="maxDepth" className="form-label">Max Crawl Depth <span className="text-danger">*</span></label>
            <input
              type="number"
              className={`form-control ${errors.maxDepth ? 'is-invalid' : ''}`}
              id="maxDepth"
              min={1}
              max={5}
              value={maxDepth}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setMaxDepth(value);
                if (errors.maxDepth) {
                  setErrors(prev => ({ ...prev, maxDepth: null }));
                }
              }}
              disabled={isLoading}
              required
            />
            {errors.maxDepth ? (
              <div className="invalid-feedback">{errors.maxDepth}</div>
            ) : (
              <div className="form-text">Higher values will crawl more pages but take longer (1-5)</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Starting Crawl...
              </>
            ) : (
              'Start Crawl'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrawlForm; 