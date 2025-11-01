'use server';

/**
 * @fileOverview Summarizes similar issue reports based on keywords in a new report.
 *
 * - summarizeIssues - A function that summarizes similar issues.
 * - SummarizeIssuesInput - The input type for the summarizeIssues function.
 * - SummarizeIssuesOutput - The return type for the summarizeIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIssuesInputSchema = z.object({
  reportText: z
    .string()
    .describe('The text content of the issue report to summarize.'),
  keywords: z
    .string()
    .describe('Keywords extracted from the issue report to find similar issues.'),
});
export type SummarizeIssuesInput = z.infer<typeof SummarizeIssuesInputSchema>;

const SummarizeIssuesOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of similar issues based on the keywords provided in the input.'
    ),
});
export type SummarizeIssuesOutput = z.infer<typeof SummarizeIssuesOutputSchema>;

export async function summarizeIssues(
  input: SummarizeIssuesInput
): Promise<SummarizeIssuesOutput> {
  return summarizeIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIssuesPrompt',
  input: {schema: SummarizeIssuesInputSchema},
  output: {schema: SummarizeIssuesOutputSchema},
  prompt: `You are a municipal administrator tasked with summarizing similar issue reports.

  Based on the keywords extracted from a new issue report, provide a concise summary of recurring problems across different locations. Use the following information to generate the summary.

  Keywords: {{{keywords}}}
  Report Text: {{{reportText}}}

  Summary:`, // Provide clear instructions for the prompt. Ensure it asks for a summary.
});

const summarizeIssuesFlow = ai.defineFlow(
  {
    name: 'summarizeIssuesFlow',
    inputSchema: SummarizeIssuesInputSchema,
    outputSchema: SummarizeIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
