import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analysis from '@/models/Analysis'; // This imports your 'AnalysisFinal' model

export async function GET(req: Request) {
  try {
    // 1. Get User ID from the URL (e.g., /api/history?userId=123)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    await connectDB();

    // 2. Fetch scans (Newest first)
    // .select('-cards') means "Don't send the heavy card data yet, just the summary"
    // We will fetch the full details only when the user clicks a card.
    const history = await Analysis.find({ userId })
      .sort({ scanDate: -1 })
      .select('projectName scanDate entropyScore'); 

    return NextResponse.json(history, { status: 200 });

  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}