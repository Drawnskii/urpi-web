import { ChevronDownIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { useId, useRef, useState, type ChangeEvent } from 'react'

import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

import { playbackTime } from '../model/message-media'

interface AudioPlayerProps {
  src: string
  label: string // "Voice note" or "Audio": the controls' names for screen readers
  transcript: string | null
  onLoad: () => void
  onError: () => void
}

// The seek bar as WhatsApp draws it: a thin line, filled up to a round thumb in the primary color.
// The fill is a gradient set per render (style), over the track's own color
const SEEK_BAR = cn(
  'h-1 w-full appearance-none rounded-full bg-current/25',
  '[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
  '[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary',
)

// A voice note as WhatsApp draws it, inside the bubble: play beside the seek bar, under it the time
// (the length until it plays) and, for a voice note the server transcribed (MVP 3.4), the button
// that unfolds its transcript. The browser's own controls are a grey pill of their own
export function AudioPlayer({ src, label, transcript, onLoad, onError }: AudioPlayerProps) {
  const audio = useRef<HTMLAudioElement>(null)
  const transcriptId = useId()
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)

  function handleToggle() {
    const element = audio.current
    if (!element) return
    if (element.paused) void element.play()
    else element.pause()
  }

  function handleSeek(event: ChangeEvent<HTMLInputElement>) {
    const element = audio.current
    if (!element) return
    element.currentTime = Number(event.target.value)
    setPosition(element.currentTime)
  }

  function handleEnded() {
    setPlaying(false)
    setPosition(0)
  }

  const length = Number.isFinite(duration) ? duration : 0 // some recordings say Infinity until read whole
  const played = length > 0 ? (position / length) * 100 : 0

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          aria-label={`${playing ? 'Pause' : 'Play'} ${label.toLowerCase()}`}
          className="rounded-full"
        >
          {playing ? (
            <PauseIcon className="size-5 fill-current" aria-hidden="true" />
          ) : (
            <PlayIcon className="size-5 fill-current" aria-hidden="true" />
          )}
        </Button>
        <input
          type="range"
          min={0}
          max={length}
          step="any"
          value={position}
          onChange={handleSeek}
          aria-label={`${label} position`}
          aria-valuetext={`${playbackTime(position)} of ${playbackTime(length)}`}
          style={{ backgroundImage: `linear-gradient(to right, var(--primary) ${played}%, transparent ${played}%)` }}
          className={SEEK_BAR}
        />
        <div className="col-start-2 flex items-center justify-between gap-2 text-caption opacity-70">
          <span className="tabular-nums">{playbackTime(playing || position > 0 ? position : length)}</span>
          {transcript && (
            <Button
              variant="link"
              size="xs"
              onClick={() => setShowTranscript((open) => !open)}
              aria-expanded={showTranscript}
              aria-controls={transcriptId}
              className="h-auto gap-0.5 p-0 text-caption text-current"
            >
              Transcript
              <ChevronDownIcon
                data-icon="inline-end"
                className={cn('size-3.5 transition-transform', showTranscript && 'rotate-180')}
                aria-hidden="true"
              />
            </Button>
          )}
        </div>
      </div>
      {transcript && <VoiceTranscript text={transcript} id={transcriptId} hidden={!showTranscript} />}
      {/* Clients' recordings have no captions; a voice note's transcript is above */}
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={onLoad}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onError={onError}
      />
    </div>
  )
}

interface VoiceTranscriptProps {
  text: string
  id?: string
  hidden?: boolean
}

// What a voice note says, smaller than message text and set apart from it
export function VoiceTranscript({ text, id, hidden }: VoiceTranscriptProps) {
  return (
    <p id={id} hidden={hidden} className="text-caption text-muted-foreground italic whitespace-pre-wrap wrap-anywhere">
      {text}
    </p>
  )
}
