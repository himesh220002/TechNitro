'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, Camera } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import GradientBackground from '@/components/GradientBackground'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function ProfilePage() {
    const supabase = createBrowserClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState('/Avatarpic.png')

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    })

    const [initialProfile, setInitialProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    })

    useEffect(() => {
        async function loadUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setUser(user)

                    // Load avatar from user metadata (priority) or localStorage or default
                    const savedAvatar = localStorage.getItem('userAvatar')
                    const initialAvatar = user.user_metadata?.avatar_url || savedAvatar || '/Avatarpic.png'
                    setAvatarUrl(initialAvatar)

                    const userProfile = {
                        name: user.user_metadata?.name || '',
                        email: user.email || '',
                        phone: user.user_metadata?.phone || '',
                        address: user.user_metadata?.address || '',
                        city: user.user_metadata?.city || '',
                        state: user.user_metadata?.state || '',
                        pincode: user.user_metadata?.pincode || ''
                    }
                    setProfile(userProfile)
                    setInitialProfile(userProfile)
                }
            } catch (error) {
                console.error('Error loading user:', error)
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [supabase])

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    name: profile.name,
                    phone: profile.phone,
                    address: profile.address,
                    city: profile.city,
                    state: profile.state,
                    pincode: profile.pincode
                }
            })

            if (error) throw error

            toast.success('Profile updated successfully!')
            setInitialProfile(profile) // Update initial profile after successful save
            setEditing(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile)

    const handleAvatarSelect = (url: string) => {
        setAvatarUrl(url)
        localStorage.setItem('userAvatar', url)
        // Dispatch event for Navbar to pick up
        window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { url } }))
        setShowAvatarModal(false)
        toast.success('Avatar updated!')
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size too large (max 5MB)')
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                handleAvatarSelect(base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    if (loading) {
        return (
            <GradientBackground>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center pt-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                </div>
            </GradientBackground>
        )
    }

    if (!user) {
        return (
            <GradientBackground>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center pt-24">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Not Logged In</h2>
                        <a href="/login" className="text-purple-400 hover:text-purple-300">
                            Please login to view your profile
                        </a>
                    </div>
                </div>
            </GradientBackground>
        )
    }

    return (
        <GradientBackground>
            <Navbar />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-12 pt-24 mt-0 sm:mt-20">
                <Breadcrumbs items={[{ label: 'Profile' }]} />
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 relative">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-700">
                                    <Image
                                        src={avatarUrl}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowAvatarModal(true)}
                                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer z-10"
                                >
                                    <Camera size={16} className="text-gray-700" />
                                </button>
                            </div>
                            <div className="text-center sm:text-left text-white">
                                <h1 className="text-2xl sm:text-3xl font-bold">{profile.name || 'User'}</h1>
                                <p className="text-purple-100 mt-1">{profile.email}</p>
                                <div className="flex items-center gap-2 mt-2 text-purple-100 text-sm justify-center sm:justify-start">
                                    <Calendar size={14} />
                                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Personal Information</h2>
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(false)
                                            setProfile(initialProfile) // Reset changes on cancel
                                        }}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !hasChanges}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        <span>{saving ? 'Saving...' : 'Save'}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                    <User size={14} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    disabled={!editing}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none opacity-50 cursor-not-allowed"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                    <Phone size={14} /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    disabled={!editing}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* PIN Code */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                    <MapPin size={14} /> PIN Code
                                </label>
                                <input
                                    type="text"
                                    value={profile.pincode}
                                    onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                                    disabled={!editing}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                    <MapPin size={14} /> Address
                                </label>
                                <textarea
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    disabled={!editing}
                                    rows={3}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">City</label>
                                <input
                                    type="text"
                                    value={profile.city}
                                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                    disabled={!editing}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* State */}
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">State</label>
                                <input
                                    type="text"
                                    value={profile.state}
                                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                                    disabled={!editing}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avatar Selection Modal */}
                {showAvatarModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Choose Avatar</h3>
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-3">Select from defaults</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            '/Avatarpic.png',
                                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
                                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
                                            'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
                                            'https://api.dicebear.com/7.x/bottts/svg?seed=Tech',
                                        ].map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAvatarSelect(url)}
                                                className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${avatarUrl === url ? 'border-purple-500 scale-110' : 'border-transparent hover:border-gray-600'
                                                    }`}
                                            >
                                                <Image src={url} alt={`Avatar ${i + 1}`} fill className="object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-800"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-gray-900 text-gray-500">Or upload your own</span>
                                    </div>
                                </div>

                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-xl cursor-pointer hover:bg-gray-800/50 hover:border-purple-500 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-8 h-8 mb-3 text-gray-400 group-hover:text-purple-400" />
                                        <p className="text-sm text-gray-400 group-hover:text-gray-300">Click to upload image</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </GradientBackground>
    )
}
