'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { changeMyPassword, updateMe } from '@/services/auth';
import Button from '@/components/ui/Button';
import { FiUser, FiMail, FiLock, FiLogOut, FiShoppingBag, FiMapPin, FiCheckCircle, FiAlertCircle, FiEdit3, FiPhone, FiSave, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, token, login, logout, isLoading, updateUser } = useAuth();
    const router = useRouter();

    // Update Profile State
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Security State
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');

    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setEditName(user.name);
            setEditEmail(user.email);
            setEditPhone(user.phone || '');
        }
    }, [user, isEditingInfo]);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        router.push('/signin');
        return null;
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setIsUpdatingProfile(true);
            setProfileMsg(null);
            const res = await updateMe({ name: editName, email: editEmail, phone: editPhone }, token);

            // Update local and context state
            updateUser({
                name: editName,
                email: editEmail,
                phone: editPhone
            });

            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditingInfo(false);
        } catch (err: any) {
            setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password !== rePassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        try {
            setIsUpdating(true);
            setMessage(null);
            const response = await changeMyPassword({ currentPassword, password, rePassword }, token);
            console.log('ProfilePage: Password change response:', response);

            // Important: RouteMisr API returns a new token after password change.
            // If we don't update it, all subsequent requests will fail with 401.
            if (response.token) {
                console.log('ProfilePage: Capturing new token post-password change');
                // The API usually returns user or we can keep current user info
                login(response.token, user);
                setMessage({ type: 'success', text: 'Password updated successfully! Your session has been refreshed.' });
            } else {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
            }

            setCurrentPassword('');
            setPassword('');
            setRePassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update password' });
            // If the error says we need to login again, we should trigger a logout
            if (err.message?.toLowerCase().includes('login again')) {
                setTimeout(() => logout(), 2000);
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#f8fafc]">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">My Account</h1>
                    <p className="text-gray-500 font-medium tracking-wide border-l-4 border-blue-600 pl-4">Manage your profile, security, and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile Card & Quick Links */}
                    <div className="lg:col-span-1 space-y-8">

                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                            <div className="flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform duration-500">
                                        <FiUser size={40} />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-gray-100 rounded-xl shadow-lg flex items-center justify-center text-blue-600">
                                        <FiCheckCircle size={14} />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h2>
                                <div className="space-y-1">
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 justify-center">
                                        <FiMail size={12} /> {user.email}
                                    </p>
                                    {user.phone && (
                                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 justify-center">
                                            <FiPhone size={12} /> {user.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-50 space-y-4">
                                <button
                                    onClick={() => setIsEditingInfo(!isEditingInfo)}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${isEditingInfo ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-100 opacity-90 hover:opacity-100'
                                        }`}
                                >
                                    {isEditingInfo ? <><FiX /> Cancel Editing</> : <><FiEdit3 /> Edit Information</>}
                                </button>

                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all duration-300 group"
                                >
                                    <FiLogOut className="group-hover:-translate-x-1 transition-transform" />
                                    Logout from Account
                                </button>
                            </div>
                        </div>

                        {/* Quick Links Bento */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/orders" className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:border-blue-200 transition-all duration-300 group">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                    <FiShoppingBag size={20} />
                                </div>
                                <p className="font-black text-gray-900 uppercase tracking-widest text-[10px]">My Orders</p>
                            </Link>
                            <Link href="/address" className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:border-blue-200 transition-all duration-300 group">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                    <FiMapPin size={20} />
                                </div>
                                <p className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Addresses</p>
                            </Link>
                        </div>

                    </div>

                    {/* Right Column: Security & Settings */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Profile Info Form Section (Conditional) */}
                        {isEditingInfo && (
                            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                        <FiEdit3 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Account Information</h3>
                                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Keep your contact details updated</p>
                                    </div>
                                </div>

                                {profileMsg && (
                                    <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 border-2 ${profileMsg.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                        : 'bg-red-50 border-red-100 text-red-700'
                                        }`}>
                                        {profileMsg.type === 'success' ? <FiCheckCircle size={24} /> : <FiAlertCircle size={24} />}
                                        <p className="font-bold text-sm tracking-wide">{profileMsg.text}</p>
                                    </div>
                                )}

                                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            required
                                            placeholder="Your Name"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all duration-300 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            required
                                            placeholder="email@example.com"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all duration-300 shadow-sm"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value)}
                                                placeholder="01xxxxxxxxx"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-4 pl-12 text-gray-900 font-bold outline-none transition-all duration-300 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-6 border-t border-gray-50 flex gap-4">
                                        <Button
                                            type="submit"
                                            isLoading={isUpdatingProfile}
                                            className="flex-1 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all duration-500 shadow-xl shadow-blue-100"
                                        >
                                            <span className="flex items-center gap-2"><FiSave /> Save Changes</span>
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingInfo(false)}
                                            className="px-8 py-5 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all duration-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Change Section */}
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900 shadow-inner">
                                    <FiLock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Security Center</h3>
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Update your password</p>
                                </div>
                            </div>

                            {message && (
                                <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 border-2 ${message.type === 'success'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : 'bg-red-50 border-red-100 text-red-700'
                                    }`}>
                                    {message.type === 'success' ? <FiCheckCircle size={24} /> : <FiAlertCircle size={24} />}
                                    <p className="font-bold text-sm tracking-wide">{message.text}</p>
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all duration-300 placeholder:text-gray-300 shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">New Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all duration-300 placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={rePassword}
                                            onChange={(e) => setRePassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all duration-300 placeholder:text-gray-300 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-50">
                                    <Button
                                        type="submit"
                                        isLoading={isUpdating}
                                        className="w-full md:w-auto px-12 py-5 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all duration-500 shadow-xl shadow-gray-200"
                                    >
                                        Protect & Update Account
                                    </Button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
