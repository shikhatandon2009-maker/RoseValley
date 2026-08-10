'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Key,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  Lock,
  MapPin,
  Home,
  Check,
  Building
} from 'lucide-react';

interface UserItem {
  id: string;
  store_id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar_url?: string;
  must_change_password: boolean;
  created_at: string;
  updated_at?: string;
}

interface AddressItem {
  id: string;
  store_id: string;
  user_id: string;
  full_name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  customersCount: number;
  adminsCount: number;
  mustChangePasswordCount: number;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    customersCount: 0,
    adminsCount: 0,
    mustChangePasswordCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Address Modal States
  const [addressUser, setAddressUser] = useState<UserItem | null>(null);
  const [userAddresses, setUserAddresses] = useState<AddressItem[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false,
  });

  // Form States
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'admin',
    phone: '',
    avatar_url: '',
    must_change_password: false,
  });
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/users?role=${roleFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');

      setUsers(data.users || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.toLowerCase().includes(term))
    );
  }, [users, search]);

  // ADDRESS MANAGEMENT HANDLERS
  const fetchUserAddresses = async (user: UserItem) => {
    try {
      setLoadingAddresses(true);
      setAddressUser(user);
      const res = await fetch(`/api/admin/users/addresses?user_id=${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch customer addresses');

      setUserAddresses(data.addresses || []);
      setAddressFormData({
        full_name: user.full_name,
        phone: user.phone || '',
        street_address: '108 Grand Regalia Blvd',
        city: 'Kannauj',
        state: 'Uttar Pradesh',
        postal_code: '209725',
        country: 'India',
        is_default: true,
      });
    } catch (err: any) {
      showToast('error', err.message || 'Error loading addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressUser) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: addressUser.id,
          ...addressFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add address');

      showToast('success', 'Customer address added successfully!');
      setIsAddAddressOpen(false);
      fetchUserAddresses(addressUser);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!addressUser) return;
    try {
      const res = await fetch(`/api/admin/users/addresses?id=${addressId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete address');

      showToast('success', 'Address deleted.');
      fetchUserAddresses(addressUser);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete address');
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'customer',
      phone: '',
      avatar_url: '',
      must_change_password: false,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      avatar_url: user.avatar_url || '',
      must_change_password: user.must_change_password,
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      showToast('success', `User "${formData.full_name}" created successfully!`);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      showToast('success', `User "${formData.full_name}" updated successfully.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser || !resetPasswordInput) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/users/${passwordResetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: resetPasswordInput,
          must_change_password: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      showToast('success', `Password reset for ${passwordResetUser.email}.`);
      setPasswordResetUser(null);
      setResetPasswordInput('');
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      showToast('success', `User "${deletingUser.full_name}" deleted.`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Users className="w-4 h-4" /> Account & Customer Management
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Users & Customer Profiles
          </h1>
          <p className="text-stone-500 text-xs mt-1 font-medium">
            Store-scoped custom authentication, customer billing & shipping addresses, roles, and password security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Total Accounts</div>
            <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{stats.totalUsers}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Customers</div>
            <div className="text-2xl font-bold font-serif text-amber-800 mt-1">{stats.customersCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Administrators</div>
            <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{stats.adminsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-bold">Password Reset Required</div>
            <div className="text-2xl font-bold font-serif text-rose-700 mt-1">{stats.mustChangePasswordCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <Key className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-stone-600 font-bold">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Loading user accounts from Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 rounded-xl bg-stone-100 text-xs text-stone-800 font-bold hover:bg-stone-200"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Users className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No users found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-medium">
              {search
                ? `No user accounts matching "${search}".`
                : 'No users registered under this role filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800">
              <thead className="bg-stone-100/70 text-stone-600 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-4 px-6">User Profile</th>
                  <th className="py-4 px-4">Contact Info</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Security Status</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50 transition-colors group">
                    {/* User Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-900 font-serif shadow-xs">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            u.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 group-hover:text-amber-700">
                            {u.full_name}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">ID: {u.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-800 font-medium">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      {u.role === 'admin' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-bold uppercase tracking-wider w-fit">
                          Customer
                        </span>
                      )}
                    </td>

                    {/* Security */}
                    <td className="py-4 px-4">
                      {u.must_change_password ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3 text-rose-600" /> Reset Needed
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">● Active & Verified</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-stone-500 text-[11px] font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(u.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => fetchUserAddresses(u)}
                        className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-all"
                        title="Customer Addresses (Shipping / Billing)"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-all"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setPasswordResetUser(u);
                          setResetPasswordInput('Perfume2026!');
                        }}
                        className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-amber-700 transition-all"
                        title="Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-rose-600 transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADDRESSES MANAGEMENT MODAL */}
      {addressUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">Saved Addresses</h2>
                  <p className="text-xs text-amber-800 font-bold">{addressUser.full_name} ({addressUser.email})</p>
                </div>
              </div>
              <button onClick={() => setAddressUser(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Addresses List */}
            {loadingAddresses ? (
              <div className="p-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
                <p className="text-xs text-stone-500 font-medium">Loading saved addresses...</p>
              </div>
            ) : userAddresses.length === 0 && !isAddAddressOpen ? (
              <div className="p-8 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
                <Building className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-500 font-medium">No saved shipping/billing addresses for this customer.</p>
                <button
                  onClick={() => setIsAddAddressOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                >
                  + Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Customer Address Book ({userAddresses.length})
                  </h3>
                  {!isAddAddressOpen && (
                    <button
                      onClick={() => setIsAddAddressOpen(true)}
                      className="text-xs text-amber-800 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Address
                    </button>
                  )}
                </div>

                {userAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      addr.is_default
                        ? 'bg-stone-50 border-amber-300 shadow-sm'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold border border-amber-300">
                            DEFAULT SHIPPING
                          </span>
                        )}
                      </div>
                      <div className="text-stone-700 font-medium">{addr.street_address}</div>
                      <div className="text-stone-500 font-medium">
                        {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}
                      </div>
                      <div className="text-stone-500 text-[11px] font-mono">Phone: {addr.phone}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-500 hover:text-rose-600 transition-colors self-end sm:self-auto"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add Address Form */}
            {isAddAddressOpen && (
              <form onSubmit={handleCreateAddress} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h4 className="text-xs font-bold text-amber-800">Add Customer Address</h4>
                  <button type="button" onClick={() => setIsAddAddressOpen(false)} className="text-stone-400 hover:text-stone-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-800 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.full_name}
                      onChange={(e) => setAddressFormData({ ...addressFormData, full_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-800 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.phone}
                      onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.street_address}
                    onChange={(e) => setAddressFormData({ ...addressFormData, street_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.state}
                      onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.postal_code}
                      onChange={(e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="addr_default"
                    checked={addressFormData.is_default}
                    onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500 bg-neutral-950 border-neutral-800"
                  />
                  <label htmlFor="addr_default" className="text-xs text-neutral-300">
                    Set as default shipping & billing address
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Create New User</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Princess Noor Jahan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@maisonessence.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-neutral-100">Edit User Details</h2>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-100 focus:outline-none focus:border-amber-500/40"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-neutral-100">Reset User Password</h2>
                  <p className="text-[11px] text-amber-400">{passwordResetUser.email}</p>
                </div>
              </div>
              <button onClick={() => setPasswordResetUser(null)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">New Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <p className="text-[11px] text-neutral-400 bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                ⚠️ Resetting password will mark <code className="text-amber-300">must_change_password = true</code>. The user will be required to create a new password upon next sign in.
              </p>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-rose-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-neutral-100">Delete User Account</h3>
                <p className="text-xs text-rose-300 font-medium">{deletingUser.full_name} ({deletingUser.email})</p>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to delete this user? All associated saved addresses, wishlists, and cart items will be permanently removed.
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
