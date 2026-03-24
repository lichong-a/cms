interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: TodoItem[];
}

export default function TodoList({ todos }: TodoListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">待办事项</h3>
        <div className="space-y-3">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center">
              <input
                type="checkbox"
                checked={todo.completed}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                readOnly
              />
              <span className={`ml-2 text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {todo.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
