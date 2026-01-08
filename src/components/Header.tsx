import { Briefcase } from 'lucide-react';

export function Header() {
  return (
    <header className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-3">
        <Briefcase className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">
          InterviewAce
        </h1>
      </div>
    </header>
  );
}
