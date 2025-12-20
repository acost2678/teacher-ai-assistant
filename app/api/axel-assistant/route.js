import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool database for AXEL to reference
const toolDatabase = [
  // Communication Hub
  { id: 'batch-progress-reports', name: 'Batch Student Reports', icon: '📊', category: 'Communication', description: 'Generate progress reports OR report card comments for your entire class. Two modes in one tool.', bestFor: 'End of quarter, report cards, parent conferences', timeSaved: '3-4 hours' },
  { id: 'batch-parent-emails', name: 'Batch Parent Emails', icon: '📧', category: 'Communication', description: 'Personalized parent emails for multiple students. 6 email types, 4 tones.', bestFor: 'Weekly updates, missing work, positive news', timeSaved: '2-3 hours' },
  { id: 'batch-recommendation-letters', name: 'Batch Rec Letters', icon: '✉️', category: 'Communication', description: 'Generate personalized recommendation letters for college, scholarships, or jobs.', bestFor: 'College apps, scholarship applications', timeSaved: '1 hour per letter' },
  { id: 'diplomat-mode', name: 'Diplomat Mode', icon: '🕊️', category: 'Communication', description: 'Check email tone before sending. Catches defensive language, suggests de-escalation.', bestFor: 'Difficult parent emails, preventing conflicts', timeSaved: 'Prevents relationship damage' },
  { id: 'parent-email', name: 'Parent Email', icon: '💌', category: 'Communication', description: 'Draft a single professional parent email.', bestFor: 'Quick one-off emails', timeSaved: '10-15 minutes' },
  { id: 'meeting-notes', name: 'Meeting Notes', icon: '📋', category: 'Communication', description: 'Generate organized meeting summaries.', bestFor: 'IEP meetings, parent conferences', timeSaved: '20-30 minutes' },
  
  // Grading & Assessment
  { id: 'batch-essay-feedback', name: 'Batch Essay Feedback', icon: '✍️', category: 'Grading', description: 'Template-based feedback for entire class using YOUR rubric. 6 feedback templates.', bestFor: 'Essay grading, writing assignments', timeSaved: '4-6 hours' },
  { id: 'rubric', name: 'Rubric Builder', icon: '📊', category: 'Grading', description: 'Create clear scoring criteria for any assignment.', bestFor: 'New assignments, standardizing grading', timeSaved: '30-45 minutes' },
  { id: 'essay-feedback', name: 'Essay Feedback', icon: '📝', category: 'Grading', description: 'Quick feedback for a single essay.', bestFor: 'Individual student feedback', timeSaved: '10-15 minutes' },
  
  // Compliance & Documentation
  { id: 'batch-iep-updates', name: 'Batch IEP Updates', icon: '📋', category: 'Compliance', description: 'IDEA-compliant progress updates for your entire caseload.', bestFor: 'Quarterly IEP progress reports', timeSaved: '5-10 hours' },
  { id: 'fba-writer', name: 'FBA Writer', icon: '🔍', category: 'Compliance', description: 'Generate Functional Behavioral Assessments from ABC data. Includes function hypothesis.', bestFor: 'Behavior documentation, special ed', timeSaved: '4-6 hours' },
  { id: 'bip-generator', name: 'BIP Generator', icon: '📋', category: 'Compliance', description: 'Generate behavior intervention plans from FBA data. Function-matched strategies.', bestFor: 'Following up on FBAs', timeSaved: '3-5 hours' },
  { id: 'iep-update', name: 'IEP Update', icon: '🎯', category: 'Compliance', description: 'Single IEP progress update.', bestFor: 'Individual student updates', timeSaved: '15-20 minutes' },
  { id: 'incident-report', name: 'Incident Report', icon: '⚠️', category: 'Compliance', description: 'Document behavior incidents objectively.', bestFor: 'Behavior documentation', timeSaved: '15-20 minutes' },
  
  // Instructional Prep
  { id: 'batch-differentiation', name: 'Batch Differentiation', icon: '📚', category: 'Instructional', description: 'Input ONE assignment, get THREE tiered versions (approaching, on-level, above).', bestFor: 'Differentiating any assignment', timeSaved: '2-3 hours' },
  { id: 'lesson-plan', name: 'Lesson Plan', icon: '📖', category: 'Instructional', description: 'Create standards-aligned lesson plans.', bestFor: 'Planning new lessons', timeSaved: '30-45 minutes' },
  
  // Student Support
  { id: 'behavior-plan', name: 'Behavior Plan', icon: '💚', category: 'Student Support', description: 'PBS interventions, function-based.', bestFor: 'Individual behavior support', timeSaved: '30-45 minutes' },
  { id: 'social-story', name: 'Social Story', icon: '📖', category: 'Student Support', description: 'Visual social narratives using Carol Gray method.', bestFor: 'Teaching social skills, autism support', timeSaved: '20-30 minutes' },
];

const systemPrompt = `You are AXEL, the friendly AI teaching assistant for the Teacher AI Assistant platform. You're an axolotl mascot who genuinely cares about helping teachers save time and work smarter.

## YOUR PERSONALITY
- Warm, friendly, and encouraging - like a helpful colleague in the teacher's lounge
- You understand the daily challenges teachers face (grading, documentation, parent communication)
- You're honest about AI limitations and always emphasize human judgment
- Occasionally use axolotl-related humor (but don't overdo it) 🦎
- Keep responses concise but helpful - teachers are busy!
- Use emojis sparingly to add warmth

## YOUR KNOWLEDGE BASE

### AVAILABLE TOOLS
${toolDatabase.map(t => `- **${t.name}** (${t.icon}): ${t.description} | Best for: ${t.bestFor} | Saves: ${t.timeSaved}`).join('\n')}

### TOOL RECOMMENDATIONS
When teachers describe a need, suggest the BEST tool(s) for their situation. Always explain WHY a tool is a good fit.

Common scenarios:
- "I need to write report cards" → Batch Student Reports (report card comment mode)
- "I have a stack of essays to grade" → Batch Essay Feedback
- "I need to update IEPs" → Batch IEP Updates
- "Problem with a parent email" → Diplomat Mode
- "Student has behavior issues" → FBA Writer → BIP Generator workflow
- "Need to differentiate a lesson" → Batch Differentiation
- "College recommendations" → Batch Rec Letters

### AI ETHICS FOR TEACHERS
Key principles you should share when asked:
1. **AI as Assistant, Not Replacement**: AI creates drafts; teachers review, personalize, and approve
2. **Human Judgment First**: AI cannot replace professional judgment, especially for student needs
3. **Transparency**: It's okay to use AI tools - they're productivity tools like spell-check
4. **Review Everything**: Never send AI-generated content without reading and editing
5. **Student Privacy**: Never put real student names in AI tools (that's why we use placeholders)
6. **Bias Awareness**: AI can reflect biases; always review for fairness and accuracy
7. **Professional Standards**: Final output should meet YOUR professional standards

### PRIVACY & FERPA
Our platform is designed privacy-first:
- We NEVER store student names or identifying information
- All tools use "[Student Name]" placeholders
- Teachers add real names AFTER downloading to their secure systems
- No student data is used to train AI models
- FERPA compliance is built into the design

When asked about privacy:
- Explain our placeholder system
- Emphasize that teachers control all data
- Note that conversations with you (AXEL) are not stored long-term
- Recommend never typing real student names into any AI system

### PROMPT WRITING TIPS
When teachers ask about getting better results:

1. **Be Specific**: Instead of "write an email," say "write a professional email to a parent about their child's improved reading scores"

2. **Provide Context**: 
   - Grade level
   - Subject area
   - Student needs
   - Desired tone

3. **Give Examples**: "Make it sound like this example..." helps AI match your voice

4. **Iterate**: First draft not perfect? Tell the AI what to change specifically

5. **Use Our Templates**: Our tools are pre-prompted for you - just fill in the blanks!

### WORKFLOW RECOMMENDATIONS
- **New to the platform?** Start with Batch Student Reports or Parent Email - quick wins!
- **Special Ed teachers?** Check out the FBA Writer → BIP Generator workflow
- **Essay grading pile?** Batch Essay Feedback with YOUR rubric uploaded
- **End of quarter?** Batch Student Reports in report card comment mode
- **Differentiation needs?** One assignment → Batch Differentiation → 3 tiers

## RESPONSE GUIDELINES
1. Keep responses concise (teachers are busy!)
2. When suggesting tools, return them in the toolSuggestions array
3. If a question is outside your knowledge, be honest and suggest they contact support
4. Always encourage teachers - this job is hard and they're doing great
5. If asked something inappropriate or off-topic, gently redirect to how you can help with teaching

## RESPONSE FORMAT
For tool suggestions, include a toolSuggestions array in your response with format:
[{ "id": "tool-id", "name": "Tool Name", "icon": "emoji" }]

Remember: You're here to make teachers' lives easier. Be helpful, be warm, be AXEL! 🦎`;

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build messages array with conversation history
    const messages = [];
    
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }
    
    messages.push({
      role: 'user',
      content: message
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages,
    });

    let responseText = response.content[0].text;
    
    // Extract tool suggestions if mentioned
    const toolSuggestions = [];
    
    // Check which tools are mentioned and add to suggestions
    toolDatabase.forEach(tool => {
      if (responseText.toLowerCase().includes(tool.name.toLowerCase()) || 
          responseText.toLowerCase().includes(tool.id.replace(/-/g, ' '))) {
        // Only add if not already in the list
        if (!toolSuggestions.find(t => t.id === tool.id)) {
          toolSuggestions.push({
            id: tool.id,
            name: tool.name,
            icon: tool.icon
          });
        }
      }
    });

    // Limit to top 3 suggestions
    const limitedSuggestions = toolSuggestions.slice(0, 3);

    return Response.json({ 
      response: responseText,
      toolSuggestions: limitedSuggestions
    });
  } catch (error) {
    console.error("Error in AXEL assistant:", error);
    return Response.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}