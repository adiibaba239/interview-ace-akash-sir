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
        prompt: `You are an expert career coach and learning specialist. Your task is to create a structured learning path for a user preparing for an interview.

First, analyze the provided role, company, and sample questions to identify the top 5-7 most critical skills (technical and soft).

Then, for each identified skill, provide a brief one-sentence description and a list of 2-3 high-quality, publicly accessible online resources (articles, tutorials, official documentation) for learning that skill.

Format the entire output in markdown.

**Input:**
Role: {{roleName}}
Company: {{companyName}}
Sample Questions:
{{#each questions}}- {{this}}\n{{/each}}

**Output Format Example:**

### Skill Name 1
A brief one-sentence description of the skill.
*   [Resource Title 1](https://example.com/link1)
*   [Resource Title 2](https://example.com/link2)

### Skill Name 2
A brief one-sentence description of the skill.
*   [Resource Title 1](https://example.com/link3)
*   [Resource Title 2](https://example.com/link4)

Generate the learning path based on the provided input.
`,
      });
      const {output} = await prompt(flowInput);
      return output!;
    }
  );

  return generateLearningPathsFlow(input);
}
