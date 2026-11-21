import type { MessagePayloads } from './chat'

// Where "View on map" goes: Meta's own url for a business location when it's https (it comes from
// the webhook, so never trusted as a javascript: or http: link), else the coordinates on Google Maps
export function locationUrl(location: MessagePayloads['LOCATION']): string {
  if (location.url?.startsWith('https://')) return location.url
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
}
