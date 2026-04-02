import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()

  const correctPin = process.env.DISCOUNT_PIN

  if (!correctPin) {
    return NextResponse.json({ ok: false, message: 'PIN chưa được cấu hình' }, { status: 500 })
  }

  const ok = pin === correctPin
  return NextResponse.json({ ok })
}