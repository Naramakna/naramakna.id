import React from 'react';
import { DataTable } from '../DataTable';

interface User {
  ID: number;
  user_login: string;
  user_email: string;
  user_role: string;
  user_status: string; // Changed from number to string
  user_registered: string;
  display_name: string;
}

interface UserManagementProps {
  users: User[];
  loading: boolean;
  title: string;
  currentUserRole?: string;
  onPromoteToAdmin?: (userId: number) => void;
  onDemoteAdmin?: (userId: number) => void;
  onSuspendUser?: (userId: number) => void;
  onUnsuspendUser?: (userId: number) => void;
  onDeleteUser?: (userId: number) => void;
  showActions?: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  loading,
  title,
  currentUserRole,
  onPromoteToAdmin,
  onDemoteAdmin,
  onSuspendUser,
  onUnsuspendUser,
  onDeleteUser,
  showActions = false
}) => {
  const baseColumns = [
    { key: 'ID', label: 'ID' },
    { key: 'user_login', label: 'Username' },
    { key: 'user_email', label: 'Email' },
    {
      key: 'user_role',
      label: 'Role',
      render: (role: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          role === 'superadmin' ? 'bg-red-100 text-red-800' : 
          role === 'admin' ? 'bg-purple-100 text-purple-800' : 
          role === 'writer' ? 'bg-green-100 text-green-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {role}
        </span>
      )
    },
    {
      key: 'user_status',
      label: 'Status',
      render: (status: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          status === 'active' ? 'bg-green-100 text-green-800' : 
          status === 'suspended' ? 'bg-red-100 text-red-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'active' ? 'Active' : status === 'suspended' ? 'Suspended' : status}
        </span>
      )
    },
    {
      key: 'user_registered',
      label: 'Registered',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  const actionsColumn = {
    key: 'actions',
    label: 'Actions',
    render: (_: any, user: User) => (
      <div className="text-sm space-x-1 flex flex-wrap gap-1">
        {onPromoteToAdmin && user.user_role === 'user' && (
          <button 
            onClick={() => onPromoteToAdmin(user.ID)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs font-medium"
          >
            Promote to Admin
          </button>
        )}
        {onDemoteAdmin && user.user_role === 'admin' && currentUserRole === 'superadmin' && (
          <button 
            onClick={() => onDemoteAdmin(user.ID)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs font-medium"
          >
            Demote to User
          </button>
        )}
        
        {/* Suspend/Unsuspend buttons */}
        {onSuspendUser && user.user_status === 'active' && user.user_role !== 'superadmin' && (
          <button 
            onClick={() => onSuspendUser(user.ID)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs font-medium"
            title="Suspend user (prevent posting)"
          >
            Suspend
          </button>
        )}
        {onUnsuspendUser && user.user_status === 'suspended' && user.user_role !== 'superadmin' && (
          <button 
            onClick={() => onUnsuspendUser(user.ID)}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium"
            title="Unsuspend user (allow posting)"
          >
            Unsuspend
          </button>
        )}
        
        {/* Delete button - most dangerous action */}
        {onDeleteUser && user.user_role !== 'superadmin' && (
          <button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to DELETE user "${user.display_name || user.user_login}"? This action CANNOT be undone!`)) {
                onDeleteUser(user.ID);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium"
            title="Permanently delete user account"
          >
            Delete
          </button>
        )}
      </div>
    )
  };

  const columns = showActions ? [...baseColumns, actionsColumn] : baseColumns;

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">{title}</h2>
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found."
      />
    </div>
  );
};
