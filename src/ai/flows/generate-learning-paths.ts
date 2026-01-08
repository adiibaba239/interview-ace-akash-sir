'use server';

/**
 * @fileOverview Generates a structured learning path with topics and resources based on a role, company, and questions.
 *
 * - generateLearningPaths - A function that generates the learning path.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function generateLearningPaths(input: {
  roleName: string;
  companyName: string;
  questions: string[];
}) {
  const GenerateLearningPathsInputSchema = z.object({
    roleName: z.string().describe('The name of the role the user is preparing for.'),
    companyName: z.string().describe('The name of the company.'),
    questions: z.array(z.string()).describe('A list of sample interview questions for the role.'),
  });

  const GenerateLearningPathsOutputSchema = z.object({
    learningPath: z.string().describe('A markdown-formatted learning path with topics and links to learning resources.'),
  });
  
  const generateLearningPathsFlow = ai.defineFlow(
    {
      name: 'generateLearningPathsFlow',
      inputSchema: GenerateLearningPathsInputSchema,
      outputSchema: GenerateLearningPathsOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.definePrompt({
        name: 'generateLearningPathsPrompt',
        input: {schema: GenerateLearningPathsInputSchema},
        output: {schema: GenerateLearningPathsOutputSchema},
        prompt: `You are an expert career coach. Based on the provided role, company, and sample questions, generate a structured learning path.

First, identify the top 5-7 most critical skills.

Then, for each skill, provide a one-sentence description and 2-3 public online resources (articles, tutorials, docs) for learning.

Format the entire output as a single markdown string.

**Role:** {{roleName}}
**Company:** {{companyName}}
**Sample Questions:**
{{#each questions}}- {{this}}\n{{/each}}
`,
      });
      const {output} = await prompt(flowInput);
      return output!;
    }
  );

  return generateLearningPathsFlow(input);
}
