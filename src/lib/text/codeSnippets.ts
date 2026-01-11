/**
 * Code Snippets for KeyDojo Typing Practice
 *
 * All snippets are original, generic patterns commonly used in programming.
 * They represent common idioms and patterns that developers type frequently.
 * Each snippet uses template strings to preserve formatting and indentation.
 */

import { getAllExpandedCodeSnippets } from "./content/expandedCode";

// =============================================================================
// JAVASCRIPT / TYPESCRIPT SNIPPETS
// Common patterns for web development
// =============================================================================

export const JS_VARIABLE_SNIPPETS = [
  `const name = "Alice";
const age = 25;
const isActive = true;`,

  `let count = 0;
let items = [];
let data = null;`,

  `const user = {
  name: "Bob",
  email: "bob@example.com",
  age: 30,
};`,

  `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);`,

  `const { name, age } = user;
const [first, ...rest] = items;`,
];

export const JS_FUNCTION_SNIPPETS = [
  `function add(a, b) {
  return a + b;
}`,

  `function greet(name) {
  console.log("Hello, " + name);
}`,

  `const multiply = (x, y) => x * y;`,

  `const fetchData = async (url) => {
  const response = await fetch(url);
  return response.json();
};`,

  `function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + item.price;
  }, 0);
}`,

  `const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};`,

  `function validateEmail(email) {
  const pattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return pattern.test(email);
}`,

  `async function loadUser(id) {
  try {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
      throw new Error("User not found");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}`,
];

export const JS_CONTROL_FLOW_SNIPPETS = [
  `if (isValid) {
  processData();
} else {
  showError();
}`,

  `for (let i = 0; i < items.length; i++) {
  console.log(items[i]);
}`,

  `for (const item of items) {
  processItem(item);
}`,

  `while (hasMore) {
  const next = getNext();
  results.push(next);
}`,

  `switch (status) {
  case "pending":
    return "Waiting...";
  case "complete":
    return "Done!";
  default:
    return "Unknown";
}`,

  `const result = condition ? "yes" : "no";`,

  `try {
  riskyOperation();
} catch (error) {
  handleError(error);
} finally {
  cleanup();
}`,
];

export const JS_CLASS_SNIPPETS = [
  `class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  greet() {
    return \`Hello, \${this.name}\`;
  }
}`,

  `class Counter {
  #count = 0;

  increment() {
    this.#count++;
  }

  get value() {
    return this.#count;
  }
}`,

  `class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}`,
];

// =============================================================================
// TYPESCRIPT-SPECIFIC SNIPPETS
// Type annotations and TypeScript features
// =============================================================================

export const TS_TYPE_SNIPPETS = [
  `interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}`,

  `type Status = "pending" | "active" | "complete";`,

  `interface Props {
  title: string;
  count?: number;
  onClick: () => void;
}`,

  `type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};`,

  `interface Config {
  apiUrl: string;
  timeout: number;
  retries?: number;
}`,

  `type Handler<T> = (event: T) => void;`,

  `enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}`,

  `interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(item: T): Promise<void>;
  delete(id: string): Promise<boolean>;
}`,
];

export const TS_FUNCTION_SNIPPETS = [
  `function greet(name: string): string {
  return \`Hello, \${name}\`;
}`,

  `const add = (a: number, b: number): number => a + b;`,

  `async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,

  `function processItems<T>(items: T[], fn: (item: T) => void): void {
  items.forEach(fn);
}`,

  `function createStore<T>(initial: T) {
  let state = initial;
  return {
    get: () => state,
    set: (value: T) => { state = value; },
  };
}`,
];

// =============================================================================
// PYTHON SNIPPETS
// Common Python patterns and idioms
// =============================================================================

export const PYTHON_BASIC_SNIPPETS = [
  `name = "Alice"
age = 25
is_active = True`,

  `numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]`,

  `user = {
    "name": "Bob",
    "email": "bob@example.com",
    "age": 30,
}`,

  `x, y, z = 1, 2, 3`,

  `result = "yes" if condition else "no"`,
];

export const PYTHON_FUNCTION_SNIPPETS = [
  `def add(a, b):
    return a + b`,

  `def greet(name):
    print(f"Hello, {name}")`,

  `def calculate_total(items):
    return sum(item["price"] for item in items)`,

  `def fetch_data(url):
    response = requests.get(url)
    return response.json()`,

  `def validate_email(email):
    pattern = r"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
    return bool(re.match(pattern, email))`,

  `async def load_user(user_id):
    async with aiohttp.ClientSession() as session:
        async with session.get(f"/api/users/{user_id}") as response:
            return await response.json()`,

  `def process_items(items, func):
    return [func(item) for item in items]`,

  `def retry(max_attempts=3):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
        return wrapper
    return decorator`,
];

export const PYTHON_CLASS_SNIPPETS = [
  `class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def greet(self):
        return f"Hello, {self.name}"`,

  `class Counter:
    def __init__(self):
        self._count = 0

    def increment(self):
        self._count += 1

    @property
    def value(self):
        return self._count`,

  `class Config:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)`,

  `@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other):
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5`,
];

export const PYTHON_CONTROL_FLOW_SNIPPETS = [
  `if is_valid:
    process_data()
else:
    show_error()`,

  `for item in items:
    process_item(item)`,

  `for i, item in enumerate(items):
    print(f"{i}: {item}")`,

  `while has_more:
    next_item = get_next()
    results.append(next_item)`,

  `try:
    risky_operation()
except ValueError as e:
    handle_error(e)
finally:
    cleanup()`,

  `with open("file.txt", "r") as f:
    content = f.read()`,
];

// =============================================================================
// HTML/CSS SNIPPETS
// Web markup and styling patterns
// =============================================================================

export const HTML_SNIPPETS = [
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Title</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`,

  `<div class="container">
  <header>
    <h1>Title</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <p>Content goes here.</p>
  </main>
</div>`,

  `<form action="/submit" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  <button type="submit">Submit</button>
</form>`,

  `<ul class="list">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>`,

  `<article>
  <h2>Article Title</h2>
  <p>First paragraph of content.</p>
  <p>Second paragraph of content.</p>
</article>`,

  `<button class="btn btn-primary" onclick="handleClick()">
  Click Me
</button>`,
];

export const CSS_SNIPPETS = [
  `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}`,

  `.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}`,

  `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,

  `.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #3498db;
  color: white;
}`,

  `.btn:hover {
  background-color: #2980b9;
}`,

  `@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}`,

  `.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
}`,

  `:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --text-color: #333;
  --background-color: #f5f5f5;
}`,
];

// =============================================================================
// JSON/SQL/CONFIG SNIPPETS
// Data formats and configuration files
// =============================================================================

export const JSON_SNIPPETS = [
  `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`,

  `{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "total": 2
}`,

  `{
  "api": {
    "baseUrl": "https://api.example.com",
    "timeout": 5000,
    "retries": 3
  }
}`,
];

export const SQL_SNIPPETS = [
  `SELECT * FROM users WHERE active = true;`,

  `SELECT name, email
FROM users
WHERE created_at > '2024-01-01'
ORDER BY name ASC;`,

  `INSERT INTO users (name, email)
VALUES ('Alice', 'alice@example.com');`,

  `UPDATE users
SET last_login = NOW()
WHERE id = 123;`,

  `DELETE FROM sessions
WHERE expires_at < NOW();`,

  `SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING COUNT(o.id) > 5;`,

  `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`,
];

// =============================================================================
// REACT SNIPPETS
// React component patterns
// =============================================================================

export const REACT_SNIPPETS = [
  `function Button({ onClick, children }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}`,

  `const [count, setCount] = useState(0);`,

  `useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);`,

  `const handleSubmit = (e) => {
  e.preventDefault();
  onSubmit(formData);
};`,

  `return (
  <div className="container">
    <h1>{title}</h1>
    <p>{description}</p>
    {items.map(item => (
      <Item key={item.id} data={item} />
    ))}
  </div>
);`,

  `const value = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);`,

  `const handleClick = useCallback(() => {
  setCount(prev => prev + 1);
}, []);`,

  `interface Props {
  title: string;
  items: Item[];
  onSelect: (id: string) => void;
}

export function List({ title, items, onSelect }: Props) {
  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {items.map(item => (
          <li key={item.id} onClick={() => onSelect(item.id)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get all code snippets
export function getAllCodeSnippets(): string[] {
  return [
    ...JS_VARIABLE_SNIPPETS,
    ...JS_FUNCTION_SNIPPETS,
    ...JS_CONTROL_FLOW_SNIPPETS,
    ...JS_CLASS_SNIPPETS,
    ...TS_TYPE_SNIPPETS,
    ...TS_FUNCTION_SNIPPETS,
    ...PYTHON_BASIC_SNIPPETS,
    ...PYTHON_FUNCTION_SNIPPETS,
    ...PYTHON_CLASS_SNIPPETS,
    ...PYTHON_CONTROL_FLOW_SNIPPETS,
    ...HTML_SNIPPETS,
    ...CSS_SNIPPETS,
    ...JSON_SNIPPETS,
    ...SQL_SNIPPETS,
    ...REACT_SNIPPETS,
    ...getAllExpandedCodeSnippets(),
  ];
}

// Get snippets by language
export function getSnippetsByLanguage(
  language: "javascript" | "typescript" | "python" | "html" | "css" | "sql" | "json" | "react"
): string[] {
  switch (language) {
    case "javascript":
      return [
        ...JS_VARIABLE_SNIPPETS,
        ...JS_FUNCTION_SNIPPETS,
        ...JS_CONTROL_FLOW_SNIPPETS,
        ...JS_CLASS_SNIPPETS,
      ];
    case "typescript":
      return [...TS_TYPE_SNIPPETS, ...TS_FUNCTION_SNIPPETS];
    case "python":
      return [
        ...PYTHON_BASIC_SNIPPETS,
        ...PYTHON_FUNCTION_SNIPPETS,
        ...PYTHON_CLASS_SNIPPETS,
        ...PYTHON_CONTROL_FLOW_SNIPPETS,
      ];
    case "html":
      return HTML_SNIPPETS;
    case "css":
      return CSS_SNIPPETS;
    case "sql":
      return SQL_SNIPPETS;
    case "json":
      return JSON_SNIPPETS;
    case "react":
      return REACT_SNIPPETS;
  }
}

// Get a random code snippet
export function getRandomCodeSnippet(): string {
  const all = getAllCodeSnippets();
  return all[Math.floor(Math.random() * all.length)];
}
