'use server';

/**
 * @fileOverview Generates a study guide with learning resources and links for a given list of skills.
 *
 * - generateStudyGuide - A function that generates the study guide.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export async function generateStudyGuide(input: { skills: string[]; }) {
  const GenerateStudyGuideInputSchema = z.object({
    skills: z.array(z.string()).describe('The list of skills to generate a study guide for.'),
  });
  
  const GenerateStudyGuideOutputSchema = z.object({
    studyGuide: z.string().describe('A markdown-formatted study guide with topics and links to learning resources.'),
  });

  const generateStudyGuideFlow = ai.defineFlow(
    {
      name: 'generateStudyGuideFlow',
      inputSchema: GenerateStudyGuideInputSchema,
      outputSchema: GenerateStudyGuideOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.definePrompt({
        name: 'generateStudyGuidePrompt',
        input: {schema: GenerateStudyGuideInputSchema},
        output: {schema: GenerateStudyGuideOutputSchema},
        prompt: `You are an expert learning and development coach. Your goal is to generate a helpful study guide for a user trying to learn a set of skills for a job interview.

    Skills to learn:
    {{#each skills}}- {{this}}\n{{/each}}

    For each skill, provide a brief description and a list of 2-3 high-quality, publicly accessible online resources (articles, tutorials, documentation) to learn about it. Format the output in markdown.

    Example for a single skill:

    ### Skill Name
    A brief one-sentence description of the skill.
    *   [Resource Title 1](https://example.com/link1)
    *   [Resource Title 2](https://example.com/link2)

    Generate the study guide based on the provided skills.
    `,
      });
      const {output} = await prompt(flowInput);
      return output!;
    }
  );
  
  return generateStudyGuideFlow(input);
}
