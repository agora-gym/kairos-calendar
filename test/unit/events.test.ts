import { describe, expect, it } from 'vitest'

import {
  EventValidationError,
  parseEventInput,
  parseEventPatch,
  parseEventRequest,
} from '../../lib/events'

const valid = {
  title: 'Planning',
  startsAt: '2026-07-09T13:00:00.000Z',
  endsAt: '2026-07-09T14:00:00.000Z',
}

describe('event validation', () => {
  it('normalizes a valid event', () => {
    expect(parseEventInput(valid)).toEqual({ ...valid, calendarId: 'personal' })
  })

  it('trims titles and calendar ids', () => {
    expect(
      parseEventInput({ ...valid, title: '  Focus  ', calendarId: ' work ' }),
    ).toMatchObject({
      title: 'Focus',
      calendarId: 'work',
    })
  })

  it('rejects blank titles', () => {
    expect(() => parseEventInput({ ...valid, title: ' ' })).toThrow(
      EventValidationError,
    )
  })

  it('rejects malformed dates', () => {
    expect(() => parseEventInput({ ...valid, startsAt: 'tomorrow' })).toThrow(
      'Event validation failed',
    )
  })

  it('rejects zero-duration events', () => {
    expect(() => parseEventInput({ ...valid, endsAt: valid.startsAt })).toThrow(
      'Event validation failed',
    )
  })

  it('rejects an end before its start', () => {
    expect(() =>
      parseEventInput({ ...valid, endsAt: '2026-07-09T12:00:00.000Z' }),
    ).toThrow('Event validation failed')
  })

  it('rejects missing JSON fields before domain validation', () => {
    expect(() => parseEventRequest({ title: 'Incomplete' })).toThrow(
      EventValidationError,
    )
  })

  it('accepts typed partial updates', () => {
    expect(parseEventPatch({ title: 'Renamed' })).toEqual({ title: 'Renamed' })
  })

  it('rejects non-string partial updates', () => {
    expect(() => parseEventPatch({ title: 42 })).toThrow(EventValidationError)
  })
})
