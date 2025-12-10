'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Bell, Lock, Globe, Moon, Sun, Shield, Mail, Smartphone } from 'lucide-react'
import { toast } from 'react-hot-toast'
import GradientBackground from '@/components/GradientBackground'
import Navbar from '@/components/Navbar'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function SettingsPage() {
    const supabase = createClientComponentClient()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Settings State
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        newsletter: true,
        darkMode: true,
        language: 'en',
        twoFactorAuth: false
    })

    useEffect(() => {
        async function loadUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                setUser(user)

                // Load settings from localStorage
                const saved = localStorage.getItem('userSettings')
                if (saved) {
                    setSettings(JSON.parse(saved))
                }
            } catch (error) {
                console.error('Error loading user:', error)
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [supabase])

    const updateSetting = (key: string, value: any) => {
        const updated = { ...settings, [key]: value }
        setSettings(updated)
        localStorage.setItem('userSettings', JSON.stringify(updated))
        toast.success('Settings updated')
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
                            Please login to access settings
                        </a>
                    </div>
                </div>
            </GradientBackground>
        )
    }

    return (
        <GradientBackground>
            <Navbar />
            <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-12 pt-24 mt-0 sm:mt-20">
                <Breadcrumbs items={[{ label: 'Settings' }]} />
                <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

                <div className="space-y-6">
                    {/* Notifications */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="text-purple-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Notifications</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <Mail size={16} /> Email Notifications
                                    </p>
                                    <p className="text-sm text-gray-400">Receive order updates via email</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-700'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.emailNotifications ? 'translate-x-6' : ''
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <Smartphone size={16} /> SMS Notifications
                                    </p>
                                    <p className="text-sm text-gray-400">Receive updates via SMS</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('smsNotifications', !settings.smsNotifications)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.smsNotifications ? 'bg-purple-600' : 'bg-gray-700'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.smsNotifications ? 'translate-x-6' : ''
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Order Updates</p>
                                    <p className="text-sm text-gray-400">Get notified about order status changes</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('orderUpdates', !settings.orderUpdates)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.orderUpdates ? 'bg-purple-600' : 'bg-gray-700'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.orderUpdates ? 'translate-x-6' : ''
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Promotions & Offers</p>
                                    <p className="text-sm text-gray-400">Receive promotional emails</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('promotions', !settings.promotions)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.promotions ? 'bg-purple-600' : 'bg-gray-700'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.promotions ? 'translate-x-6' : ''
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Newsletter</p>
                                    <p className="text-sm text-gray-400">Subscribe to our newsletter</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('newsletter', !settings.newsletter)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.newsletter ? 'bg-purple-600' : 'bg-gray-700'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.newsletter ? 'translate-x-6' : ''
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-purple-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Security</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <Lock size={16} /> Two-Factor Authentication
                                    </p>
                                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('twoFactorAuth', !settings.twoFactorAuth)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-purple-600' : 'bg-gray-700'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : ''
                                        }`} />
                                </button>
                            </div>

                            <button className="w-full sm:w-auto px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                                Change Password
                            </button>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="text-purple-400" size={24} />
                            <h2 className="text-xl font-bold text-white">Preferences</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-white font-medium mb-2 block flex items-center gap-2">
                                    {settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
                                    Theme
                                </label>
                                <select
                                    value={settings.darkMode ? 'dark' : 'light'}
                                    onChange={(e) => updateSetting('darkMode', e.target.value === 'dark')}
                                    className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="dark">Dark Mode</option>
                                    <option value="light">Light Mode</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-white font-medium mb-2 block">Language</label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => updateSetting('language', e.target.value)}
                                    className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिन्दी (Hindi)</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                            Delete Account
                        </button>
                    </div>
                </div>
            </main>
        </GradientBackground>
    )
}
