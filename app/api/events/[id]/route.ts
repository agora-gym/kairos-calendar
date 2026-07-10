import { NextResponse } from 'next/server'

import { deleteEvent, findEvent, updateEvent } from '../../../../lib/database'
import { parseEventPatch } from '../../../../lib/events'
import { errorResponse, parseEventId } from '../../../../lib/http'

type RouteContext = Readonly<{ params: Promise<Readonly<{ id: string }>> }>

const idFrom = async (context: RouteContext): Promise<number | undefined> =>
  parseEventId((await context.params).id)

export const GET = async (
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> => {
  const id = await idFrom(context)
  const event = id ? findEvent(id) : undefined
  return event
    ? NextResponse.json({ event })
    : NextResponse.json({ error: 'Event not found.' }, { status: 404 })
}

export const PATCH = async (
  request: Request,
  context: RouteContext,
): Promise<NextResponse> => {
  try {
    const id = await idFrom(context)
    const event = id
      ? updateEvent(id, parseEventPatch(await request.json()))
      : undefined
    return event
      ? NextResponse.json({ event })
      : NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  } catch (error) {
    return errorResponse(error)
  }
}

export const DELETE = async (
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> => {
  const id = await idFrom(context)
  return id && deleteEvent(id)
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: 'Event not found.' }, { status: 404 })
}
