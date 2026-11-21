import type { MediaRef, ReadyMediaRef } from './chat'

const kilobytes = new Intl.NumberFormat('en', { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 0 })
const megabytes = new Intl.NumberFormat('en', { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 })

// Short names for the document types the backend keeps (media_files.py _DOCUMENTS)
const DOCUMENT_KINDS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
}

const EXTENSION = /\.([a-z0-9]{1,5})$/i

// A frame's width / height: very tall or wide photos are cropped in the bubble (the viewer shows them whole)
const MIN_ASPECT_RATIO = 0.6
const MAX_ASPECT_RATIO = 1.9
const UNKNOWN_ASPECT_RATIO = 4 / 3

// A link is fresh until this long before it expires: time to load the file with it
const LINK_EXPIRY_MARGIN_MS = 60_000

// The line under a file that isn't in the bucket yet. A failure's code stays out of the UI
export function mediaStateLabel(media: Exclude<MediaRef, ReadyMediaRef>): string {
  return media.status === 'FAILED' ? "Couldn't download this file" : 'Downloading…'
}

export function fileSize(bytes: number): string {
  const kb = bytes / 1024
  return kb < 1024 ? kilobytes.format(Math.max(1, Math.round(kb))) : megabytes.format(kb / 1024)
}

// "PDF · 179 kB": the kind from the file name's extension, else from its type, else only the size
export function documentDetails(filename: string | null, media: ReadyMediaRef): string {
  // A short run of letters and digits after the last dot: "Factura No. 12" has none
  const extension = EXTENSION.exec(filename ?? '')?.[1]?.toUpperCase()
  const kind = extension ?? DOCUMENT_KINDS[media.mime_type]
  return kind ? `${kind} · ${fileSize(media.size)}` : fileSize(media.size)
}

export function mediaAspectRatio(width: number | null, height: number | null): number {
  if (!width || !height) return UNKNOWN_ASPECT_RATIO
  return Math.min(MAX_ASPECT_RATIO, Math.max(MIN_ASPECT_RATIO, width / height))
}

// How long after fetchedAt a signed link stays fresh in the cache, in ms
export function linkStaleTime(expiresAt: string, fetchedAt: number): number {
  return Math.max(0, Date.parse(expiresAt) - LINK_EXPIRY_MARGIN_MS - fetchedAt)
}
