import React, { useState } from 'react';
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
  onEditUser?: (userId: number, data: { user_login?: string; user_email?: string; user_role?: string; user_status?: number | string }) => void;
  onUpdatePassword?: (userId: number, newPassword: string) => void;
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
  onEditUser,
  onUpdatePassword,
  showActions = false
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<{ user_login: string; user_email: string; user_role: string; user_status: string } | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [passwordForm, setPasswordForm] = useState<{ password: string; confirm: string } | null>(null);

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      user_login: user.user_login,
      user_email: user.user_email,
      user_role: user.user_role,
      user_status: typeof user.user_status === 'string' ? user.user_status : String(user.user_status)
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setForm(null);
  };

  const openChangePassword = (user: User) => {
    setChangingPasswordUser(user);
    setPasswordForm({ password: '', confirm: '' });
  };

  const closeChangePassword = () => {
    setChangingPasswordUser(null);
    setPasswordForm(null);
  };

  const saveChangePassword = () => {
    if (!changingPasswordUser || !passwordForm || !onUpdatePassword) return;
    const { password, confirm } = passwordForm;
    if (password.length < 8) {
      alert('Password minimal 8 karakter');
      return;
    }
    if (password !== confirm) {
      alert('Konfirmasi Password tidak sama');
      return;
    }
    if (!window.confirm(`Update password untuk user "${changingPasswordUser.display_name || changingPasswordUser.user_login}"?`)) {
      return;
    }
    onUpdatePassword(changingPasswordUser.ID, password);
    closeChangePassword();
  };

  const saveEdit = () => {
    if (!editingUser || !form || !onEditUser) return;
    const statusMap: Record<string, number> = { active: 1, suspended: 2, pending: 0 };
    const payload = {
      user_login: form.user_login,
      user_email: form.user_email,
      user_role: form.user_role,
      user_status: statusMap[form.user_status] ?? parseInt(form.user_status)
    };
    onEditUser(editingUser.ID, payload);
    closeEdit();
  };
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
        {onEditUser && (user.user_role !== 'superadmin' || currentUserRole === 'superadmin') && (
          <button
            onClick={() => openEdit(user)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium"
          >
            Edit
          </button>
        )}
        {onUpdatePassword && (user.user_role !== 'superadmin' || currentUserRole === 'superadmin') && (
          <button
            onClick={() => openChangePassword(user)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs font-medium"
            title="Update Password"
          >
            Update Password
          </button>
        )}
        {onPromoteToAdmin && (user.user_role === 'user' || user.user_role === 'writer') && (
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
      {editingUser && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={form.user_login}
                  onChange={(e) => setForm({ ...form, user_login: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={form.user_email}
                  onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={form.user_role}
                  onChange={(e) => setForm({ ...form, user_role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="user">user</option>
                  <option value="writer">writer</option>
                  <option value="admin">admin</option>
                  {currentUserRole === 'superadmin' && <option value="superadmin">superadmin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.user_status}
                  onChange={(e) => setForm({ ...form, user_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                  <option value="pending">pending</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {changingPasswordUser && passwordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeChangePassword}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveChangePassword}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
