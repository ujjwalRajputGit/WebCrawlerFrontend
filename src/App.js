import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import CrawlForm from './components/CrawlForm';
import TaskList from './components/TaskList';
import UrlResults from './components/UrlResults';
import ServiceStatus from './components/ServiceStatus';

function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load tasks from localStorage on mount - only once
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('crawler_tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        console.log('Loaded tasks from localStorage:', parsedTasks);
        
        if (parsedTasks && Array.isArray(parsedTasks) && parsedTasks.length > 0) {
          setTasks(parsedTasks);
          setSelectedTask(parsedTasks[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);
  
  // Save tasks to localStorage whenever they change, but only after initial load
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      console.log('Saving tasks to localStorage:', tasks);
      localStorage.setItem('crawler_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }, [tasks, isInitialized]);
  
  const handleTaskCreated = (newTask) => {
    // Add new task to the list
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    setSelectedTask(newTask);
    
    // Manual save to localStorage to ensure it persists
    try {
      localStorage.setItem('crawler_tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to save tasks after adding new task:', error);
    }
  };
  
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="container py-4">
      <header className="mb-4 text-center">
        <h1 className="display-5 fw-bold">Web Crawler</h1>
        <p className="lead">
          Crawl e-commerce websites and extract product URLs
        </p>
      </header>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <ServiceStatus />
        </div>
        <div className="col-md-6">
          <CrawlForm onTaskCreated={handleTaskCreated} />
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-4">
          <TaskList 
            tasks={tasks} 
            onTaskSelect={handleTaskSelect} 
            selectedTaskId={selectedTask?.task_id}
            onTasksUpdated={(statuses) => {
              // If a task status has changed, update the tasks array
              let hasChanges = false;
              const updatedTasks = tasks.map(task => {
                const status = statuses[task.task_id];
                if (status && status.status) {
                  hasChanges = true;
                  return {
                    ...task,
                    status: status.status
                  };
                }
                return task;
              });
              
              if (hasChanges) {
                setTasks(updatedTasks);
                // Force save to localStorage
                localStorage.setItem('crawler_tasks', JSON.stringify(updatedTasks));
              }
            }}
          />
        </div>
        <div className="col-md-8">
          <UrlResults selectedTask={selectedTask} />
        </div>
      </div>
      
      <footer className="mt-5 text-center text-muted">
        <small>&copy; {new Date().getFullYear()} Web Crawler</small>
      </footer>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App; 