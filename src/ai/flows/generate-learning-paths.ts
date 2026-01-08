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
        companyName: z.string(),
        questions: z.array(z.string()),
      }),
      outputSchema: GenerateLearningPathsOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.definePrompt({
        name: 'generateLearningPathsPrompt',
        input: {schema: z.any()},
        output: {schema: GenerateLearningPathsOutputSchema},
        prompt: `You are an expert career coach. Based on the provided role, company, and sample questions, generate a structured learning path.

First, identify the top 5-7 most critical skills for the role.

Then, for each skill, provide a one-sentence description and 2-3 public online resources (articles, tutorials, docs) for learning.

Return the output as a JSON object that satisfies the output schema.

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
