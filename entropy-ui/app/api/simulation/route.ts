import { NextResponse } from 'next/server';

export async function GET() {
  // This mimics the real-time output stream from "strategist.py"
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sequence = [
        { type: 'system', msg: '>> STRATEGIST_AGENT initiated.' },
        { type: 'system', msg: '>> Target Acquired: Docker Container [entropy_target_v1]' },
        { type: 'attacker', msg: '>> [ATTACKER.PY] Launching SQL Injection Vector...' },
        { type: 'attacker', msg: '!! CRITICAL FAILURE: /api/login returned 500. DB Dump successful.' },
        { type: 'strategist', msg: '>> Analysis: Unsanitized input detected in LoginController.java.' },
        { type: 'healer', msg: '>> [HEALER.PY] Engaging Gemini Neural Link...' },
        { type: 'gemini', msg: 'Context loaded. Generating secure PreparedStatement patch...' },
        { type: 'healer', msg: '>> Patch applied. Hot-swapping class files...' },
        { type: 'attacker', msg: '>> [ATTACKER.PY] Re-running attack...' },
        { type: 'success', msg: '>> ATTACK FAILED. System is now secure.' },
        { type: 'system', msg: '>> SEQUENCE COMPLETE. Updating Mission Report.' },
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i >= sequence.length) {
          clearInterval(interval);
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(JSON.stringify(sequence[i]) + '\n'));
        i++;
      }, 1200); // 1.2 second delay between steps
    }
  });

  return new NextResponse(stream);
}