"use client";
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface Props {
  code: string;
}

export default function MermaidDiagram({ code }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    // 1. Initialize Mermaid configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark', // Fits your dashboard perfectly
      securityLevel: 'loose',
      fontFamily: 'monospace',
    });

    const renderDiagram = async () => {
      if (!code) return;

      // 2. Format the code: The database stores it as a single line with semicolons.
      // We must replace ';' with actual newlines '\n' for Mermaid to read it.
      const formattedCode = code.replace(/;/g, '\n');

      try {
        // 3. Generate a unique ID for this chart
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // 4. Ask Mermaid to draw the SVG
        const { svg } = await mermaid.render(id, formattedCode);
        setSvg(svg);
      } catch (error) {
        console.error("Failed to render diagram:", error);
        setSvg('<div class="text-red-500 text-xs p-4">Diagram Syntax Error</div>');
      }
    };

    renderDiagram();
  }, [code]);

  // 5. Render the result
  return (
    <div 
      ref={elementRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}