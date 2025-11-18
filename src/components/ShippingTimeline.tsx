import { ShippingEvent } from '@/types/order'

type TransportIcon = {
  [key in 'train' | 'flight' | 'truck']: string
}

const transportIcons: TransportIcon = {
  train: '🚂',
  flight: '✈️',
  truck: '🚛'
}

interface ShippingTimelineProps {
  events?: ShippingEvent[]
  compact?: boolean
  horizontal?: boolean
}

export default function ShippingTimeline({ events = [], compact = false, horizontal = false }: ShippingTimelineProps) {
  if (!events.length) return null

  return (
    <div className={`relative ${compact ? 'py-1' : 'py-4'} ${horizontal ? 'flex gap-2 items-center' : ''}`}>
      {/* Timeline line */}
      <div className={`absolute ${horizontal ? 'left-0 right-0 top-1/2 h-0.5' : 'left-4 top-0 bottom-0 w-0.5'} bg-gray-600`} />
      
      {/* Events */}
      <div className={`${horizontal ? 'flex gap-4 items-center' : 'space-y-4'}`}>
        {events.map((event, index) => (
          <div key={index} className={`relative flex ${horizontal ? 'flex-col' : 'items-start'} gap-2 ${horizontal ? 'px-2' : 'ml-4'}`}>
            {/* Timeline dot */}
            <div className={`
              absolute ${horizontal ? 'top-1/2 -translate-y-1/2' : 'left-0 -translate-x-[5px]'} 
              w-2 h-2 rounded-full
              ${event.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
              ${event.visible ? 'opacity-100' : 'opacity-50'}
            `} />

            {/* Event details */}
            <div className={`
              ${horizontal ? 'min-w-[120px]' : 'ml-6'} p-2 rounded-lg
              ${event.status === 'active' 
                ? 'bg-green-900/20 border border-green-800' 
                : 'bg-gray-800/20 border border-gray-700'}
              ${event.visible ? 'opacity-100' : 'opacity-50'}
              ${compact ? 'p-1.5' : 'p-3'}
            `}>
              <div className="flex items-center gap-2">
                {event.mode && (
                  <span className="text-xl" title={event.mode}>
                    {transportIcons[event.mode]}
                  </span>
                )}
                <div>
                  <p className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
                    {event.location}
                  </p>
                  <p className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}