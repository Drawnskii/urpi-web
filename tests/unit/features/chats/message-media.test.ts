import { describe, expect, it } from 'vitest'

import type { MediaRef } from '@/features/chats/model/chat'
import { mediaStateLabel } from '@/features/chats/model/message-media'

const FILE = { meta_media_id: 'm', mime_type: 'image/jpeg', sha256: null, attempts: 1 }

function ready(size: number): MediaRef {
  return { ...FILE, status: 'READY', key: 'tenants/t/chats/c/m.jpg', size, width: null, height: null }
}

describe('mediaStateLabel', () => {
  it('says a waiting or downloading file is downloading', () => {
    expect(mediaStateLabel({ ...FILE, status: 'PENDING', retry_at: null })).toBe('Downloading…')
    expect(mediaStateLabel({ ...FILE, status: 'DOWNLOADING' })).toBe('Downloading…')
  })

  it('says a received file was received, with its size', () => {
    expect(mediaStateLabel(ready(183_204))).toBe('Received · 179 kB')
    expect(mediaStateLabel(ready(3 * 1024 * 1024))).toBe('Received · 3 MB')
    expect(mediaStateLabel(ready(200))).toBe('Received · 1 kB')
  })

  it("says a failed file couldn't be downloaded, never why in the provider's terms", () => {
    expect(mediaStateLabel({ ...FILE, status: 'FAILED', failure: 'CHECKSUM_MISMATCH' })).toBe("Couldn't download this file")
  })
})
