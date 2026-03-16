import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { studentName, parentName, emailType, tone, keyPoints, context, notes, uploadedContent, language } = await request.json();

    // Use keyPoints, context, or notes - whichever is provided
    const teacherNotes = keyPoints || context || notes || '';

    const isSpanish = language === 'es'

    const toneInstructions = isSpanish ? {
      "Cálido y Amigable": "Usa un tono cálido, amigable y alentador mientras te mantienes profesional. Sé accesible y cercano.",
      "Profesional": "Usa un tono profesional, claro y directo mientras te mantienes respetuoso.",
      "Alentador": "Usa un tono motivador y de apoyo. Enfócate en los aspectos positivos y el crecimiento.",
      "Preocupado pero Solidario": "Usa un tono que exprese preocupación genuina mientras te mantienes solidario y orientado a soluciones.",
      "Formal": "Usa un tono formal y oficial apropiado para asuntos serios.",
      // English fallbacks
      "Warm & Friendly": "Usa un tono cálido, amigable y alentador mientras te mantienes profesional.",
      "Professional": "Usa un tono profesional, claro y directo.",
      "Encouraging": "Usa un tono motivador y de apoyo.",
      "Concerned but Supportive": "Usa un tono que exprese preocupación genuina mientras te mantienes solidario.",
      "Formal": "Usa un tono formal y oficial.",
    } : {
      "Warm & Friendly": "Use a warm, friendly, and encouraging tone while remaining professional. Be personable and approachable.",
      "Professional": "Use a professional, businesslike tone that is clear and direct while remaining respectful.",
      "Encouraging": "Use an uplifting, encouraging tone that motivates and supports. Focus on positives and growth.",
      "Concerned but Supportive": "Use a tone that expresses genuine concern while remaining supportive and solution-focused. Be caring but direct about the issue.",
      "Formal": "Use a formal, official tone appropriate for documentation or serious matters.",
      "warm": "Use a warm, friendly, and encouraging tone while remaining professional.",
      "formal": "Use a professional, formal tone appropriate for official school communication.",
      "urgent": "Use a tone that conveys urgency and importance while remaining respectful.",
    }

    const emailTypeInstructions = isSpanish ? {
      "Actualización General": "Este es un correo de actualización general sobre el progreso del estudiante o las actividades del aula.",
      "Buenas Noticias": "Este correo comparte buenas noticias, logros o elogios sobre el estudiante. Sé celebratorio y específico.",
      "Preocupación de Conducta": "Este correo aborda una preocupación de conducta. Sé constructivo, enfócate en la conducta, no en el niño, e incluye un camino a seguir.",
      "Preocupación Académica": "Este correo aborda dificultades académicas. Sé solidario, ofrece recursos o próximos pasos e invita a la colaboración.",
      "Solicitud de Reunión": "Este correo solicita una reunión con el padre/madre. Sé claro sobre el propósito y ofrece opciones de horario flexibles.",
      "Seguimiento de Ausencia": "Este correo hace seguimiento a ausencias del estudiante. Sé atento, verifica el bienestar del estudiante y ofrece apoyo para ponerse al día.",
      "Recordatorio de Evento": "Este correo recuerda a los padres sobre un próximo evento. Incluye todos los detalles relevantes (fecha, hora, lugar).",
      // English fallbacks
      "General Update": "Este es un correo de actualización general.",
      "Positive News": "Este correo comparte buenas noticias sobre el estudiante.",
      "Behavior Concern": "Este correo aborda una preocupación de conducta.",
      "Academic Concern": "Este correo aborda dificultades académicas.",
      "Meeting Request": "Este correo solicita una reunión.",
      "Absence Follow-up": "Este correo hace seguimiento a ausencias.",
      "Event Reminder": "Este correo recuerda sobre un evento próximo.",
    } : {
      "General Update": "This is a general update about the student's progress or classroom activities.",
      "Positive News": "This email shares positive news, achievements, or praise about the student. Be celebratory and specific about accomplishments.",
      "Behavior Concern": "This email addresses a behavior concern. Be constructive, focus on the behavior not the child, and include a path forward.",
      "Academic Concern": "This email addresses academic struggles or concerns. Be supportive, offer resources or next steps, and invite collaboration.",
      "Meeting Request": "This email requests a meeting with the parent. Be clear about the purpose and offer flexible scheduling options.",
      "Absence Follow-up": "This email follows up on student absences. Be caring, check on the student's wellbeing, and offer support for catching up.",
      "Event Reminder": "This email reminds parents about an upcoming event. Include all relevant details (date, time, location, what to bring).",
    }

    let uploadedContentSection = "";
    if (uploadedContent && uploadedContent.trim()) {
      uploadedContentSection = `

Reference documents provided by teacher:
---
${uploadedContent.substring(0, 3000)}${uploadedContent.length > 3000 ? '\n...[content truncated]' : ''}
---
Use relevant information from these documents to support the email content.
`;
    }

    const languageInstruction = isSpanish
      ? `**IDIOMA: Escribe TODO el correo en español.** Usa español profesional y cálido apropiado para comunicaciones escolares.
- Usa "[Nombre del Estudiante]" en lugar de [Student Name]
- Usa "[Nombre del Padre/Madre]" en lugar de [Parent Name]  
- Usa "[Nombre del Maestro/a]" en lugar de [Teacher Name]`
      : `**IMPORTANT PRIVACY INSTRUCTION:**
- ALWAYS use "[Student Name]" as a placeholder for the student - NEVER use any actual name
- ALWAYS use "[Parent Name]" as a placeholder for the parent - NEVER use any actual name
- The teacher will replace these placeholders with real names after copying the email`

    const prompt = `You are an experienced teacher assistant helping to draft parent communications.
${uploadedContentSection}
Write an email to a parent about their child.

${languageInstruction}

**Email Type:** ${emailType}
${emailTypeInstructions[emailType] || ''}

**Teacher's Notes:** 
${teacherNotes}

**Instructions:**
- ${toneInstructions[tone] || (isSpanish ? 'Usa un tono cálido y profesional.' : toneInstructions["Warm & Friendly"])}
- Keep the email concise but thorough (3-5 paragraphs)
- Include a clear subject line at the top (format: ${isSpanish ? '"Asunto: ..."' : '"Subject: ..."'})
- Be professional and supportive
- For concerns, always include a constructive path forward
- End with an invitation for the parent to reach out with questions
- Sign off as ${isSpanish ? '"[Nombre del Maestro/a]"' : '"[Teacher Name]"'}

Write the email now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const emailContent = message.content[0].text;

    return Response.json({ email: emailContent });
  } catch (error) {
    console.error("Error generating email:", error);
    return Response.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}