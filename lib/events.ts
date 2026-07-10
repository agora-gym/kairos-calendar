export type CalendarEvent = Readonly<{
  id: number
  title: string
  startsAt: string
  endsAt: string
  calendarId: string
}>

export type EventInput = Readonly<{
  title: string
  startsAt: string
  endsAt: string
  calendarId?: string
}>

export class EventValidationError extends Error {
  readonly fields: Readonly<Record<string, string>>

  constructor(fields: Readonly<Record<string, string>>) {
    super('Event validation failed')
    this.name = 'EventValidationError'
    this.fields = fields
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const parseEventRequest = (value: unknown): EventInput => {
  if (!isRecord(value)) {
    throw new EventValidationError({ request: 'Expected a JSON object.' })
  }
  const fields: Record<string, string> = {}
  for (const field of ['title', 'startsAt', 'endsAt'] as const) {
    if (typeof value[field] !== 'string')
      fields[field] = `${field} is required.`
  }
  if (value.calendarId !== undefined && typeof value.calendarId !== 'string') {
    fields.calendarId = 'calendarId must be a string.'
  }
  if (Object.keys(fields).length > 0) throw new EventValidationError(fields)
  return {
    title: value.title as string,
    startsAt: value.startsAt as string,
    endsAt: value.endsAt as string,
    ...(typeof value.calendarId === 'string'
      ? { calendarId: value.calendarId }
      : {}),
  }
}

export const parseEventPatch = (value: unknown): Partial<EventInput> => {
  if (!isRecord(value)) {
    throw new EventValidationError({ request: 'Expected a JSON object.' })
  }
  const patch: Partial<Record<keyof EventInput, string>> = {}
  const fields: Record<string, string> = {}
  for (const field of ['title', 'startsAt', 'endsAt', 'calendarId'] as const) {
    if (value[field] === undefined) continue
    if (typeof value[field] === 'string') patch[field] = value[field]
    else fields[field] = `${field} must be a string.`
  }
  if (Object.keys(fields).length > 0) throw new EventValidationError(fields)
  return patch
}

const validDate = (value: string): boolean =>
  value.length > 0 && !Number.isNaN(Date.parse(value))

export const parseEventInput = (
  input: EventInput,
): Omit<CalendarEvent, 'id'> => {
  const title = input.title.trim()
  const fields: Record<string, string> = {}
  if (title.length === 0) fields.title = 'Give the event a title.'
  if (title.length > 120) fields.title = 'Keep the title under 120 characters.'
  if (!validDate(input.startsAt)) fields.startsAt = 'Choose a valid start time.'
  if (!validDate(input.endsAt)) fields.endsAt = 'Choose a valid end time.'
  if (
    validDate(input.startsAt) &&
    validDate(input.endsAt) &&
    Date.parse(input.endsAt) <= Date.parse(input.startsAt)
  ) {
    fields.endsAt = 'End time must be after start time.'
  }
  if (Object.keys(fields).length > 0) throw new EventValidationError(fields)

  return {
    title,
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(),
    calendarId: input.calendarId?.trim() || 'personal',
  }
}
