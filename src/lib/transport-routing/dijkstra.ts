import { RouteEdge } from './types'

export function findBestRoute(
  graph: RouteEdge[],
  source: string,
  destination: string,
  optimizeBy: 'timeHr' | 'costPerKm' = 'timeHr'
): RouteEdge[] {
  const visited = new Set<string>()
  const queue: { city: string; path: RouteEdge[]; total: number }[] = [
    { city: source, path: [], total: 0 }
  ]

  while (queue.length > 0) {
    queue.sort((a, b) => a.total - b.total)
    const { city, path, total } = queue.shift()!

    if (city === destination) return path
    if (visited.has(city)) continue
    visited.add(city)

    for (const edge of graph.filter((e) => e.from === city)) {
      queue.push({
        city: edge.to,
        path: [...path, edge],
        total: total + edge[optimizeBy]
      })
    }
  }

  return []
}
