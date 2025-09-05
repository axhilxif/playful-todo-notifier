const SUBJECTS_STORAGE_KEY = 'user_timer_subjects';

export function getSubjects(): string[] {
  try {
    const storedSubjects = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    return storedSubjects ? JSON.parse(storedSubjects) : ["General"];
  } catch (error) {
    console.error("Error loading subjects from localStorage:", error);
    return ["General"]; // Fallback to default
  }
}

export function addSubject(subject: string): string[] {
  const subjects = getSubjects();
  if (!subjects.includes(subject)) {
    subjects.push(subject);
    localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
  }
  return subjects;
}

export function removeSubject(subject: string): string[] {
  let subjects = getSubjects();
  subjects = subjects.filter(s => s !== subject);
  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
  return subjects;
}
