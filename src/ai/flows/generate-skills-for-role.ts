'use server';

/**
 * @fileOverview An AI agent to generate a list of required skills for a specific job role at a company.
 *
 * - generateSkillsForRole - A function that handles the skill generation process.
 * - GenerateSkillsInput - The input type for the generateSkillsForRole function.
 * - GenerateSkillsOutput - The return type for the generateSkillsForRole function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateSkillsInputSchema = z.object({
  roleName: z.string().describe('The name of the role the user is preparing for.'),
  companyName: z.string().describe('The name of the company.'),
});

export const GenerateSkillsOutputSchema = z.object({
  skills: z.array(z.string()).describe('A list of key skills required for the role.'),
});

export async function generateSkillsForRole(input: z.infer<typeof GenerateSkillsInputSchema>): Promise<z.infer<typeof GenerateSkillsOutputSchema>> {
  const generateSkillsFlow = ai.defineFlow(
    {
      name: 'generateSkillsFlow',
      inputSchema: GenerateSkillsInputSchema,
      outputSchema: GenerateSkillsOutputSchema,
    },
    async (input) => {
      const prompt = ai.definePrompt({
        name: 'generateSkillsPrompt',
        input: {schema: GenerateSkillsInputSchema},
        output: {schema: GenerateSkillsOutputSchema},
        prompt: `You are an expert career coach and hiring manager.
    Based on the provided role and company, identify and list the top 10 most important technical and soft skills required.

    Role: {{roleName}}
    Company: {{companyName}}

    Return only the list of skills.`,
      });
      const {output} = await prompt(input);
      return output!;
    }
  );

  return generateSkillsFlow(input);
}
