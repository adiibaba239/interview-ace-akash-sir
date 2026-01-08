'use server';

import * as xlsx from 'xlsx';
import { assessUserAnswer } from '@/ai/flows/assess-user-answer';
import { generateLearningPlan } from '@/ai/flows/generate-learning-plan';
import { generateSkillsForRole } from '@/ai/flows/generate-skills-for-role';
import { generateStudyGuide } from '@/ai/flows/generate-study-guide';
import type { ExcelData, Question, AssessUserAnswerOutput, GenerateSkillsOutput } from '@/lib/types';
import { z } from 'zod';

// Helper to normalize column headers
const normalizeHeader = (header: string) => header.trim().toLowerCase();

export async function parseExcelFile(
  formData: FormData
): Promise<{ data?: ExcelData; error?: string }> {
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { error: 'No file uploaded.' };
  }
  
  const lowerCaseFileName = file.name.toLowerCase();
  if (!lowerCaseFileName.endsWith('.xlsx') && !lowerCaseFileName.endsWith('.csv')) {
    return { error: 'Invalid file type. Please upload a .xlsx or .csv file.' };
  }

  try {
    const companyName = file.name.replace(/\.(xlsx|csv)$/i, '');
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: 'buffer' });

    if (workbook.SheetNames.length === 0) {
      return { error: 'The uploaded file contains no data.' };
    }

    const roles: { [role: string]: Question[] } = {};
    const isCsv = lowerCaseFileName.endsWith('.csv');
    const sheetNames = isCsv ? [companyName] : workbook.SheetNames;
    const workbookSheets = isCsv ? {[companyName]: workbook.Sheets[workbook.SheetNames[0]]} : workbook.Sheets;


    for (const sheetName of sheetNames) {
      const worksheet = workbookSheets[sheetName];
      if (!worksheet) { // Handle case where sheet might not exist (e.g. csv naming mismatch)
          roles[sheetName] = [];
          continue;
      }
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

    const finalRoles = isCsv ? { [companyName]: roles[companyName] } : roles;
    const finalData = { company: companyName, roles: finalRoles };
    
    // For CSV, if there are no roles, but there are questions, we assume the CSV is the role.
    if(isCsv && finalData.roles[companyName] && finalData.roles[companyName].length > 0) {
        if(!finalData.roles[companyName]) finalData.roles[companyName] = [];
    }


    return { data: finalData };
  } catch (err) {
    console.error('File parsing error:', err);
    return { error: 'Failed to parse the file. Please ensure it is a valid file and not corrupted.' };
  }
}


export async function assessAnswer(input: Parameters<typeof assessUserAnswer>[0]): Promise<{ data?: Awaited<ReturnType<typeof assessUserAnswer>>, error?: string }> {
  try {
    const result = await assessUserAnswer(input);
    return { data: result };
  } catch (error) {
    console.error("AI assessment error:", error);
    return { error: "Failed to get assessment from AI. Please try again." };
  }
}

export async function getLearningPlan(input: Parameters<typeof generateLearningPlan>[0]): Promise<{ data?: Awaited<ReturnType<typeof generateLearningPlan>>, error?: string }> {
  try {
    const result = await generateLearningPlan(input);
    return { data: result };
  } catch (error) {
    console.error("AI learning plan error:", error);
    return { error: "Failed to generate learning plan from AI. Please try again." };
  }
}

export async function getSkillsForRole(input: Parameters<typeof generateSkillsForRole>[0]): Promise<{ data?: Awaited<ReturnType<typeof generateSkillsForRole>>, error?: string }> {
  try {
    const result = await generateSkillsForRole(input);
    return { data: result };
  } catch (error) {
    console.error("AI skills generation error:", error);
    return { error: "Failed to generate skills from AI. Please try again." };
  }
}

export async function getStudyGuide(input: Parameters<typeof generateStudyGuide>[0]): Promise<{ data?: Awaited<ReturnType<typeof generateStudyGuide>>, error?: string }> {
  try {
    const result = await generateStudyGuide(input);
    return { data: result };
  } catch (error) {
    console.error("AI study guide error:", error);
    return { error: "Failed to generate study guide from AI. Please try again." };
  }
}
