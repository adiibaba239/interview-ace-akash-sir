'use server';

/**
 * @fileOverview An AI agent to assess user answers against expected answers, providing a score,
 * strengths, and gaps for interview preparation.
 *
 * - assessUserAnswer - A function that handles the assessment process.
 * - AssessUserAnswerInput - The input type for the assessUserAnswer function.
 * - AssessUserAnswerOutput - The return type for the assessUserAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessUserAnswerInputSchema = z.object({
  question: z.string().describe('The interview question.'),
  userAnswer: z.string().describe('The user\u2019s answer to the question.'),
  expectedAnswer: z.string().optional().describe('The expected answer to the question, if available.'),
  role: z.string().describe('The role the user is interviewing for.'),
});
export type AssessUserAnswerInput = z.infer<typeof AssessUserAnswerInputSchema>;

const AssessUserAnswerOutputSchema = z.object({
  score: z.number().describe('A score (0-100) representing the quality of the user\u2019s answer.'),
  strengths: z.string().describe('A summary of the strengths of the user\u2019s answer.'),
  gaps: z.string().describe('A summary of the gaps or areas for improvement in the user\u2019s answer.'),
});
export type AssessUserAnswerOutput = z.infer<typeof AssessUserAnswerOutputSchema>;

export async function assessUserAnswer(input: AssessUserAnswerInput): Promise<AssessUserAnswerOutput> {
  return assessUserAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessUserAnswerPrompt',
  input: {schema: AssessUserAnswerInputSchema},
  output: {schema: AssessUserAnswerOutputSchema},
  prompt: `You are an AI interview coach. Your task is to assess a candidate\'s answer to an interview question.

      Here is the role the candidate is interviewing for: {{{role}}}

      Here is the interview question:
      {{question}}

      Here is the candidate\'s answer:
      {{userAnswer}}

      {% if expectedAnswer %}
      Here is the expected answer:
      {{expectedAnswer}}
      {% endif %}

      Provide a score (0-100), strengths, and gaps based on the candidate\'s answer. Be specific and constructive.

      Score:
      Strengths:
      Gaps:`,
});

const assessUserAnswerFlow = ai.defineFlow(
  {
    name: 'assessUserAnswerFlow',
    inputSchema: AssessUserAnswerInputSchema,
    outputSchema: AssessUserAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
