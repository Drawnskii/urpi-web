import { describe, expect, it } from 'vitest'

import type { ReadyMediaRef } from '@/features/chats/model/chat'
import {
  documentDetails,
  fileSize,
  linkStaleTime,
  mediaAspectRatio,
  mediaStateLabel,
  playbackTime,
} from '@/features/chats/model/message-media'

const FILE = { meta_media_id: 'm', mime_type: 'application/pdf', sha256: null, attempts: 1 }

function ready(size: number, mime_type = FILE.mime_type): ReadyMediaRef {
  return { ...FILE, mime_type, status: 'READY', key: 'tenants/t/chats/c/m.pdf', size, width: null, height: null }
}

describe('mediaStateLabel', () => {
  it('says a waiting or downloading file is downloading', () => {
    expect(mediaStateLabel({ ...FILE, status: 'PENDING', retry_at: null })).toBe('Downloading…')
    expect(mediaStateLabel({ ...FILE, status: 'DOWNLOADING' })).toBe('Downloading…')
  })

  it("says a failed file couldn't be downloaded, never why in the provider's terms", () => {
    expect(mediaStateLabel({ ...FILE, status: 'FAILED', failure: 'CHECKSUM_MISMATCH' })).toBe("Couldn't download this file")
  })
})

describe('fileSize', () => {
  it('rounds to whole kilobytes, never below 1, and to one decimal in megabytes', () => {
    expect(fileSize(183_204)).toBe('179 kB')
    expect(fileSize(200)).toBe('1 kB')
    expect(fileSize(3.5 * 1024 * 1024)).toBe('3.5 MB')
  })
})

describe('documentDetails', () => {
  it("names the kind by the file name's extension", () => {
    expect(documentDetails('Lista de precios.xlsx', ready(183_204))).toBe('XLSX · 179 kB')
  })

  it('names it by its type when the name has no extension, or none at all', () => {
    expect(documentDetails('Factura No. 12', ready(183_204))).toBe('PDF · 179 kB')
    expect(documentDetails(null, ready(183_204))).toBe('PDF · 179 kB')
  })

  it('says only the size for a type it has no name for', () => {
    expect(documentDetails(null, ready(183_204, 'application/octet-stream'))).toBe('179 kB')
  })
})

describe('mediaAspectRatio', () => {
  it("is the photo's own ratio", () => {
    expect(mediaAspectRatio(1280, 960)).toBeCloseTo(4 / 3)
  })

  it('crops very tall and very wide photos', () => {
    expect(mediaAspectRatio(500, 2000)).toBe(0.6)
    expect(mediaAspectRatio(3000, 500)).toBe(1.9)
  })

  it('is 4:3 when the size is unknown', () => {
    expect(mediaAspectRatio(null, 960)).toBeCloseTo(4 / 3)
  })
})

describe('linkStaleTime', () => {
  const fetchedAt = Date.parse('2026-11-21T15:00:00Z')

  it('keeps a link fresh until a minute before it expires', () => {
    expect(linkStaleTime('2026-11-21T15:10:00Z', fetchedAt)).toBe(9 * 60_000)
  })

  it('is 0 for a link fetched inside its last minute or after it', () => {
    expect(linkStaleTime('2026-11-21T15:00:30Z', fetchedAt)).toBe(0)
    expect(linkStaleTime('2026-11-21T14:59:00Z', fetchedAt)).toBe(0)
  })
})

describe('playbackTime', () => {
  it.each([
    [0, '0:00'],
    [7.9, '0:07'],
    [65, '1:05'],
    [754, '12:34'],
  ])('shows %s seconds as %s', (seconds, shown) => {
    expect(playbackTime(seconds)).toBe(shown)
  })
})
