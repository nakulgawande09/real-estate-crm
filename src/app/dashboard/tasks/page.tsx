'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns';
import { FaSearch, FaPlus, FaCheckCircle, FaClock, FaExclamationCircle, FaTrash, FaPencilAlt, FaUser, FaTimes, FaFilter, FaSort } from 'react-icons/fa';

export const runtime = 'edge';

interface TaskUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  assignedTo: TaskUser;
  createdBy: TaskUser;
  createdAt: string;
  updatedAt: string;
  relatedTo?: {
    type: 'PROJECT' | 'PROPERTY' | 'LEAD' | 'CLIENT';
    id: string;
    name: string;
  };
  tags: string[];
}

function TasksContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortField, setSortField] = useState<'dueDate' | 'priority' | 'status'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    priority: 'MEDIUM',
    assignedTo: '',
  });

  // Mock users for task assignment
  const users: TaskUser[] = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'CEO'
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Agent'
    },
    {
      id: 'user3',
      name: 'Mark Wilson',
      email: 'mark@example.com',
      role: 'Admin'
    }
  ];

  useEffect(() => {
    // Mock data for tasks
    const mockTasks: Task[] = [
      {
        id: 'task1',
        title: 'Review Riverfront Heights Contract',
        description: 'Review and approve the final contract for Riverfront Heights property sale.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        assignedTo: users[0],
        createdBy: users[1],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedTo: {
          type: 'PROJECT',
          id: '1',
          name: 'Riverfront Heights'
        },
        tags: ['contract', 'legal', 'review']
      },
      {
        id: 'task2',
        title: 'Schedule property viewing for Michael Chen',
        description: 'Arrange a viewing for Michael Chen at the Downtown Loft 305 property.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: format(new Date(), 'yyyy-MM-dd'), // Today
        assignedTo: users[1],
        createdBy: users[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedTo: {
          type: 'PROPERTY',
          id: 'prop4',
          name: 'Downtown Loft 305'
        },
        tags: ['viewing', 'client']
      },
      {
        id: 'task3',
        title: 'Submit quarterly tax documents',
        description: 'Prepare and submit quarterly tax documents for all active properties.',
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: format(addDays(new Date(), -3), 'yyyy-MM-dd'), // Past due
        assignedTo: users[2],
        createdBy: users[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['finance', 'taxes', 'quarterly']
      },
      {
        id: 'task4',
        title: 'Update marketing materials for Garden Terrace',
        description: 'Refresh marketing brochures and website content for Garden Terrace properties.',
        status: 'TODO',
        priority: 'LOW',
        dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        assignedTo: users[1],
        createdBy: users[2],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedTo: {
          type: 'PROPERTY',
          id: 'prop5',
          name: 'Garden Terrace 2B'
        },
        tags: ['marketing', 'content']
      },
      {
        id: 'task5',
        title: 'Call back potential investor',
        description: 'Follow up with Robert Miller regarding potential investment in Skyline Tower.',
        status: 'TODO',
        priority: 'URGENT',
        dueDate: format(new Date(), 'yyyy-MM-dd'), // Today
        assignedTo: users[0],
        createdBy: users[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedTo: {
          type: 'LEAD',
          id: 'lead1',
          name: 'Robert Miller'
        },
        tags: ['investor', 'call', 'follow-up']
      }
    ];

    setTasks(mockTasks);
    setFilteredTasks(mockTasks);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter) {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    // Apply assignee filter
    if (assigneeFilter) {
      result = result.filter(task => task.assignedTo.id === assigneeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === 'dueDate') {
        return sortDirection === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortField === 'priority') {
        const priorityValues = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'URGENT': 4 };
        return sortDirection === 'asc' 
          ? priorityValues[a.priority] - priorityValues[b.priority]
          : priorityValues[b.priority] - priorityValues[a.priority];
      } else if (sortField === 'status') {
        const statusValues = { 'TODO': 1, 'IN_PROGRESS': 2, 'COMPLETED': 3, 'CANCELLED': 4 };
        return sortDirection === 'asc' 
          ? statusValues[a.status] - statusValues[b.status]
          : statusValues[b.status] - statusValues[a.status];
      }
      return 0;
    });
    
    setFilteredTasks(result);
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueStatusColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (isAfter(today, due)) {
      return 'text-red-600'; // Overdue
    } else if (isToday(due)) {
      return 'text-orange-600'; // Due today
    } else if (isBefore(due, addDays(today, 3))) {
      return 'text-yellow-600'; // Due soon
    } else {
      return 'text-gray-600'; // Due later
    }
  };

  const getDueStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    
    if (isAfter(today, due)) {
      return 'Overdue';
    } else if (isToday(due)) {
      return 'Due today';
    } else if (isBefore(due, addDays(today, 3))) {
      return 'Due soon';
    } else {
      return format(due, 'MMM d, yyyy');
    }
  };

  const handleTaskCreate = () => {
    // Simulate task creation
    const newTaskObj: Task = {
      id: `task${tasks.length + 1}`,
      title: newTask.title,
      description: newTask.description,
      status: 'TODO',
      priority: newTask.priority as any,
      dueDate: newTask.dueDate,
      assignedTo: users.find(u => u.id === newTask.assignedTo) || users[0],
      createdBy: users[0], // Assume current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };
    
    setTasks([...tasks, newTaskObj]);
    setIsCreateModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      priority: 'MEDIUM',
      assignedTo: '',
    });
  };

  const handleStatusChange = (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } 
        : task
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" />
          New Task
        </button>
      </div>

      {/* Task Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            <FaCheckCircle className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total assigned tasks</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Due Today</h3>
            <FaClock className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {tasks.filter(task => isToday(new Date(task.dueDate)) && task.status !== 'COMPLETED').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tasks due today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
            <FaExclamationCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {tasks.filter(task => 
              isAfter(new Date(), new Date(task.dueDate)) && 
              task.status !== 'COMPLETED' && 
              task.status !== 'CANCELLED'
            ).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tasks past due date</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <FaCheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {tasks.filter(task => task.status === 'COMPLETED').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tasks completed</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            className="w-full md:w-48 pl-4 pr-8 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">All Assignees</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortField('priority');
                    setSortDirection(sortField === 'priority' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center">
                    Priority
                    {sortField === 'priority' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortField('dueDate');
                    setSortDirection(sortField === 'dueDate' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center">
                    Due Date
                    {sortField === 'dueDate' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setSortField('status');
                    setSortDirection(sortField === 'status' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      <FaSort className="ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{task.title}</span>
                      <span className="text-sm text-gray-500">{task.description.substring(0, 60)}...</span>
                      {task.relatedTo && (
                        <span className="text-xs text-blue-600 mt-1">
                          Related to: {task.relatedTo.name} ({task.relatedTo.type})
                        </span>
                      )}
                      <div className="flex gap-1 mt-1">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${getDueStatusColor(task.dueDate)}`}>
                      {getDueStatus(task.dueDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-medium">
                        {task.assignedTo.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{task.assignedTo.name}</div>
                        <div className="text-xs text-gray-500">{task.assignedTo.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(task.status)}`}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <FaPencilAlt />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">Select Assignee</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTaskCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={!newTask.title || !newTask.dueDate || !newTask.assignedTo}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <TasksContent />
    </Suspense>
  );
} 