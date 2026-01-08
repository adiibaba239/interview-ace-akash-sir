'use server';

/**
 * @fileOverview Generates a multiple-choice question from a given context question.
 *
 * - generateMcq - A function that generates the MCQ.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function generateMcq(input: {
  question: string;
  role: string;
}) {
  const GenerateMcqInputSchema = z.object({
    question: z.string().describe('The interview question to base the MCQ on.'),
    role: z.string().describe('The role the user is interviewing for.'),
  });

  const GenerateMcqOutputSchema = z.object({
    mcqQuestion: z.string().describe('The generated multiple-choice question.'),
    options: z.array(z.string()).describe('An array of 4-5 potential answers.'),
    correctAnswer: z.string().describe('The correct answer from the options array.'),
  });
  
  const generateMcqFlow = ai.defineFlow(
    {
      name: 'generateMcqFlow',
      inputSchema: GenerateMcqInputSchema,
      outputSchema: GenerateMcqOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.definePrompt({
        name: 'generateMcqPrompt',
        input: { schema: GenerateMcqInputSchema },
        output: { schema: GenerateMcqOutputSchema },
        prompt: `You are an expert question designer for technical interviews.
        Your task is to create a single, clear multiple-choice question (MCQ) based on the provided interview question and role.
        
        Generate a relevant MCQ with 4-5 plausible options, one of which is definitively correct.
        The original question might be open-ended; your job is to distill a specific concept from it and frame it as an MCQ.

        **Role:** {{role}}
        **Original Question:** {{question}}
        
        Return the output as a JSON object that satisfies the output schema.
        `,
      });
      
      const {output} = await prompt(flowInput);
      return output!;
    }
  );

  return generateMcqFlow(input);
}
