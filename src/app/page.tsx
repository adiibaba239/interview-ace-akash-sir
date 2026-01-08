'use client';

import { useState, useMemo, useRef, type FormEvent, useEffect } from 'react';
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  LoaderCircle,
  UploadCloud,
  XCircle,
  FileText,
  Briefcase,
  Sparkles,
  ArrowRight,
  GraduationCap,
  ListChecks,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { assessAnswer, getLearningPlan, parseExcelFile, getSkillsForRole, getStudyGuide } from './actions';
import type { ExcelData, Question } from '@/lib/types';
import type { AssessUserAnswerOutput } from '@/ai/flows/assess-user-answer';
import type { GenerateSkillsOutput } from '@/ai/flows/generate-skills-for-role';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ViewState =
  | 'upload'
  | 'role_select'
  | 'skills'
  | 'study_guide'
  | 'assessment'
  | 'feedback'
  | 'learning'
  | 'completed';

export default function Home() {
  const [view, setView] = useState<ViewState>('upload');
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [assessment, setAssessment] = useState<AssessUserAnswerOutput | null>(null);
  const [learningPlan, setLearningPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<GenerateSkillsOutput | null>(null);
  const [studyGuide, setStudyGuide] = useState<string | null>(null);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const questions = useMemo(() => {
    if (excelData && selectedRole) {
      return excelData.roles[selectedRole] || [];
    }
    return [];
  }, [excelData, selectedRole]);

  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  const handleFileUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await parseExcelFile(formData);

    setIsLoading(false);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error,
      });
    } else if (result.data) {
      setExcelData(result.data);
      setView('role_select');
      const roles = Object.keys(result.data.roles);
      if (roles.length === 1) {
        setSelectedRole(roles[0]);
      }
    }
  };

  useEffect(() => {
    if (selectedRole && excelData) {
      handleRoleSelect(selectedRole);
    }
  }, [selectedRole]);


  const handleRoleSelect = async (role: string) => {
    if (!excelData) return;
    setIsLoading(true);
    const result = await getSkillsForRole({
      roleName: role,
      companyName: excelData.company,
    });
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to get skills',
        description: result.error,
      });
      setView('role_select');
    } else if (result.data) {
      setSkills(result.data);
      setView('skills');
    }
  };

  const handleGetStudyGuide = async () => {
    if (!skills) return;
    setIsLoading(true);
    const result = await getStudyGuide({
      skills: skills.skills,
    });
    setIsLoading(false);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create study guide',
        description: result.error,
      });
    } else if (result.data) {
      setStudyGuide(result.data);
      setView('study_guide');
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !userAnswer.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Answer',
        description: 'Please provide an answer before submitting.',
      });
      return;
    }
    setIsLoading(true);
    const result = await assessAnswer({
      question: currentQuestion.Question,
      userAnswer,
      expectedAnswer: currentQuestion['Expected Answer'],
      role: selectedRole,
    });
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Assessment Failed',
        description: result.error,
      });
    } else if (result.data) {
      setAssessment(result.data);
      setView('feedback');
    }
  };

  const handleGetLearningPlan = async () => {
    if (!assessment) return;
    setIsLoading(true);
    const result = await getLearningPlan({
      roleName: selectedRole,
      questions: questions.map(q => q.Question),
      weakAreas: assessment.gaps,
    });
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Create Plan',
        description: result.error,
      });
    } else if (result.data) {
      setLearningPlan(result.data);
      setView('learning');
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setView('assessment');
    } else {
      setView('completed');
    }
    setAssessment(null);
    setUserAnswer('');
  };

  const startOver = () => {
    setView('upload');
    setExcelData(null);
    setSelectedRole('');
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setAssessment(null);
    setLearningPlan(null);
    setSkills(null);
    setStudyGuide(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const tryAgain = () => {
    setView('assessment');
    setAssessment(null);
    setLearningPlan(null);
  };
  
  const backToSkills = () => {
    setView('skills');
    setStudyGuide(null);
  }
  
  const startAssessment = () => {
    if (questions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Questions Found',
        description: `There are no questions for the role "${selectedRole}". Please upload a file with questions.`,
      });
       setView('role_select');
      return;
    }
    setView('assessment');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /> <p className="text-lg font-medium">Processing...</p></div>;
    }

    switch (view) {
      case 'upload':
        return (
          <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
            <form onSubmit={handleFileUpload}>
              <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-3"><UploadCloud className="w-8 h-8"/> Get Started</CardTitle>
                <CardDescription>Upload your interview prep Excel or CSV file to begin.</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="file-upload" className="sr-only">Upload File</Label>
                <Input id="file-upload" name="file" type="file" required accept=".xlsx,.csv" ref={fileInputRef} className="text-foreground" />
                <p className="text-xs text-muted-foreground mt-2">File name will be used as the company name (e.g., Amazon.xlsx).</p>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upload and Analyze
                </Button>
              </CardFooter>
            </form>
          </Card>
        );

      case 'role_select':
         if (!excelData) return null;
         return (
          <Card className="w-full max-w-lg mx-auto animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-3"><Briefcase className="w-8 h-8"/>{excelData.company}</CardTitle>
              <CardDescription>Select a role to start your preparation.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedRole} value={selectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(excelData.roles).map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
             <CardFooter>
                <Button variant="outline" onClick={startOver}>Start Over</Button>
              </CardFooter>
          </Card>
        );
      
      case 'skills':
        if (!skills) return null;
        return (
          <Card className="w-full max-w-2xl mx-auto animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-3"><ListChecks /> Required Skills</CardTitle>
              <CardDescription>Here are the key skills for a <strong>{selectedRole}</strong> at <strong>{excelData?.company}</strong>.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-base">{skill}</Badge>
                ))}
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">Review the skills above. Do you want to practice with an assessment or get a study guide first?</p>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={handleGetStudyGuide}><GraduationCap /> Get Study Guide</Button>
              <Button onClick={startAssessment}>Start Assessment <ArrowRight className="ml-2 w-4 h-4"/></Button>
            </CardFooter>
          </Card>
        );
      
      case 'study_guide':
        return (
          <Card className="w-full max-w-3xl mx-auto animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-3"><GraduationCap/> Study Guide</CardTitle>
              <CardDescription>Here are some resources to help you prepare for the <strong>{selectedRole}</strong> role.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-secondary/30 p-4 font-code text-sm">
                {studyGuide}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={backToSkills}><ChevronLeft/> Back to Skills</Button>
              <Button onClick={startAssessment}>I'm Ready! Start Assessment <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </CardFooter>
          </Card>
        );

      case 'assessment':
        return (
          <Card className="w-full max-w-3xl mx-auto animate-in fade-in-50 duration-500">
             <CardHeader>
              <p className="text-sm font-medium text-primary">{selectedRole} Assessment</p>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full h-2" />
              <CardTitle className="font-headline text-2xl pt-4">{currentQuestion?.Question}</CardTitle>
              {currentQuestion?.Difficulty && <Badge variant="secondary" className="w-fit">{currentQuestion.Difficulty}</Badge>}
            </CardHeader>
            <CardContent>
              <Label htmlFor="user-answer" className="font-bold text-lg mb-2 block">Your Answer:</Label>
              <Textarea
                id="user-answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={10}
              />
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={startOver}>Start Over</Button>
              <Button onClick={handleAnswerSubmit}>Submit Answer <ArrowRight className="ml-2 w-4 h-4"/></Button>
            </CardFooter>
          </Card>
        );
      case 'feedback':
        if (!assessment) return null;
        const isWeak = assessment.score < 70;
        return(
          <Card className="w-full max-w-3xl mx-auto animate-in fade-in-50 duration-500">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Assessment Feedback</CardTitle>
                <p className="text-muted-foreground">{currentQuestion.Question}</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Score</p>
                    <p className={`font-bold text-7xl ${isWeak ? 'text-destructive' : 'text-green-600'}`}>{assessment.score}<span className="text-2xl text-muted-foreground">/100</span></p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <h3 className="font-bold text-xl flex items-center gap-2 text-green-700"><CheckCircle2/> Strengths</h3>
                        <p className="text-muted-foreground">{assessment.strengths}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-xl flex items-center gap-2 text-destructive"><XCircle/> Gaps</h3>
                        <p className="text-muted-foreground">{assessment.gaps}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={tryAgain}><ChevronLeft className="mr-2 h-4 w-4" />Try Again</Button>
              <div className="flex gap-2">
                {isWeak && <Button onClick={handleGetLearningPlan}><Lightbulb className="mr-2 h-4 w-4" />Get Learning Plan</Button>}
                <Button onClick={goToNextQuestion}>Next Question <ChevronRight className="ml-2 h-4 w-4"/></Button>
              </div>
            </CardFooter>
          </Card>
        );
      case 'learning':
        return (
          <Card className="w-full max-w-3xl mx-auto animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-3"><BrainCircuit/> Personalized Learning Plan</CardTitle>
              <CardDescription>Based on your assessment, here are some topics to focus on for the <strong>{selectedRole}</strong> role.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-secondary/30 p-4 font-code text-sm">
                {learningPlan}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
               <Button onClick={goToNextQuestion}>Next Question <ChevronRight className="ml-2 h-4 w-4"/></Button>
            </CardFooter>
          </Card>
        );
       case 'completed':
        return (
          <Card className="w-full max-w-lg mx-auto text-center animate-in fade-in-50 duration-500">
            <CardHeader>
              <div className="mx-auto w-fit rounded-full bg-green-100 p-4 dark:bg-green-900/50">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="font-headline text-3xl mt-4">Assessment Complete!</CardTitle>
              <CardDescription>You've completed all questions for the {selectedRole} role.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>You can now start a mock interview, or start over with a new file or a different role.</p>
            </CardContent>
            <CardFooter className="flex-col gap-2">
               <Button disabled className="w-full">Start Mock Interview (Coming Soon)</Button>
              <Button onClick={startOver} className="w-full" variant="outline">Start New Assessment</Button>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        {renderContent()}
      </main>
    </>
  );
}
