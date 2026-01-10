import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analysis from '@/models/Analysis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, cards, projectName } = body;

    if (!userId || !cards) {
      return NextResponse.json({ message: 'Missing data' }, { status: 400 });
    }

    await connectDB();

    // Create the record
    const newAnalysis = await Analysis.create({
      userId,
      projectName: projectName || "Manual Scan",
      entropyScore: Math.floor(Math.random() * (95 - 70) + 70), // Mock score for now
      cards
    });

    return NextResponse.json(
      { message: 'Analysis saved', id: newAnalysis._id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}