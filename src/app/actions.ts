'use server';

import * as xlsx from 'xlsx';
import { assessUserAnswer, AssessUserAnswerInput, AssessUserAnswerOutput } from '@/ai/flows/assess-user-answer';
import { generateLearningPlan, GenerateLearningPlanInput } from '@/ai/flows/generate-learning-plan';
import type { ExcelData, Question } from '@/lib/types';

// Helper to normalize column headers
const normalizeHeader = (header: string) => header.trim().toLowerCase();

export async function parseExcelFile(
  formData: FormData
): Promise<{ data?: ExcelData; error?: string }> {
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { error: 'No file uploaded.' };
  }

  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return { error: 'Invalid file type. Please upload a .xlsx file.' };
  }

  try {
    const companyName = file.name.replace(/\.xlsx$/i, '');
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: 'buffer' });

    if (workbook.SheetNames.length === 0) {
      return { error: 'The uploaded Excel file contains no sheets (roles).' };
    }

    const roles: { [role: string]: Question[] } = {};

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        roles[sheetName] = [];
        continue; // Allow empty sheets
      }
      
      const normalizedHeaders = Object.keys(jsonData[0]).map(normalizeHeader);
      const questionHeader = Object.keys(jsonData[0]).find(h => normalizeHeader(h) === 'question');

      if (!questionHeader) {
         return { error: `Sheet "${sheetName}" is missing the "Question" column.` };
      }

      roles[sheetName] = jsonData
        .map((row: any) => {
          const question = row[questionHeader];
          if (!question || typeof question !== 'string' || question.trim() === '') {
            return null; // Skip rows with empty questions
          }
          
          const expectedAnswerHeader = Object.keys(row).find(h => normalizeHeader(h) === 'expected answer');
          const difficultyHeader = Object.keys(row).find(h => normalizeHeader(h) === 'difficulty');

          return {
            Question: question,
            'Expected Answer': expectedAnswerHeader ? row[expectedAnswerHeader] : undefined,
            Difficulty: difficultyHeader ? row[difficultyHeader] : undefined,
          };
        })
        .filter((q): q is Question => q !== null);
    }

    return { data: { company: companyName, roles } };
  } catch (err) {
    console.error('Excel parsing error:', err);
    return { error: 'Failed to parse the Excel file. Please ensure it is a valid .xlsx file and not corrupted.' };
  }
}


export async function assessAnswer(input: AssessUserAnswerInput): Promise<{ data?: AssessUserAnswerOutput, error?: string }> {
  try {
    const result = await assessUserAnswer(input);
    return { data: result };
  } catch (error) {
    console.error("AI assessment error:", error);
    return { error: "Failed to get assessment from AI. Please try again." };
  }
}

export async function getLearningPlan(input: GenerateLearningPlanInput): Promise<{ data?: string, error?: string }> {
  try {
    const result = await generateLearningPlan(input);
    return { data: result.learningPlan };
  } catch (error) {
    console.error("AI learning plan error:", error);
    return { error: "Failed to generate learning plan from AI. Please try again." };
  }
}
