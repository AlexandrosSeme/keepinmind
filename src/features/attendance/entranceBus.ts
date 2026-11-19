import type { EntranceLog } from "./types";

const CHANNEL = "km.entrances";

type Listener = (log: EntranceLog) => void;

const listeners = new Set<Listener>();

function emit(log: EntranceLog) {
  listeners.forEach((listener) => listener(log));
}

let channel: BroadcastChannel | null = null;

function bus(): BroadcastChannel | null {
  if (channel || typeof BroadcastChannel === "undefined") return channel;
  channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = (event: MessageEvent<EntranceLog>) => {
    if (event.data && typeof event.data.id === "number") emit(event.data);
  };
  return channel;
}

/** Tells every open staff view on this browser that an entrance was just saved. */
export function publishEntrance(log: EntranceLog) {
  emit(log);
  bus()?.postMessage(log);
}

export function subscribeEntrances(listener: Listener) {
  bus();
  listeners.add(listener);
  return () => listeners.delete(listener);
}
