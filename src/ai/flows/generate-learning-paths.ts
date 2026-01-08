'use server';

/**
 * @fileOverview Generates a structured learning path with topics and resources based on a role.
 *
 * - generateLearningPaths - A function that generates the learning path.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function generateLearningPaths(input: {
  roleName: string;
}) {
  const ResourceSchema = z.object({
    title: z.string().describe('The title of the learning resource.'),
    url: z.string().url().describe('The URL for the learning resource.'),
  });

  const SkillSchema = z.object({
    skill: z.string().describe('The name of the skill.'),
    description: z
      .string()
      .describe('A one-sentence description of the skill.'),
    resources: z
      .array(ResourceSchema)
      .describe('A list of 2-3 public online resources for learning the skill.'),
  });

  const GenerateLearningPathsOutputSchema = z.object({
    learningPath: z.array(SkillSchema).describe('An array of skills with descriptions and learning resources.')
  });

  const generateLearningPathsFlow = ai.defineFlow(
    {
      name: 'generateLearningPathsFlow',
      inputSchema: z.object({
        roleName: z.string(),
      }),
      outputSchema: GenerateLearningPathsOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.definePrompt({
        name: 'generateLearningPathsPrompt',
        input: {schema: z.any()},
        output: {schema: GenerateLearningPathsOutputSchema},
        prompt: `You are an expert career coach. Your task is to generate a structured learning path for a specific job role.

Identify the top 5-7 most critical skills required for this role.

For each skill, provide a concise one-sentence description and a list of 2-3 public online learning resources (like articles, tutorials, or official documentation).

Return the output as a JSON object that strictly adheres to the output schema.

**Role:** {{roleName}}
`,
      });
      const {output} = await prompt(flowInput);
      return output!;
    }
  );

  return generateLearningPathsFlow(input);
}
