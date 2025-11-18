// src/app/api/update-shipping-events/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { CheckpointPatch, FullRouteCheckpoint, TransportMode } from '@/types/order'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  const { id, event, fullReplace = false } = await req.json()

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id } })

  type EventItem = {
    checkpointName?: string
    location?: string
    timestamp?: string
    status?: string
    received?: { timestamp: string } | null
    arrived?: { timestamp: string } | null
    departed?: { timestamp: string; mode?: string | null } | null
    visible?: boolean
    mode?: string
    [k: string]: unknown
  }

  const currentEvents: EventItem[] = Array.isArray(order?.shippingEvents) ? (order!.shippingEvents as EventItem[]) : []

  let nextEvents: EventItem[] = [...currentEvents]

  if (fullReplace && Array.isArray(event)) {
    nextEvents = event
  } else if (Array.isArray(event) && !fullReplace) {
    nextEvents = [...nextEvents, ...event]
  } else if (event && typeof event === 'object') {
  const e = event as Record<string, unknown>

    if (e.checkpointName && e.action) {
      const patch = e as CheckpointPatch
      const idx = nextEvents.findIndex((ev) => ev && (ev.checkpointName === patch.checkpointName || ev.location === patch.checkpointName))

      if (idx === -1) {
        const newCp: FullRouteCheckpoint = { checkpointName: patch.checkpointName, visible: true }
        if (patch.action === 'received') newCp.received = { timestamp: patch.timestamp }
        if (patch.action === 'arrived') newCp.arrived = { timestamp: patch.timestamp }
        if (patch.action === 'departed') newCp.departed = { timestamp: patch.timestamp, mode: patch.mode }
        nextEvents.push(newCp)
      } else {
        const target: EventItem = { ...(nextEvents[idx] || {}) }
        if (!target.checkpointName && target.location) {
          target.checkpointName = target.location
          if (target.timestamp && !target.received) target.received = { timestamp: target.timestamp }
        }
        if (patch.action === 'received') target.received = { timestamp: patch.timestamp }
        if (patch.action === 'arrived') target.arrived = { timestamp: patch.timestamp }
        if (patch.action === 'departed') target.departed = { timestamp: patch.timestamp, mode: patch.mode as string }
        nextEvents[idx] = target
      }
    } else if (e.status && (e.location || e.checkpointName)) {
      const checkpointName = e.location || e.checkpointName
  let action: CheckpointPatch['action'] | null = null
      const status = ((e.status as string) || '').toLowerCase()
      if (status.includes('received')) action = 'received'
      else if (status.includes('dispatched') || status.includes('depart')) action = 'departed'
      else if (status.includes('arrived')) action = 'arrived'

      const patch: CheckpointPatch = {
        checkpointName: checkpointName as string,
        action: (action ?? 'received') as CheckpointPatch['action'],
        timestamp: (e.timestamp as string) || new Date().toISOString(),
  mode: (e.mode as unknown as TransportMode | undefined),
      }

      const idx = nextEvents.findIndex((ev) => ev && (ev.checkpointName === patch.checkpointName || ev.location === patch.checkpointName))
      if (idx === -1) {
        const newCp: FullRouteCheckpoint = { checkpointName: patch.checkpointName, visible: true }
        if (patch.action === 'received') newCp.received = { timestamp: patch.timestamp }
        if (patch.action === 'arrived') newCp.arrived = { timestamp: patch.timestamp }
        if (patch.action === 'departed') newCp.departed = { timestamp: patch.timestamp, mode: patch.mode }
        nextEvents.push(newCp)
      } else {
        const target: EventItem = { ...(nextEvents[idx] || {}) }
        if (!target.checkpointName && target.location) {
          target.checkpointName = target.location
          if (target.timestamp && !target.received) target.received = { timestamp: target.timestamp }
        }
        if (patch.action === 'received') target.received = { timestamp: patch.timestamp }
        if (patch.action === 'arrived') target.arrived = { timestamp: patch.timestamp }
        if (patch.action === 'departed') target.departed = { timestamp: patch.timestamp, mode: patch.mode as string }
        nextEvents[idx] = target
      }
    } else {
      nextEvents = [...nextEvents, e]
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
  // prisma expects Json; cast the events to Prisma.JsonValue
  shippingEvents: nextEvents as unknown as Prisma.InputJsonValue,
    },
  })

  return NextResponse.json({ shippingEvents: updated.shippingEvents })
}
