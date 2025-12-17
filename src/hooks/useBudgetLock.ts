import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export const useBudgetLock = (storageKey: string, initialBudget = 3 * 60 * 1000) => {
    const [isEditingEnabled, setIsEditingEnabled] = useState(false)
    const [awayBudget, setAwayBudget] = useState(initialBudget)

    // Helper to format mm:ss
    const formatTime = (ms: number) => {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000))
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // Heartbeat: Keep session alive while on page, preserving the CURRENT budget
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isEditingEnabled) {
            const updatePresistence = () => {
                const expiry = Date.now() + awayBudget
                localStorage.setItem(storageKey, expiry.toString())
            }
            // Update frequently to ensure minimal loss on crash/refresh
            updatePresistence()
            interval = setInterval(updatePresistence, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isEditingEnabled, awayBudget, storageKey])

    // Mount logic: Check validity and restore remaining budget
    useEffect(() => {
        const storedExpiry = localStorage.getItem(storageKey)
        if (storedExpiry) {
            const timeLeft = parseInt(storedExpiry) - Date.now()

            // Buffer: If > 2s left, restore session
            if (timeLeft > 2000) {
                setAwayBudget(timeLeft) // Restore the DRAINED budget
                setIsEditingEnabled(true)
                toast.success(`Edit session resumed. Away time left: ${formatTime(timeLeft)}`, { id: `${storageKey}-resumed` })
            } else {
                localStorage.removeItem(storageKey)
            }
        }
    }, [storageKey])

    const lock = () => {
        setIsEditingEnabled(false)
        localStorage.removeItem(storageKey)
        toast.success('Edits locked')
    }

    const unlock = (budget = initialBudget) => {
        setIsEditingEnabled(true)
        setAwayBudget(budget)
        toast.success('Edits unlocked. Timer only runs when you leave the page.')
    }

    return {
        isEditingEnabled,
        awayBudget,
        formatTime: () => formatTime(awayBudget),
        lock,
        unlock
    }
}
