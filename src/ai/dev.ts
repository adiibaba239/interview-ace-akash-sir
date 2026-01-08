import { config } from 'dotenv';
config();

import '@/ai/flows/generate-learning-plan.ts';
import '@/ai/flows/assess-user-answer.ts';
import '@/ai/flows/generate-skills-for-role.ts';
import '@/ai/flows/generate-study-guide.ts';
