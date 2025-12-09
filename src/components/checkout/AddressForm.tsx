'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, User, Home, Save, Trash2, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SavedAddress {
    id: string
    accountName: string
    phone: string
    address: string
    pin: string
}

interface AddressFormProps {
    form: {
        accountName: string
        phone: string
        address: string
        pin: string
        paymentMethod: string
    }
    setForm: (form: any) => void
    isValid: boolean
}

export default function AddressForm({ form, setForm, isValid }: AddressFormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

    const validate = (field: string, value: string) => {
        let error = ''
        if (field === 'phone') {
            if (!/^\d{10}$/.test(value)) error = 'Phone must be 10 digits'
        }
        if (field === 'pin') {
            if (!/^\d{6}$/.test(value)) error = 'PIN must be 6 digits'
        }
        if (field === 'address') {
            if (value.length < 10) error = 'Address is too short'
        }
        if (field === 'accountName') {
            if (value.length < 3) error = 'Name is too short'
        }
        return error
    }

    const handleChange = (field: string, value: string) => {
        const error = validate(field, value)
        setErrors(prev => ({ ...prev, [field]: error }))
        setForm({ ...form, [field]: value })
        setSelectedAddressId(null) // Deselect when manually editing
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validate(field, form[field as keyof typeof form])
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Load saved addresses
    useEffect(() => {
        const saved = localStorage.getItem('savedAddresses')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // Validate and filter out blank/invalid addresses
                const validAddresses = Array.isArray(parsed)
                    ? parsed.filter((addr: SavedAddress) =>
                        addr &&
                        addr.accountName?.trim() &&
                        addr.phone?.trim() &&
                        addr.address?.trim() &&
                        addr.pin?.trim()
                    )
                    : []

                setSavedAddresses(validAddresses)

                // Update localStorage with cleaned data
                if (validAddresses.length !== parsed.length) {
                    localStorage.setItem('savedAddresses', JSON.stringify(validAddresses))
                }
            } catch (e) {
                console.error('Failed to parse saved addresses', e)
                // Clear corrupted data
                localStorage.removeItem('savedAddresses')
                setSavedAddresses([])
            }
        }
    }, [])

    const saveAddress = () => {
        if (!isValid) {
            toast.error('Please fill all fields correctly')
            return
        }

        const newAddress: SavedAddress = {
            id: Date.now().toString(),
            accountName: form.accountName,
            phone: form.phone,
            address: form.address,
            pin: form.pin
        }

        // Check if address already exists
        const exists = savedAddresses.some(addr =>
            addr.phone === newAddress.phone &&
            addr.address === newAddress.address &&
            addr.pin === newAddress.pin
        )

        if (exists) {
            toast.error('This address is already saved')
            return
        }

        // Limit to 5 addresses
        const updatedAddresses = [newAddress, ...savedAddresses].slice(0, 5)
        setSavedAddresses(updatedAddresses)
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses))
        setSelectedAddressId(newAddress.id)
        toast.success('Address saved successfully!')
    }

    const selectAddress = (address: SavedAddress) => {
        setForm({
            ...form,
            accountName: address.accountName,
            phone: address.phone,
            address: address.address,
            pin: address.pin
        })
        setSelectedAddressId(address.id)
        toast.success('Address selected')
    }

    const deleteAddress = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const updatedAddresses = savedAddresses.filter(addr => addr.id !== id)
        setSavedAddresses(updatedAddresses)
        localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses))
        if (selectedAddressId === id) {
            setSelectedAddressId(null)
        }
        toast.success('Address deleted')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">📍 Shipping Details</h2>
                <button
                    onClick={saveAddress}
                    disabled={!isValid}
                    className={`text-xs flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isValid
                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                        : 'text-gray-600 cursor-not-allowed'
                        }`}
                >
                    <Save size={14} /> Save for later
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="relative group">
                    <User className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder=" "
                        value={form.accountName}
                        onChange={(e) => handleChange('accountName', e.target.value)}
                        onBlur={() => handleBlur('accountName')}
                        className={`peer w-full pl-10 pr-4 py-3 bg-gray-900/50 border rounded-xl outline-none transition-all ${touched.accountName && errors.accountName
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-gray-700 focus:border-purple-500'
                            } text-white placeholder-transparent`}
                    />
                    <label className="absolute left-10 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-500 peer-focus:bg-black peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-1 cursor-text">
                        Full Name
                    </label>
                    {touched.accountName && errors.accountName && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.accountName}</p>
                    )}
                </div>

                {/* Phone */}
                <div className="relative group">
                    <Phone className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder=" "
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                        onBlur={() => handleBlur('phone')}
                        className={`peer w-full pl-10 pr-4 py-3 bg-gray-900/50 border rounded-xl outline-none transition-all ${touched.phone && errors.phone
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-gray-700 focus:border-purple-500'
                            } text-white placeholder-transparent`}
                    />
                    <label className="absolute left-10 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-500 peer-focus:bg-black peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-1 cursor-text">
                        Phone Number
                    </label>
                    {touched.phone && errors.phone && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>
                    )}
                </div>

                {/* Address */}
                <div className="relative group md:col-span-2">
                    <Home className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <textarea
                        placeholder=" "
                        rows={2}
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        onBlur={() => handleBlur('address')}
                        className={`peer w-full pl-10 pr-4 py-3 bg-gray-900/50 border rounded-xl outline-none transition-all resize-none ${touched.address && errors.address
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-gray-700 focus:border-purple-500'
                            } text-white placeholder-transparent`}
                    />
                    <label className="absolute left-10 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-500 peer-focus:bg-black peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-1 cursor-text">
                        Delivery Address
                    </label>
                    {touched.address && errors.address && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.address}</p>
                    )}
                </div>

                {/* PIN Code */}
                <div className="relative group">
                    <MapPin className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder=" "
                        maxLength={6}
                        value={form.pin}
                        onChange={(e) => handleChange('pin', e.target.value.replace(/\D/g, ''))}
                        onBlur={() => handleBlur('pin')}
                        className={`peer w-full pl-10 pr-4 py-3 bg-gray-900/50 border rounded-xl outline-none transition-all ${touched.pin && errors.pin
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-gray-700 focus:border-purple-500'
                            } text-white placeholder-transparent`}
                    />
                    <label className="absolute left-10 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-500 peer-focus:bg-black peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-1 cursor-text">
                        PIN Code
                    </label>
                    {touched.pin && errors.pin && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.pin}</p>
                    )}
                </div>
            </div>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Saved Addresses ({savedAddresses.length}/5)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedAddresses.map((addr, index) => (
                            <div
                                key={addr.id || index}
                                onClick={() => selectAddress(addr)}
                                className={`relative p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id
                                    ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500/50'
                                    : 'bg-gray-900/30 border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                                    }`}
                            >
                                {selectedAddressId === addr.id && (
                                    <div className="absolute top-2 right-2 text-purple-500">
                                        <Check size={16} />
                                    </div>
                                )}
                                <button
                                    onClick={(e) => deleteAddress(addr.id, e)}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
                                    aria-label="Delete address"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="space-y-1 pr-6">
                                    <p className="font-medium text-white text-sm">{addr.accountName}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Phone size={12} /> {addr.phone}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-start gap-1">
                                        <Home size={12} className="mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{addr.address}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <MapPin size={12} /> {addr.pin}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
