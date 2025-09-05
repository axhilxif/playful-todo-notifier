import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  onAddNew?: (subject: string) => void;
  className?: string;
}

export function SubjectSelector({
  value,
  onChange,
  onAddNew,
  className
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Load subjects from localStorage
    const storedSubjects = localStorage.getItem('subjects');
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects));
    }
  }, []);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    
    const updatedSubjects = [...subjects, newSubject.trim()];
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    
    if (onAddNew) {
      onAddNew(newSubject.trim());
    }
    onChange(newSubject.trim());
    setNewSubject('');
    setShowDialog(false);
  };

  // Keep focus on the input when dialog opens (fixes mobile keyboard auto-close)
  useEffect(() => {
    if (showDialog) {
      // small delay to wait for dialog animation/portal
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(t);
    }
  }, [showDialog]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select subject" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map(subject => (
            <SelectItem
              key={subject}
              value={subject}
              className="cursor-pointer"
            >
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Sheet open={showDialog} onOpenChange={setShowDialog}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl p-4">
          <SheetHeader>
            <SheetTitle>Add New Subject</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Enter subject name"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="mt-2"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddSubject}
                disabled={!newSubject.trim()}
              >
                Add Subject
              </Button>
            </div>
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>
    </div>
  );
}
