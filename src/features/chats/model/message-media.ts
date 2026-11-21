import type { MediaRef } from './chat'

const kilobytes = new Intl.NumberFormat('en', { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 0 })
const megabytes = new Intl.NumberFormat('en', { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 })

// The line under a file's card: where its download is. A failure's code stays out of the UI
export function mediaStateLabel(media: MediaRef): string {
  switch (media.status) {
    case 'READY':
      return `Received · ${fileSize(media.size)}`
    case 'FAILED':
      return "Couldn't download this file"
    default:
      return 'Downloading…'
  }
}

function fileSize(bytes: number): string {
  const kb = bytes / 1024
  return kb < 1024 ? kilobytes.format(Math.max(1, Math.round(kb))) : megabytes.format(kb / 1024)
}
