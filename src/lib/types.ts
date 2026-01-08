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
