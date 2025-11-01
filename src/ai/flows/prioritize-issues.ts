// Prioritize issues based on severity, frequency, and location.

'use server';

/**
 * @fileOverview AI tool that prioritizes reported issues.
 *
 * - prioritizeIssues - A function that prioritizes issues.
 * - PrioritizeIssuesInput - The input type for the prioritizeIssues function.
 * - PrioritizeIssuesOutput - The return type for the prioritizeIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeIssuesInputSchema = z.array(
  z.object({
    issueId: z.string().describe('Unique identifier for the issue.'),
    severity: z
      .enum(['low', 'medium', 'high'])
      .describe('Severity level of the issue.'),
    frequency: z
      .number()
      .int()
      .positive()
      .describe('Frequency of reports for the issue.'),
    location: z
      .string()
      .describe('Geographic location of the issue (e.g., address).'),
    description: z.string().optional().describe('A short description of the issue')
  })
);

export type PrioritizeIssuesInput = z.infer<typeof PrioritizeIssuesInputSchema>;

const PrioritizeIssuesOutputSchema = z.array(
  z.object({
    issueId: z.string().describe('Unique identifier for the issue.'),
    priorityScore: z
      .number()
      .describe('The calculated priority score for the issue.'),
    reason: z.string().describe('Explanation for the assigned priority score.'),
  })
);

export type PrioritizeIssuesOutput = z.infer<typeof PrioritizeIssuesOutputSchema>;

export async function prioritizeIssues(
  input: PrioritizeIssuesInput
): Promise<PrioritizeIssuesOutput> {
  return prioritizeIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeIssuesPrompt',
  input: {schema: PrioritizeIssuesInputSchema},
  output: {schema: PrioritizeIssuesOutputSchema},
  prompt: `You are a municipal administrator responsible for prioritizing civic issues based on their severity, frequency, and location.

  Given the following list of reported issues, calculate a priority score for each issue and provide a reason for the assigned score. The score should reflect the urgency and impact of resolving the issue.

  Issues:
  {{#each this}}
  - Issue ID: {{issueId}}
    Severity: {{severity}}
    Frequency: {{frequency}}
    Location: {{location}}
    Description: {{description}}
  {{/each}}

  Prioritize the issues considering these factors:

  - **Severity**: Higher severity issues should receive higher priority scores.
  - **Frequency**: Issues reported more frequently should receive higher priority scores.
  - **Location**: Issues affecting critical infrastructure or high-traffic areas should receive higher priority scores.

  Ensure that the output is a JSON array of objects, where each object contains the issueId, priorityScore, and reason for the assigned score.
  `,
});

const prioritizeIssuesFlow = ai.defineFlow(
  {
    name: 'prioritizeIssuesFlow',
    inputSchema: PrioritizeIssuesInputSchema,
    outputSchema: PrioritizeIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
