import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const TaskList = ({ tasks, onTaskSelect, onTasksUpdated, selectedTaskId }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState({});
  
  // Initialize taskStatuses from saved tasks
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const initialStatuses = {};
      tasks.forEach(task => {
        initialStatuses[task.task_id] = { status: task.status || 'UNKNOWN' };
      });
      setTaskStatuses(prev => ({ ...prev, ...initialStatuses }));
    }
  }, []);
  
  // Refresh task statuses periodically
  useEffect(() => {
    const fetchTaskStatuses = async () => {
      if (tasks.length === 0) return;
      
      setRefreshing(true);
      
      try {
        const statuses = {};
        let hasChanges = false;
        
        for (const task of tasks) {
          try {
            const status = await api.getTaskStatus(task.task_id);
            statuses[task.task_id] = status;
            
            // Check if status actually changed
            if (status.status !== task.status) {
              hasChanges = true;
            }
          } catch (error) {
            console.error(`Error fetching status for task ${task.task_id}:`, error);
          }
        }
        
        setTaskStatuses(prev => ({ ...prev, ...statuses }));
        
        // Update parent component if needed
        if (onTasksUpdated && hasChanges) {
          onTasksUpdated(statuses);
        }
      } catch (error) {
        console.error("Error refreshing task statuses:", error);
      } finally {
        setRefreshing(false);
      }
    };
    
    // Fetch on mount and then every 5 seconds for active tasks
    fetchTaskStatuses();
    const interval = setInterval(fetchTaskStatuses, 5000);
    
    return () => clearInterval(interval);
  }, [tasks, onTasksUpdated]);
  
  const handleCancelTask = async (taskId) => {
    try {
      await api.cancelTask(taskId);
      toast.success(`Task ${taskId} cancelled`);
      
      // Update the status locally to avoid waiting for refresh
      const updatedStatuses = {
        ...taskStatuses,
        [taskId]: { ...taskStatuses[taskId], status: 'REVOKED' }
      };
      
      setTaskStatuses(updatedStatuses);
      
      // Also notify parent component
      if (onTasksUpdated) {
        onTasksUpdated(updatedStatuses);
      }
    } catch (error) {
      toast.error(`Failed to cancel task: ${error.message}`);
    }
  };
  
  if (tasks.length === 0) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">Tasks</h5>
        </div>
        <div className="card-body">
          <p className="text-muted">No crawler tasks found. Start a new crawl above.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center bg-secondary text-white">
        <h5 className="mb-0">Tasks</h5>
        {refreshing && (
          <div className="spinner-border spinner-border-sm text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
      <div className="card-body p-0">
        <div className="list-group list-group-flush">
          {tasks.map(task => {
            const status = taskStatuses[task.task_id] || { status: task.status || 'UNKNOWN' };
            
            let statusBadgeClass = 'bg-secondary';
            if (status.status === 'SUCCESS') statusBadgeClass = 'bg-success';
            if (status.status === 'FAILURE') statusBadgeClass = 'bg-danger';
            if (status.status === 'STARTED' || status.status === 'PROGRESS') statusBadgeClass = 'bg-primary';
            if (status.status === 'REVOKED') statusBadgeClass = 'bg-warning';
            
            return (
              <div 
                key={task.task_id}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedTaskId === task.task_id ? 'active' : ''}`}
                onClick={() => onTaskSelect(task)}
              >
                <div>
                  <div className="fw-bold">
                    <span className={`badge ${statusBadgeClass} me-2`}>
                      {status.status}
                    </span>
                    {task.domains.join(', ')}
                  </div>
                  <small className="text-muted">
                    Task ID: {task.task_id.substring(0, 8)}... • 
                    Max Depth: {task.max_depth} •
                    {task.timestamp && <> Created: {new Date(task.timestamp).toLocaleString()}</>}
                  </small>
                </div>
                
                <div className="d-flex gap-2">
                  {(status.status === 'STARTED' || status.status === 'PENDING' || status.status === 'PROGRESS') && (
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelTask(task.task_id);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="card-footer d-flex justify-content-between">
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all tasks from the list? This won't stop any running tasks.")) {
              localStorage.removeItem('crawler_tasks');
              window.location.reload();
            }
          }}
        >
          Clear All Tasks
        </button>
        
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default TaskList; 