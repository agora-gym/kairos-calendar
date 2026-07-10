import { NextResponse } from 'next/server'

import { createEvent, listEvents } from '../../../lib/database'
import { parseEventRequest } from '../../../lib/events'
import { errorResponse } from '../../../lib/http'

export const dynamic = 'force-dynamic'

export const GET = (): NextResponse =>
  NextResponse.json({ events: listEvents() })

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const input = parseEventRequest(await request.json())
    return NextResponse.json({ event: createEvent(input) }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
