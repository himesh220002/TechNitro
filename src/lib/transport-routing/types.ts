export type TransportMode = 'flight' | 'train' | 'truck'

export type RouteEdge = {
  from: string
  to: string
  mode: TransportMode
  distanceKm: number
  timeHr: number
  costPerKm: number
}
