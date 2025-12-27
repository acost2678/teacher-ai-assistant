import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let text = '';

    // Handle different file types
    if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      // Plain text files
      text = await file.text();
    } 
    else if (fileName.endsWith('.docx')) {
      // Word documents - use mammoth
      const mammoth = (await import('mammoth')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
    else if (fileName.endsWith('.doc')) {
      // Old Word format - try to extract as text
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Basic text extraction - may not work perfectly for all .doc files
      text = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    }
    else if (fileName.endsWith('.pdf')) {
      // PDF files - use pdf-parse
      const pdfParse = (await import('pdf-parse')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    }
    else {
      // Try to read as text anyway
      try {
        text = await file.text();
      } catch {
        return NextResponse.json({ 
          error: 'Unsupported file type. Please use .txt, .docx, .pdf, or .csv files.' 
        }, { status: 400 });
      }
    }

    // Clean up the text
    text = text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive blank lines
      .trim();

    return NextResponse.json({ text });

  } catch (error) {
    console.error('Error extracting text:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from file. Please try pasting the content instead.' },
      { status: 500 }
    );
  }
}

// Increase body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};