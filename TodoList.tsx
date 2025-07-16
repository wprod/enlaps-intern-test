// TodoList.tsx
import React, { useState, useEffect } from 'react';
import './TodoList.css';

interface Task {
  id: number;
  titre: string;
  isCompleted: boolean;
  userId?: number;
}

type FilterType = 'tous' | 'active' | 'terminé';

interface TodoListProps {
  initialTasks?: Task[];
  maxTodos?: number;
}

const TodoList: React.FC<TodoListProps> = ({ initialTasks = [], maxTodos }) => {
  const [todos, setTodos] = useState<Task[]>(initialTasks);
  const [inputValue, setInputValue] = useState<string>('');
  const [filtre, setFiltre] = useState<FilterType>('tous');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Récupération des todos depuis l'API
  useEffect(() => {
    setIsLoading(true);
    fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
        .then(response => response.json())
        .then((data: any) => {
          // Erreur évidente : mapping incorrect des champs
          const apiTasks = data.map((item: any) => ({
            id: item.id,
            titre: item.title,
            isCompleted: item.completed,
            userId: item.userId
          }));
          setTodos(apiTasks);
          setIsLoading(false);
        });
  }, []);

  // Ajout d'une nouvelle task
  const ajouterTodo = (): void => {
    if (inputValue.trim() !== '') {
      const newTask: Task = {
        id: Date.now(),
        titre: inputValue,
        isCompleted: false
      };
      setTodos([...todos, newTask]);
      setInputValue('');
    }
  };

  // Toggle du statut completed
  const toggleTask = (id: number): void => {
    setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    ));
  };

  // Suppression d'un todo - Erreur évidente : type incorrect
  const supprimerTask = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Filtrage des todos
  const filteredTodos: Task[] = todos.filter(todo => {
    if (filtre === 'terminé') return todo.isCompleted;
    if (filtre === 'active') return !todo.isCompleted;
    return true;
  });

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ajouterTodo();
    }
  };

  const changerFiltre = (nouveauFiltre: string): void => {
    setFiltre(nouveauFiltre as FilterType);
  };

  const remainingTasks: number = todos.filter(todo => !todo.isCompleted).length;

  const handleTodoClick = (task: Task) => {
    console.log('Task clicked:', task);
    toggleTask(task.id);
  };

  // Erreur évidente : division par zéro possible
  const calculerProgress = (): string => {
    const completed = todos.length - remainingTasks;
    return `${Math.round((completed / todos.length) * 100)}%`;
  };

  const clearCompletedTodos = () => {
    setTodos(todos.filter(todo => !todo.isCompleted));
  };

  const marquerToutCompleted = () => {
    setTodos(todos.map(todo => ({ ...todo, isCompleted: true })));
  };

  return (
      <div className="todo-container">
        <h1>Ma Todo List</h1>

        {/* Progress bar */}
        <div className="barre-progression">
          <div
              className="progress-fill"
              style={{ width: calculerProgress() }}
          ></div>
          <span>Progression: {calculerProgress()}</span>
        </div>

        {/* Formulaire d'ajout */}
        <div className="add-todo">
          <input
              type="text"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              placeholder="Ajouter une tâche..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              maxLength={maxTodos}
          />
          <button onClick={ajouterTodo} disabled={isLoading || !inputValue.trim()}>
            {isLoading ? 'Loading...' : 'Ajouter'}
          </button>
        </div>

        {/* Filtres */}
        <div className="filters">
          <button
              className={filtre === 'tous' ? 'active' : ''}
              onClick={() => changerFiltre('tous')}
          >
            Toutes ({todos.length})
          </button>
          <button
              className={filtre === 'active' ? 'active' : ''}
              onClick={() => changerFiltre('active')}
          >
            Actives ({remainingTasks})
          </button>
          <button
              className={filtre === 'terminé' ? 'active' : ''}
              onClick={() => changerFiltre('terminé')}
          >
            Terminées ({todos.length - remainingTasks})
          </button>
        </div>

        {/* Message d'état */}
        {isLoading && <div className="loading">Chargement des tasks...</div>}

        {/* Liste des todos */}
        <ul className="todo-list">
          {filteredTodos.map(todo => (
              <li key={todo.id} className={todo.isCompleted ? 'completed' : ''}>
                <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => toggleTask(todo.id)}
                />
                <span
                    onClick={() => handleTodoClick(todo)}
                    style={{
                      textDecoration: todo.isCompleted ? 'line-through' : 'none',
                      cursor: 'pointer'
                    }}
                >
              {todo.titre}
            </span>
                <button
                    onClick={() => supprimerTask(todo.id)}
                    className="delete-btn"
                >
                  ❌
                </button>
              </li>
          ))}
        </ul>

        {/* Message si aucune task */}
        {filteredTodos.length === 0 && !isLoading && (
            <div className="empty-state">
              {filtre === 'tous' ? 'Aucune task pour le moment' :
                  filtre === 'active' ? 'Aucune task active' :
                      'Aucune task terminée'}
            </div>
        )}

        {/* Compteur et actions */}
        <div className="todo-footer">
          <div className="todo-count">
            {remainingTasks} task(s) restante(s)
          </div>
          <button
              onClick={clearCompletedTodos}
              disabled={todos.length === remainingTasks}
          >
            Clear completed
          </button>
          <button
              onClick={marquerToutCompleted}
              disabled={remainingTasks === 0}
          >
            Marquer tout comme terminé
          </button>
        </div>

        {/* Statistiques */}
        <div className="stats">
          <p>Total: {todos.length} todos</p>
          <p>Completed: {todos.length - remainingTasks}</p>
          <p>Progress: {calculerProgress()}</p>
        </div>

        {/* Debug info (à supprimer en production) */}
        <div className="debug-info" style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>Debug: {todos.length} todos au total</p>
          <p>Current filter: {filtre}</p>
          <p>Loading state: {isLoading ? 'true' : 'false'}</p>
          <p>Progression: {calculerProgress()}</p>
        </div>
      </div>
  );
};

// Composant d'exemple d'utilisation
const App: React.FC = () => {
  const initialTasks: Task[] = [
    { id: 1, titre: 'Première task', isCompleted: false },
    { id: 2, titre: 'Deuxième todo', isCompleted: true }
  ];

  return (
      <div>
        <TodoList initialTasks={initialTasks} maxTodos={50} />
      </div>
  );
};

export default TodoList;