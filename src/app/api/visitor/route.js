import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export async function POST() {
  try {
    const redis = new Redis(process.env.REDIS_URL);
    const updatedCount = await redis.incr('visitor_admission_count');

    return NextResponse.json({ count: updatedCount });
  }
  catch (error) {
    return NextResponse.json(
      { count: 0, error: 'Redis Error' },
      { status: 500 }
    );
  }
}
