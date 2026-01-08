export type Question = {
  Question: string;
  'Expected Answer'?: string;
  Difficulty?: 'Easy' | 'Medium' | 'Hard';
};

export type ExcelData = {
  company: string;
  roles: {
    [role: string]: Question[];
  };
};

export type LearningResource = {
  title: string;
  url: string;
};

export type Skill = {
  skill: string;
  description: string;
  resources: LearningResource[];
};

export type LearningPath = Skill[];

export type Mcq = {
  mcqQuestion: string;
  options: string[];
  correctAnswer: string;
};
