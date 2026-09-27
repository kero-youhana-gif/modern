import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTodos = async () => {
      try {
        const response = await axios.get(API_URL);
        if (isMounted) {
          setTodos(response.data);
          setErrorMessage('');
        }
      } catch {
        if (isMounted) setErrorMessage('Could not connect to the server.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadTodos();
    return () => {
      isMounted = false;
    };
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSaving) return;

    try {
      setIsSaving(true);
      const response = await axios.post(API_URL, { text });
      setTodos((currentTodos) => [...currentTodos, response.data]);
      setInputText('');
      setErrorMessage('');
    } catch {
      setErrorMessage('The task could not be added.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    } catch {
      setErrorMessage('The task could not be removed.');
    }
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">PERSONAL PLANNER</p>
          <h1>Today</h1>
          <p className="date">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p>
        </div>
        <div className="task-count" aria-label={`${todos.length} tasks`}>
          <strong>{todos.length}</strong>
          <span>{todos.length === 1 ? 'task' : 'tasks'}</span>
        </div>
      </header>

      <form className="task-form" onSubmit={addTodo}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New task"
          autoComplete="off"
        />
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Adding...' : 'Add task'}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <section className="task-section" aria-labelledby="task-heading">
        <div className="section-heading">
          <h2 id="task-heading">Your list</h2>
          <span>{todos.length ? 'Keep moving' : 'A clear start'}</span>
        </div>
        {isLoading ? (
          <p className="empty-state">Loading your tasks...</p>
        ) : todos.length === 0 ? (
          <p className="empty-state">Nothing here yet. Add one small thing to get started.</p>
        ) : (
          <ul className="task-list">
            {todos.map((todo) => (
              <li className="task-item" key={todo.id}>
                <span className="task-marker" aria-hidden="true" />
                <span className="task-text">{todo.text}</span>
                <button className="remove-button" onClick={() => deleteTodo(todo.id)} aria-label={`Remove ${todo.text}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;