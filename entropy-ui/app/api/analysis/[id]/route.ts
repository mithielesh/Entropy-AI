import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Analysis from '@/models/Analysis';

// Update type: params is now a Promise
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    await connectDB();
    
    // --- CRITICAL FIX ---
    // You must await params before accessing 'id'
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Fetch the specific analysis by its MongoDB _id
    const analysis = await Analysis.findById(id);

    if (!analysis) {
      return NextResponse.json({ message: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(analysis, { status: 200 });

  } catch (error) {
    console.error("Report Fetch Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}