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

    if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      text = await file.text();
    } 
    else if (fileName.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
    else if (fileName.endsWith('.doc')) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      text = buffer.toString('utf8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    }
    else if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    }
    else {
      try {
        text = await file.text();
      } catch {
        return NextResponse.json({ 
          error: 'Unsupported file type. Please use .txt, .docx, .pdf, or .csv files.' 
        }, { status: 400 });
      }
    }

    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
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

