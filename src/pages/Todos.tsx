import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { TodoCard } from '@/components/todos/TodoCard';
import { TodoForm } from '@/components/todos/TodoForm';
import { Todo } from '@/types';
import { getTodos, setTodos } from '@/lib/storage';
import { playHaptic, requestNotificationPermission, scheduleTodoReminder, cancelNotification } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { processUserAction } from '@/lib/gamification';

export default function Todos() {
  const [todos, setTodosState] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedTodos = getTodos();
    setTodosState(storedTodos);
    // On app launch, re-schedule all pending todo reminders
    storedTodos.forEach(todo => {
      if (todo.notificationTime) {
        const time = new Date(todo.notificationTime);
        if (time > new Date()) {
          requestNotificationPermission().then(granted => {
            if (granted) scheduleTodoReminder(todo.id, todo.title, time);
          });
        }
      }
    });
  }, []);

  const saveTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    setTodosState(newTodos);
  };

  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const updatedTodos = [newTodo, ...todos];
    saveTodos(updatedTodos);
    setShowForm(false);
    playHaptic();
    // Schedule notification if needed
    if (newTodo.notificationTime) {
      const time = new Date(newTodo.notificationTime);
      if (time > new Date()) {
        const granted = await requestNotificationPermission();
        if (granted) scheduleTodoReminder(newTodo.id, newTodo.title, time);
        else toast({ title: "Notifications Disabled", description: "Enable notification permissions to receive reminders." });
      }
    }
    toast({
      title: "Todo added! 🎉",
      description: `"${newTodo.title}" has been added to your list.`,
    });
  };

  const handleEditTodo = async (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    if (!editingTodo) return;
    
    const updatedTodo: Todo = {
      ...editingTodo,
      ...todoData,
    };
    
    const updatedTodos = todos.map(todo => 
      todo.id === editingTodo.id ? updatedTodo : todo
    );
    saveTodos(updatedTodos);
    setEditingTodo(null);
    setShowForm(false);
    playHaptic();
    // Cancel previous notification
    await cancelNotification(Number(editingTodo.id.replace(/\D/g, '').slice(0, 8)));
    // Schedule new notification if needed
    if (updatedTodo.notificationTime) {
      const time = new Date(updatedTodo.notificationTime);
      if (time > new Date()) {
        const granted = await requestNotificationPermission();
        if (granted) scheduleTodoReminder(updatedTodo.id, updatedTodo.title, time);
        else toast({ title: "Notifications Disabled", description: "Enable notification permissions to receive reminders." });
      }
    }
    toast({
      title: "Todo updated! ✨",
      description: `"${updatedTodo.title}" has been updated.`,
    });
  };

  const handleToggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed, completedAt: new Date() } : todo
    );
    saveTodos(updatedTodos);
    playHaptic();
    
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
        const { levelUp, newLevel, newAchievements } = processUserAction('complete-todo');
        toast({
            title: "Todo completed! 🎉",
            description: `"${todo.title}" is done. +25 XP`,
        });
        if (levelUp) {
            toast({ title: 'Level Up!', description: `You reached level ${newLevel}!` });
        }
        newAchievements.forEach(ach => {
            toast({ title: 'Achievement Unlocked!', description: `🎉 ${ach.name}` });
        });
    } else if (todo) {
        toast({
            title: "Todo reopened 🔄",
            description: `"${todo.title}" is now pending.`,
        });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
    playHaptic();
    // Cancel notification if set
    await cancelNotification(Number(id.replace(/\D/g, '').slice(0, 8)));
    if (todo) {
      toast({
        title: "Todo deleted 🗑️",
        description: `"${todo.title}" has been removed.`,
        variant: "destructive",
      });
    }
  };

  const filteredTodos = todos
    .filter(todo => 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(todo => filterPriority === 'all' || todo.priority === filterPriority);

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="My Todos"
        subtitle={`${completedCount}/${totalCount} completed`}
        icon={<Plus className="h-6 w-6" />}
        action={
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary animate-pulse-glow"
            >
            <Plus className="h-4 w-4 mr-2" />
            Add Todo
          </Button>
        }
      />

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            const priorities: typeof filterPriority[] = ['all', 'high', 'medium', 'low'];
            const currentIndex = priorities.indexOf(filterPriority);
            const nextIndex = (currentIndex + 1) % priorities.length;
            setFilterPriority(priorities[nextIndex]);
          }}
          className="flex-shrink-0"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter indicator */}
      {filterPriority !== 'all' && (
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            Showing {filterPriority} priority todos
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || filterPriority !== 'all' ? 'No matching todos' : 'No todos yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterPriority !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Add your first todo to get started!'}
            </p>
            {!searchQuery && filterPriority === 'all' && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-primary hover:bg-gradient-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Todo
              </Button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo, index) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={() => handleToggleTodo(todo.id)}
              onEdit={() => {
                setEditingTodo(todo);
                setShowForm(true);
              }}
              onDelete={() => handleDeleteTodo(todo.id)}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))
        )}
      </div>

      {/* Todo Form Modal */}
      <TodoForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editingTodo ? handleEditTodo : handleAddTodo}
        initialData={editingTodo || undefined}
        title={editingTodo ? "Edit Todo" : "Add New Todo"}
      />
    </div>
  );
}