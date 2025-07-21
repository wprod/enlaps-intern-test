import React, { useState, useEffect, useCallback } from "react";
import "./TodoList.css";

interface Task {
  id: number;
  titre: string;
  isCompleted: boolean;
  userId?: number;
  createdAt?: Date;
  priority?: "low" | "medium" | "high";
}

type FilterType = "tous" | "active" | "terminé" | "high-priority";

interface TodoListProps {
  initialTasks?: Task[];
  maxTodos?: number;
  enablePriority?: boolean;
}

interface ApiResponse {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

const TodoList: React.FC<TodoListProps> = ({
                                             initialTasks = [],
                                             maxTodos = 100,
                                             enablePriority = false,
                                           }) => {
  const [todos, setTodos] = useState<Task[]>(initialTasks);
  const [inputValue, setInputValue] = useState<string>("");
  const [filtre, setFiltre] = useState<FilterType>("tous");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedPriority, setSelectedPriority] = useState<
      "low" | "medium" | "high"
  >("medium");

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/todos?_limit=8",
        );
        const data = await response.json();

        const apiTasks: Task[] = data.map((item: any, index: number) => ({
          id: item.id,
          titre: item.title,
          isCompleted: item.completed,
          userId: item.userId,
          createdAt: new Date(),
          priority:
              index % 3 === 0 ? "high" : index % 2 === 0 ? "medium" : "low",
        }));

        setTodos([...initialTasks, ...apiTasks]);
      } catch (err) {
        setError("Erreur lors du chargement");
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialTasks.length === 0) {
      fetchTodos();
    }
  }, [initialTasks.length]);

  const ajouterTodo = (): void => {
    if (inputValue.trim() !== "") {
      if (todos.length >= maxTodos) {
        alert(`Maximum ${maxTodos} todos autorisés !`);
        return;
      }

      const newTask: Task = {
        id: Date.now(),
        titre: inputValue.trim(),
        isCompleted: false,
        createdAt: new Date(),
        priority: enablePriority ? selectedPriority : "medium",
      };

      setTodos((prevTodos) => [...prevTodos, newTask]);
      setInputValue("");
      setLastUpdated(new Date());
    }
  };

  const toggleTask = (id: number): void => {
    setTodos((prevTodos) =>
        prevTodos.map((todo) =>
            todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo,
        ),
    );
  };

  const supprimerTask = (id: number | string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id != id));
  };

  const filteredTodos: Task[] = todos
      .filter((todo) => {
        switch (filtre) {
          case "terminé":
            return todo.isCompleted;
          case "active":
            return !todo.isCompleted;
          case "high-priority":
            return todo.priority === "high" && !todo.isCompleted;
          case "tous":
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (b.priority === "high" && a.priority !== "high") return 1;
        return 0;
      });

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      ajouterTodo();
    }
  };

  const changerFiltre = (nouveauFiltre: string): void => {
    setFiltre(nouveauFiltre as FilterType);
  };

  const remainingTasks: number = todos.filter(
      (todo) => !todo.isCompleted,
  ).length;
  const completedTasks = todos.length - remainingTasks;

  const handleTodoClick = (task: Task) => {
    console.log("Task clicked:", task);
    toggleTask(task.id);
  };

  const calculerProgress = (): string => {
    if (todos.length === 0) return "0%";
    const completed = completedTasks;
    return `${Math.round((completed / todos.length) * 100)}%`;
  };

  const clearCompletedTodos = () => {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.isCompleted));
  };

  const marquerToutCompleted = () => {
    setTodos((prevTodos) =>
        prevTodos.map((todo) => ({ ...todo, isCompleted: true })),
    );
  };

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ffaa00";
      case "low":
        return "#44ff44";
      default:
        return "#cccccc";
    }
  };

  const renderPriorityBadge = (priority?: string) => {
    if (!enablePriority || !priority) return null;
    return (
        <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(priority) }}
        >
        {priority}
      </span>
    );
  };

  const shouldShowEmptyState =
      filteredTodos.length === 0 && !isLoading && todos.length > 0;

  return (
      <div className="todo-container">
        <header className="todo-header">
          <h1>Ma Todo List Avancée</h1>
          <div className="header-stats">
            <span>Total: {todos.length}</span>
            <span>•</span>
            <span>Restantes: {remainingTasks}</span>
          </div>
        </header>

        {error && (
            <div
                className="error-message"
                style={{ color: "red", padding: "10px" }}
            >
              {error}
              <button onClick={() => setError("")}>✕</button>
            </div>
        )}

        <div className="barre-progression">
          <div
              className="progress-fill"
              style={{
                width: calculerProgress(),
                backgroundColor:
                    completedTasks === todos.length ? "#4caf50" : "#2196f3",
              }}
          ></div>
          <span className="progress-text">Progression: {calculerProgress()}</span>
        </div>

        <div className="add-todo-section">
          <div className="add-todo">
            <input
                type="text"
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputValue(e.target.value)
                }
                placeholder="Ajouter une nouvelle tâche..."
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                maxLength={150}
                className={inputValue.length > 100 ? "warning" : ""}
            />

            {enablePriority && (
                <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    disabled={isLoading}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
            )}

            <button
                onClick={ajouterTodo}
                disabled={
                    isLoading || !inputValue.trim() || todos.length >= maxTodos
                }
                className="add-button"
            >
              {isLoading ? "⏳" : "➕"} Ajouter
            </button>
          </div>

          <div className="limit-indicator">
            {todos.length}/{maxTodos} todos
            {todos.length > maxTodos * 0.8 && (
                <span className="warning"> ⚠️ Limite bientôt atteinte</span>
            )}
          </div>
        </div>

        <div className="filters">
          <button
              className={filtre === "tous" ? "active" : ""}
              onClick={() => changerFiltre("tous")}
          >
            🗂️ Toutes ({todos.length})
          </button>
          <button
              className={filtre === "active" ? "active" : ""}
              onClick={() => changerFiltre("active")}
          >
            ⚡ Actives ({remainingTasks})
          </button>
          <button
              className={filtre === "terminé" ? "active" : ""}
              onClick={() => changerFiltre("terminé")}
          >
            ✅ Terminées ({completedTasks})
          </button>
          {enablePriority && (
              <button
                  className={filtre === "high-priority" ? "active" : ""}
                  onClick={() => changerFiltre("high-priority")}
              >
                🔥 Priorité Haute (
                {
                  todos.filter((t) => t.priority === "high" && !t.isCompleted)
                      .length
                }
                )
              </button>
          )}
        </div>

        {isLoading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Chargement des tâches...</span>
            </div>
        )}

        <ul className="todo-list">
          {filteredTodos.map((todo, index) => (
              <li
                  key={`${todo.id}-${index}`}
                  className={`todo-item ${todo.isCompleted ? "completed" : ""} priority-${todo.priority}`}
                  style={{
                    borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
                    opacity: todo.isCompleted ? 0.7 : 1,
                  }}
              >
                <div className="todo-content">
                  <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() => toggleTask(todo.id)}
                      className="todo-checkbox"
                  />

                  <span
                      onClick={() => handleTodoClick(todo)}
                      className="todo-text"
                      style={{
                        textDecoration: todo.isCompleted ? "line-through" : "none",
                        cursor: "pointer",
                        color: todo.isCompleted ? "#999" : "#333",
                      }}
                      title={`Créé: ${todo.createdAt?.toLocaleDateString()}`}
                  >
                {todo.titre}
              </span>

                  {renderPriorityBadge(todo.priority)}

                  {todo.userId && (
                      <span className="user-badge">👤 User {todo.userId}</span>
                  )}
                </div>

                <div className="todo-actions">
                  <button
                      onClick={() => supprimerTask(todo.id)}
                      className="delete-btn"
                      title="Supprimer la tâche"
                  >
                    🗑️
                  </button>
                </div>
              </li>
          ))}
        </ul>

        {shouldShowEmptyState && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-message">
                {filtre === "tous"
                    ? "Aucune tâche pour le moment"
                    : filtre === "active"
                        ? "Aucune tâche active ! 🎉"
                        : filtre === "terminé"
                            ? "Aucune tâche terminée encore"
                            : "Aucune tâche haute priorité active"}
              </div>
              {filtre !== "tous" && (
                  <button
                      onClick={() => changerFiltre("tous")}
                      className="view-all-btn"
                  >
                    Voir toutes les tâches
                  </button>
              )}
            </div>
        )}

        {todos.length === 0 && !isLoading && !error && (
            <div className="welcome-state">
              <h3>🌟 Bienvenue !</h3>
              <p>Commencez par ajouter votre première tâche ci-dessus.</p>
            </div>
        )}

        <div className="todo-footer">
          <div className="todo-count">
            <strong>{remainingTasks}</strong> tâche
            {remainingTasks !== 1 ? "s" : ""} restante
            {remainingTasks !== 1 ? "s" : ""}
            {enablePriority && (
                <span className="priority-count">
              •{" "}
                  {
                    todos.filter((t) => t.priority === "high" && !t.isCompleted)
                        .length
                  }{" "}
                  haute priorité
            </span>
            )}
          </div>

          <div className="footer-actions">
            <button
                onClick={clearCompletedTodos}
                disabled={completedTasks === 0}
                className="clear-completed-btn"
                title="Supprimer toutes les tâches terminées"
            >
              🧹 Nettoyer ({completedTasks})
            </button>

            <button
                onClick={marquerToutCompleted}
                disabled={remainingTasks === 0}
                className="mark-all-btn"
                title="Marquer toutes comme terminées"
            >
              ✅ Tout terminer
            </button>
          </div>
        </div>

        <details className="stats-section">
          <summary>📊 Statistiques détaillées</summary>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{todos.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Terminées:</span>
              <span className="stat-value">{completedTasks}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Progression:</span>
              <span className="stat-value">{calculerProgress()}</span>
            </div>
            {enablePriority && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">Haute priorité:</span>
                    <span className="stat-value">
                  {todos.filter((t) => t.priority === "high").length}
                </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Moyenne priorité:</span>
                    <span className="stat-value">
                  {todos.filter((t) => t.priority === "medium").length}
                </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Basse priorité:</span>
                    <span className="stat-value">
                  {todos.filter((t) => t.priority === "low").length}
                </span>
                  </div>
                </>
            )}
          </div>
        </details>

        {process.env.NODE_ENV === "development" && (
            <details className="debug-info">
              <summary>🐛 Debug Info</summary>
              <pre
                  style={{
                    fontSize: "11px",
                    color: "#666",
                    background: "#f5f5f5",
                    padding: "10px",
                  }}
              >
            {JSON.stringify(
                {
                  totalTodos: todos.length,
                  currentFilter: filtre,
                  loadingState: isLoading,
                  errorState: error,
                  remainingTasks,
                  completedTasks,
                  progress: calculerProgress(),
                  enablePriority,
                  selectedPriority,
                  lastUpdated: lastUpdated.toISOString(),
                },
                null,
                2,
            )}
          </pre>
            </details>
        )}
      </div>
  );
};

const App: React.FC = () => {
  const initialTasks: Task[] = [
    {
      id: 1,
      titre: "Réviser pour l'examen de React",
      isCompleted: false,
      priority: "high",
      createdAt: new Date(),
    },
    {
      id: 2,
      titre: "Faire les courses",
      isCompleted: true,
      priority: "medium",
      createdAt: new Date(),
    },
    {
      id: 3,
      titre: "Appeler le médecin",
      isCompleted: false,
      priority: "high",
      createdAt: new Date(),
    },
  ];

  return (
      <div className="app">
        <TodoList
            initialTasks={initialTasks}
            maxTodos={50}
            enablePriority={true}
        />
      </div>
  );
};

export default TodoList;
