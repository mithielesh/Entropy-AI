import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analysis from '@/models/Analysis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, cards, projectName } = body;

    // 1. STRICT AUTH CHECK
    // If the Python script sends data without a UserID, we reject it immediately.
    // This ensures "Lightning Users" never accidentally use DB resources.
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Guest scans are not saved.' }, 
        { status: 401 }
      );
    }

    if (!cards || cards.length === 0) {
      return NextResponse.json(
        { message: 'Invalid Data: No analysis cards provided.' }, 
        { status: 400 }
      );
    }

    await connectDB();

    // 2. CALCULATE ENTROPY SCORE (Optional: You can make Gemini do this later)
    // For now, let's say: More cards = Higher Entropy (Worse score)
    // Base score 100, minus 10 points per card.
    const calculatedEntropy = Math.max(0, 100 - (cards.length * 10));

    // 3. SAVE TO DATABASE
    const newAnalysis = await Analysis.create({
      userId,
      projectName: projectName || "Manual Analysis",
      entropyScore: calculatedEntropy, 
      cards
    });

    console.log(`[DB] Saved Scan ${newAnalysis._id} for User ${userId}`);

    return NextResponse.json(
      { message: 'Analysis saved successfully', id: newAnalysis._id },
      { status: 201 }
    );

  } catch (error) {
    console.error('[API] Upload Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}