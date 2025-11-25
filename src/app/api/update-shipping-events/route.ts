
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";
import type { CheckpointPatch, FullRouteCheckpoint, TransportMode } from "@/types/order";

export async function POST(req: Request) {
  try {
    const { id, event, fullReplace = false } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // 1) Fetch existing shippingEvents for the order
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("shippingEvents")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    type EventItem = {
      checkpointName?: string;
      location?: string;
      timestamp?: string;
      status?: string;
      received?: { timestamp: string } | null;
      arrived?: { timestamp: string } | null;
      departed?: { timestamp: string; mode?: string | null } | null;
      visible?: boolean;
      mode?: string;
      action?: "received" | "arrived" | "departed";
      [k: string]: unknown;
    };

    const currentEvents: EventItem[] = Array.isArray(order.shippingEvents)
      ? (order.shippingEvents as EventItem[])
      : [];

    let nextEvents: EventItem[] = [...currentEvents];

    // 2) Full replace with array
    if (fullReplace && Array.isArray(event)) {
      nextEvents = event as EventItem[];
    }
    // 3) Append array
    else if (Array.isArray(event) && !fullReplace) {
      nextEvents = [...nextEvents, ...(event as EventItem[])];
    }
    // 4) Single-object logic (patch/status/raw append)
    else if (event && typeof event === "object") {
      const e = event as EventItem;

      // a) Patch-like shape with checkpointName + action
      if (e.checkpointName && e.action) {
        const patch = e as CheckpointPatch;
        const idx = nextEvents.findIndex(
          (ev) =>
            ev &&
            (ev.checkpointName === patch.checkpointName ||
              ev.location === patch.checkpointName)
        );

        if (idx === -1) {
          const newCp: FullRouteCheckpoint = {
            checkpointName: patch.checkpointName!,
            visible: true,
          };
          if (patch.action === "received") newCp.received = { timestamp: patch.timestamp! };
          if (patch.action === "arrived") newCp.arrived = { timestamp: patch.timestamp! };
          if (patch.action === "departed")
            newCp.departed = { timestamp: patch.timestamp!, mode: patch.mode };

          nextEvents.push(newCp);
        } else {
          const target: EventItem = { ...nextEvents[idx] };

          if (!target.checkpointName && target.location) {
            target.checkpointName = target.location;
            if (target.timestamp && !target.received)
              target.received = { timestamp: target.timestamp };
          }

          if (patch.action === "received") target.received = { timestamp: patch.timestamp! };
          if (patch.action === "arrived") target.arrived = { timestamp: patch.timestamp! };
          if (patch.action === "departed")
            target.departed = { timestamp: patch.timestamp!, mode: patch.mode };

          nextEvents[idx] = target;
        }
      }
      // b) Status-key event (e.g., { status: "received", location: "City" })
      else if (e.status && (e.location || e.checkpointName)) {
        const checkpointName = (e.location || e.checkpointName) as string;

        let action: CheckpointPatch["action"] | null = null;
        const status = (e.status as string).toLowerCase();

        if (status.includes("received")) action = "received";
        else if (status.includes("arrived")) action = "arrived";
        else if (status.includes("depart") || status.includes("dispatch")) action = "departed";

        const patch: CheckpointPatch = {
          checkpointName,
          action: (action ?? "received") as CheckpointPatch["action"],
          timestamp: (e.timestamp as string) || new Date().toISOString(),
          mode: e.mode as TransportMode | undefined,
        };

        const idx = nextEvents.findIndex(
          (ev) =>
            ev &&
            (ev.checkpointName === patch.checkpointName ||
              ev.location === patch.checkpointName)
        );

        if (idx === -1) {
          const newCp: FullRouteCheckpoint = {
            checkpointName: patch.checkpointName!,
            visible: true,
          };
          if (patch.action === "received") newCp.received = { timestamp: patch.timestamp! };
          if (patch.action === "arrived") newCp.arrived = { timestamp: patch.timestamp! };
          if (patch.action === "departed")
            newCp.departed = { timestamp: patch.timestamp!, mode: patch.mode };
          nextEvents.push(newCp);
        } else {
          const target: EventItem = { ...nextEvents[idx] };

          if (!target.checkpointName && target.location) {
            target.checkpointName = target.location;
            if (target.timestamp && !target.received)
              target.received = { timestamp: target.timestamp };
          }

          if (patch.action === "received") target.received = { timestamp: patch.timestamp! };
          if (patch.action === "arrived") target.arrived = { timestamp: patch.timestamp! };
          if (patch.action === "departed")
            target.departed = { timestamp: patch.timestamp!, mode: patch.mode };

          nextEvents[idx] = target;
        }
      }
      // c) Raw object → append it
      else {
        nextEvents = [...nextEvents, e];
      }
    }

    // 5) Persist updated array
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({ shippingEvents: nextEvents })
      .eq("id", id)
      .select("shippingEvents")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update shipping events", details: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ shippingEvents: updated.shippingEvents });
  } catch (error) {
    console.error("❌ update-shipping-events error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
