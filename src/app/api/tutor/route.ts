import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TutorApiRequest, TutorResponse } from '@/lib/types/tutor';
import { buildSystemPrompt } from '@/lib/prompts/system-prompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const TUTOR_TOOL = {
  name: 'respond_to_student',
  description: 'Respond to the student with spoken dialogue and optional whiteboard commands',
  input_schema: {
    type: 'object' as const,
    required: ['message', 'whiteboard', 'expectsResponse'],
    properties: {
      message: {
        type: 'string',
        description: 'The spoken response (natural English, no LaTeX symbols). 2-4 sentences max.',
      },
      whiteboard: {
        type: 'array',
        description: 'Whiteboard commands to display while speaking',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['equation', 'graph', 'step', 'clear', 'annotation'],
            },
            latex: { type: 'string' },
            label: { type: 'string' },
            highlight: { type: 'boolean' },
            spec: {
              type: 'object',
              properties: {
                functions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      expression: { type: 'string' },
                      color: { type: 'string' },
                      label: { type: 'string' },
                      style: { type: 'string', enum: ['solid', 'dashed'] },
                    },
                    required: ['expression'],
                  },
                },
                domain: { type: 'array', items: { type: 'number' } },
                range: { type: 'array', items: { type: 'number' } },
                points: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      x: { type: 'number' },
                      y: { type: 'number' },
                      label: { type: 'string' },
                      color: { type: 'string' },
                    },
                    required: ['x', 'y'],
                  },
                },
                animations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['tangent_line', 'approaching_point', 'area_accumulation'] },
                      at: { type: 'number' },
                      from: { type: 'number' },
                      to: { type: 'number' },
                      steps: { type: 'number' },
                    },
                    required: ['type'],
                  },
                },
              },
            },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  latex: { type: 'string' },
                  explanation: { type: 'string' },
                },
                required: ['label'],
              },
            },
            title: { type: 'string' },
            text: { type: 'string' },
            color: { type: 'string', enum: ['blue', 'green', 'amber', 'red'] },
          },
          required: ['type'],
        },
      },
      errorAnalysis: {
        type: 'object',
        description: 'Error analysis when student makes a mistake',
        properties: {
          category: {
            type: 'string',
            enum: [
              'arithmetic', 'algebraic_manipulation', 'conceptual_misunderstanding',
              'sign_error', 'order_of_operations', 'incomplete_solution',
              'notation_confusion', 'application_error',
            ],
          },
          description: { type: 'string' },
          misconception: { type: 'string' },
          severity: { type: 'string', enum: ['minor', 'moderate', 'major'] },
        },
        required: ['category', 'description', 'severity'],
      },
      topicUpdate: {
        type: 'object',
        description: 'Topic mastery update based on observed understanding',
        properties: {
          topicId: { type: 'string' },
          delta: { type: 'number' },
          reason: { type: 'string' },
        },
        required: ['topicId', 'delta', 'reason'],
      },
      expectsResponse: {
        type: 'boolean',
        description: 'Whether the tutor is waiting for the student to respond',
      },
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TutorApiRequest;
    const { messages, mode, difficulty, currentTopicId, studentWeaknesses } = body;

    const topicName = currentTopicId; // Will be resolved to name on client side
    const systemPrompt = buildSystemPrompt(mode, difficulty, topicName, studentWeaknesses);

    // Convert our messages to Anthropic format
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role === 'student' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: [TUTOR_TOOL],
      tool_choice: { type: 'tool' as const, name: 'respond_to_student' },
    });

    // Extract the tool use from the response
    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('No tool use in response');
    }

    const tutorResponse = toolUse.input as TutorResponse;

    return NextResponse.json(tutorResponse);
  } catch (error) {
    console.error('Tutor API error:', error);
    return NextResponse.json(
      { error: 'Failed to get tutor response' },
      { status: 500 }
    );
  }
}
