# **App Name**: InterviewAce

## Core Features:

- Excel Upload and Parsing: Allows users to upload Excel files, which are then parsed to extract the company name, roles, and interview questions. Uses the xlsx library.
- Role Selection: Presents a dropdown list of roles extracted from the Excel sheet names, allowing the user to select a specific role.
- Question Display: Displays the interview questions associated with the selected role, along with any provided expected answers and difficulty levels.
- Answer Submission: Provides a text area for the user to input their answer to each interview question.
- AI-Powered Assessment: Uses AI to compare the user's answer against the expected answer (if provided) and generates a score, identifies strengths, and points out gaps. LLM acts as a tool for judging answers and generating personalized feedback.
- Decision Logic: Directs the user to either the Revision & Learn phase (if assessment is weak) or the Mock Interview phase (if assessment is strong).
- Revision & Learn: AI extracts required skills from the role name, questions, and weak areas to generate a topic-wise learning plan. LLM acts as a tool to decide the content and layout of the generated personalized learning plan.

## Style Guidelines:

- Primary color: Deep blue (#316B98) to convey professionalism and trust, anchoring the design in stability.
- Background color: Light blue (#D2E3FC), a soft and desaturated variant of the primary color, providing a gentle backdrop that ensures readability.
- Accent color: Soft purple (#9DA9CC), an analogous color to the primary, yet different enough in brightness and saturation to highlight key interactive elements.
- Body: 'Inter' sans-serif for clear, neutral body text; Headlines: 'Space Grotesk' sans-serif to create a tech-oriented feeling
- Code font: 'Source Code Pro' for any code examples or technical snippets, clearly distinguishable from other content.
- Use simple, clear icons to represent different sections and actions within the app, improving usability.
- Subtle transitions and animations to enhance user experience when navigating between sections or submitting answers.