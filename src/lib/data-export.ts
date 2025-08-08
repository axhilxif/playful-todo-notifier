export interface ExportData {
  version: string;
  exportDate: string;
  user: {
    profile: any;
    achievements: any[];
    settings: any;
  };
  todos: any[];
  focusSessions: any[];
  planBoard: any[];
  timetable: any[];
}

export function exportUserData(): string {
  const data: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    user: {
      profile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
      achievements: JSON.parse(localStorage.getItem('userAchievements') || '[]'),
      settings: JSON.parse(localStorage.getItem('todo-app-settings') || '{}'),
    },
    todos: JSON.parse(localStorage.getItem('todo-app-todos') || '[]'),
    focusSessions: JSON.parse(localStorage.getItem('focusSessions') || '[]'),
    planBoard: JSON.parse(localStorage.getItem('planBoard') || '[]'),
    timetable: JSON.parse(localStorage.getItem('todo-app-timetable') || '[]'),
  };

  return JSON.stringify(data, null, 2);
}

export function downloadBackup(): void {
  const data = exportUserData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `accs-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function importUserData(jsonData: string): { success: boolean; message: string } {
  try {
    const data: ExportData = JSON.parse(jsonData);
    
    // Validate data structure
    if (!data.version || !data.user || !data.todos) {
      return { success: false, message: 'Invalid backup file format' };
    }

    // Confirm with user before overwriting
    const confirmOverwrite = window.confirm(
      'This will replace all your current data. Are you sure you want to continue?'
    );
    
    if (!confirmOverwrite) {
      return { success: false, message: 'Import cancelled by user' };
    }

    // Import data
    if (data.user.profile) {
      localStorage.setItem('userProfile', JSON.stringify(data.user.profile));
    }
    if (data.user.achievements) {
      localStorage.setItem('userAchievements', JSON.stringify(data.user.achievements));
    }
    if (data.user.settings) {
      localStorage.setItem('todo-app-settings', JSON.stringify(data.user.settings));
    }
    if (data.todos) {
      localStorage.setItem('todo-app-todos', JSON.stringify(data.todos));
    }
    if (data.focusSessions) {
      localStorage.setItem('focusSessions', JSON.stringify(data.focusSessions));
    }
    if (data.planBoard) {
      localStorage.setItem('planBoard', JSON.stringify(data.planBoard));
    }
    if (data.timetable) {
      localStorage.setItem('todo-app-timetable', JSON.stringify(data.timetable));
    }

    return { success: true, message: 'Data imported successfully! Please refresh the page.' };
  } catch (error) {
    return { success: false, message: 'Failed to parse backup file' };
  }
}

export function handleFileImport(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(importUserData(result));
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
}