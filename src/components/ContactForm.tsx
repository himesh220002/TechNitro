import { useState, useEffect } from 'react'

type ContactInfo = {
  phone: string
  address: string
  pin: string
}

export default function ContactForm({
  onSave,
}: {
  onSave: (info: ContactInfo) => void
}) {
  const [form, setForm] = useState<ContactInfo>({ phone: '', address: '', pin: '' })
const [savedPhones, setSavedPhones] = useState<string[]>([])
const [savedAddresses, setSavedAddresses] = useState<string[]>([])
const [savedPins, setSavedPins] = useState<string[]>([])


  useEffect(() => {
  const phones = JSON.parse(localStorage.getItem('savedPhones') || '[]')
  const addresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]')
  const pins = JSON.parse(localStorage.getItem('savedPins') || '[]')

  Promise.resolve().then(() => {
    setSavedPhones(phones)
    setSavedAddresses(addresses)
    setSavedPins(pins)
  })
}, [])


  const isValid =
    /^\d{10}$/.test(form.phone) &&
    /^\d{6}$/.test(form.pin) &&
    form.address.trim().length > 5

  

 const saveContact = () => {
  const phone = form.phone.trim()
  const address = form.address.trim()
  const pin = form.pin.trim()

  const updatedPhones = savedPhones.includes(phone) ? savedPhones : [phone, ...savedPhones]
  const updatedAddresses = savedAddresses.includes(address) ? savedAddresses : [address, ...savedAddresses]
  const updatedPins = savedPins.includes(pin) ? savedPins : [pin, ...savedPins]

  localStorage.setItem('savedPhones', JSON.stringify(updatedPhones.slice(0, 4)))
  localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses.slice(0, 4)))
  localStorage.setItem('savedPins', JSON.stringify(updatedPins.slice(0, 4)))

  setSavedPhones(updatedPhones.slice(0, 4))
  setSavedAddresses(updatedAddresses.slice(0, 4))
  setSavedPins(updatedPins.slice(0, 4))

  onSave(form)
}





  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">📍 Contact Info</h2>
        <div className="border border-gray-700 rounded-lg p-5 space-y-6">
          {/* Phone Field */}
          <div className="space-y-1">
            <label className="block text-gray-500">Contact:</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full sm:flex-1 px-4 py-2 rounded bg-gray-800 text-white"
              />
              <div className="flex flex-wrap gap-2">
                {savedPhones.map((p, i) => (
                  <button
                    key={`phone-${i}`}
                    onClick={() => {
                      const updated = { ...form, phone: p }
                      setForm(updated)
                      onSave(updated)
                    }}
                    className="text-sm text-gray-500 hover:text-indigo-400 border rounded px-2 py-1"
                  >
                    {p}
                  </button>
                ))}

              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-1">
            <label className="block text-gray-500">Address:</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full sm:flex-1 px-4 py-2 rounded bg-gray-800 text-white"
              />
              <div className="flex flex-wrap gap-2 max-w-[350px]">
                {savedAddresses.map((a, i) => (
                  <button
                    key={`address-${i}`}
                    onClick={() => {
                      const updated = { ...form, address: a }
                      setForm(updated)
                      onSave(updated)
                    }}
                    className="text-sm text-gray-500 hover:text-indigo-400 border rounded px-2 py-1 max-w-[250px] break-words text-left"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pin Field */}
          <div className="space-y-1">
            <label className="block text-gray-500">Pin:</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="text"
                placeholder="PIN Code"
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value })}
                className="w-full sm:flex-1 px-4 py-2 rounded bg-gray-800 text-white"
              />
              <div className="flex flex-wrap gap-2">
                {savedPins.map((p, i) => (
                  <button
                    key={`pin-${i}`}
                    onClick={() => {
                      const updated = { ...form, pin: p }
                      setForm(updated)
                      onSave(updated)
                    }}
                    className="text-sm text-gray-500 hover:text-indigo-400 border rounded px-2 py-1"
                  >
                    {p}
                  </button>
                ))}


              </div>
            </div>
          </div>

          {/* Save & Clear Buttons */}
          <div className="flex flex-wrap gap-4 justify-between items-center pt-4">
            <button
              onClick={saveContact}
              disabled={!isValid}
              className={`px-6 py-2 rounded ${
                isValid
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              Save & Continue
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('savedPhones')
                localStorage.removeItem('savedAddresses')
                localStorage.removeItem('savedPins')
                setSavedPhones([])
                setSavedAddresses([])
                setSavedPins([])
              }}

              className="text-sm text-red-400 hover:text-red-600 underline"
            >
              Clear saved contacts
            </button>
          </div>
        </div>

    </div>
  )
}
