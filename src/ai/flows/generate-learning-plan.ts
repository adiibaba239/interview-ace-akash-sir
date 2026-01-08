'use server';

/**
 * @fileOverview Generates a topic-wise learning plan based on the user's weak areas identified during the assessment.
 *
 * - generateLearningPlan - A function that generates a learning plan.
 * - GenerateLearningPlanInput - The input type for the generateLearningPlan function.
 * - GenerateLearningPlanOutput - The return type for the generateLearningPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLearningPlanInputSchema = z.object({
  roleName: z.string().describe('The name of the role the user is preparing for.'),
  questions: z.array(z.string()).describe('The interview questions asked during the assessment.'),
  weakAreas: z.string().describe('The weak areas identified in the user assessment.'),
});
export type GenerateLearningPlanInput = z.infer<typeof GenerateLearningPlanInputSchema>;

const GenerateLearningPlanOutputSchema = z.object({
  learningPlan: z.string().describe('A topic-wise learning plan to address the identified weak areas.'),
});
export type GenerateLearningPlanOutput = z.infer<typeof GenerateLearningPlanOutputSchema>;

export async function generateLearningPlan(input: GenerateLearningPlanInput): Promise<GenerateLearningPlanOutput> {
  return generateLearningPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningPlanPrompt',
  input: {schema: GenerateLearningPlanInputSchema},
  output: {schema: GenerateLearningPlanOutputSchema},
  prompt: `You are an expert career coach. Your goal is to generate a personalized learning plan for the user based on their weak areas during a mock interview.

Role: {{roleName}}

Interview Questions:
{{#each questions}}- {{this}}\n{{/each}}

Weak Areas:
{{weakAreas}}

Based on the above information, generate a topic-wise learning plan to address the weak areas. The learning plan should be structured and easy to follow.
`,
});

const generateLearningPlanFlow = ai.defineFlow(
  {
    name: 'generateLearningPlanFlow',
    inputSchema: GenerateLearningPlanInputSchema,
    outputSchema: GenerateLearningPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
