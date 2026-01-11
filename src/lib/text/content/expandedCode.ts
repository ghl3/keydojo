/**
 * Expanded Code Snippets for KeyDojo Typing Practice
 *
 * Additional code snippets covering various programming languages and patterns.
 * All snippets are generic patterns commonly used in programming.
 */

// =============================================================================
// JAVASCRIPT - EXPANDED
// =============================================================================

export const JS_ARRAY_SNIPPETS = [
  `const filtered = items.filter(item => item.active);`,

  `const found = users.find(user => user.id === id);`,

  `const hasAdmin = roles.some(role => role === "admin");`,

  `const allValid = inputs.every(input => input.length > 0);`,

  `const sorted = [...array].sort((a, b) => a - b);`,

  `const unique = [...new Set(array)];`,

  `const flatList = nested.flat(2);`,

  `const grouped = items.reduce((acc, item) => {
  const key = item.category;
  acc[key] = acc[key] || [];
  acc[key].push(item);
  return acc;
}, {});`,

  `const index = array.indexOf(value);
if (index !== -1) {
  array.splice(index, 1);
}`,

  `const chunks = [];
for (let i = 0; i < array.length; i += size) {
  chunks.push(array.slice(i, i + size));
}`,
];

export const JS_OBJECT_SNIPPETS = [
  `const merged = { ...defaults, ...options };`,

  `const clone = JSON.parse(JSON.stringify(original));`,

  `const { a, b, ...rest } = object;`,

  `const keys = Object.keys(object);
const values = Object.values(object);
const entries = Object.entries(object);`,

  `const hasProperty = Object.hasOwn(object, "key");`,

  `const frozen = Object.freeze({ x: 1, y: 2 });`,

  `const fromEntries = Object.fromEntries(entries);`,

  `const descriptors = Object.getOwnPropertyDescriptors(obj);`,

  `for (const [key, value] of Object.entries(object)) {
  console.log(\`\${key}: \${value}\`);
}`,

  `const mapped = Object.fromEntries(
  Object.entries(obj).map(([k, v]) => [k, v * 2])
);`,
];

export const JS_STRING_SNIPPETS = [
  `const trimmed = str.trim();`,

  `const lower = str.toLowerCase();
const upper = str.toUpperCase();`,

  `const parts = str.split(",");
const joined = parts.join(" | ");`,

  `const replaced = str.replace(/old/g, "new");`,

  `const starts = str.startsWith("prefix");
const ends = str.endsWith("suffix");`,

  `const padded = String(num).padStart(4, "0");`,

  `const template = \`Hello, \${name}! You have \${count} messages.\`;`,

  `const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");`,

  `const capitalized = str.charAt(0).toUpperCase() + str.slice(1);`,

  `const truncated = str.length > max
  ? str.slice(0, max) + "..."
  : str;`,
];

export const JS_DATE_SNIPPETS = [
  `const now = new Date();
const timestamp = Date.now();`,

  `const formatted = date.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});`,

  `const iso = date.toISOString();`,

  `const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);`,

  `const diff = Math.abs(date1 - date2);
const days = Math.ceil(diff / (1000 * 60 * 60 * 24));`,

  `const year = date.getFullYear();
const month = date.getMonth();
const day = date.getDate();`,

  `const startOfDay = new Date(date);
startOfDay.setHours(0, 0, 0, 0);`,

  `const isWeekend = day => {
  const d = day.getDay();
  return d === 0 || d === 6;
};`,
];

export const JS_PROMISE_SNIPPETS = [
  `const promise = new Promise((resolve, reject) => {
  if (success) {
    resolve(result);
  } else {
    reject(new Error("Failed"));
  }
});`,

  `const results = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchComments(),
]);`,

  `const first = await Promise.race([
  timeout(5000),
  fetchData(),
]);`,

  `const settled = await Promise.allSettled(promises);
const fulfilled = settled
  .filter(r => r.status === "fulfilled")
  .map(r => r.value);`,

  `promise
  .then(result => process(result))
  .catch(error => handleError(error))
  .finally(() => cleanup());`,

  `const delay = ms => new Promise(r => setTimeout(r, ms));`,

  `async function retry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts - 1) throw e;
      await delay(1000 * Math.pow(2, i));
    }
  }
}`,
];

export const JS_DOM_SNIPPETS = [
  `const element = document.getElementById("app");`,

  `const items = document.querySelectorAll(".item");`,

  `element.classList.add("active");
element.classList.remove("hidden");
element.classList.toggle("selected");`,

  `element.setAttribute("data-id", id);
const value = element.getAttribute("data-id");`,

  `element.style.display = "none";
element.style.backgroundColor = "#fff";`,

  `const child = document.createElement("div");
child.textContent = "Hello";
parent.appendChild(child);`,

  `element.addEventListener("click", (e) => {
  e.preventDefault();
  handleClick(e.target);
});`,

  `const rect = element.getBoundingClientRect();
const { top, left, width, height } = rect;`,

  `element.innerHTML = "";`,

  `const clone = element.cloneNode(true);
parent.insertBefore(clone, sibling);`,
];

export const JS_MODULE_SNIPPETS = [
  `import { useState, useEffect } from "react";`,

  `import axios from "axios";`,

  `import * as utils from "./utils";`,

  `export default function Component() {}`,

  `export const helper = () => {};
export const constant = 42;`,

  `export { default as Button } from "./Button";
export { default as Input } from "./Input";`,

  `const module = await import("./dynamic.js");`,

  `import.meta.env.MODE`,
];

// =============================================================================
// TYPESCRIPT - EXPANDED
// =============================================================================

export const TS_INTERFACE_SNIPPETS = [
  `interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}`,

  `interface Config {
  readonly apiUrl: string;
  timeout?: number;
  retries?: number;
}`,

  `interface Response<T> {
  data: T;
  status: number;
  message: string;
}`,

  `interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}`,

  `interface EventHandler<E = Event> {
  (event: E): void;
}`,

  `interface Dictionary<T> {
  [key: string]: T;
}`,

  `interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}`,

  `interface Comparable<T> {
  compareTo(other: T): number;
}`,
];

export const TS_TYPE_ADVANCED_SNIPPETS = [
  `type Status = "pending" | "active" | "completed";`,

  `type Nullable<T> = T | null;`,

  `type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};`,

  `type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};`,

  `type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;`,

  `type Required<T> = {
  [P in keyof T]-?: T[P];
};`,

  `type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};`,

  `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;`,

  `type Awaited<T> = T extends Promise<infer U> ? U : T;`,

  `type NonNullable<T> = T extends null | undefined ? never : T;`,
];

export const TS_GENERIC_SNIPPETS = [
  `function identity<T>(value: T): T {
  return value;
}`,

  `function first<T>(array: T[]): T | undefined {
  return array[0];
}`,

  `function map<T, U>(array: T[], fn: (item: T) => U): U[] {
  return array.map(fn);
}`,

  `class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}`,

  `async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json() as Promise<T>;
}`,

  `function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}`,
];

export const TS_UTILITY_SNIPPETS = [
  `const user: Partial<User> = { name: "Alice" };`,

  `const config: Required<Config> = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
};`,

  `const frozen: Readonly<Point> = { x: 0, y: 0 };`,

  `type UserKeys = keyof User;`,

  `type UserName = User["name"];`,

  `const result: Record<string, number> = {};`,

  `type Callback = Parameters<typeof handler>;`,

  `type Result = Exclude<Status, "pending">;`,

  `type AllStatus = Extract<Status | "draft", Status>;`,
];

// =============================================================================
// PYTHON - EXPANDED
// =============================================================================

export const PYTHON_LIST_SNIPPETS = [
  `numbers = [1, 2, 3, 4, 5]
squares = [x ** 2 for x in numbers]`,

  `filtered = [x for x in items if x > 0]`,

  `matrix = [[i * j for j in range(5)] for i in range(5)]`,

  `flattened = [item for row in matrix for item in row]`,

  `pairs = list(zip(keys, values))`,

  `sorted_items = sorted(items, key=lambda x: x["name"])`,

  `unique = list(set(items))`,

  `reversed_list = items[::-1]`,

  `first, *middle, last = items`,

  `combined = [*list1, *list2]`,
];

export const PYTHON_DICT_SNIPPETS = [
  `config = {
    "host": "localhost",
    "port": 8080,
    "debug": True,
}`,

  `merged = {**defaults, **overrides}`,

  `value = data.get("key", "default")`,

  `filtered = {k: v for k, v in items.items() if v > 0}`,

  `inverted = {v: k for k, v in original.items()}`,

  `from collections import defaultdict
counts = defaultdict(int)`,

  `from collections import Counter
frequency = Counter(words)`,

  `keys = list(data.keys())
values = list(data.values())
items = list(data.items())`,

  `nested = data.setdefault("key", {})`,

  `sorted_dict = dict(sorted(data.items()))`,
];

export const PYTHON_STRING_SNIPPETS = [
  `formatted = f"Hello, {name}! You have {count} messages."`,

  `multiline = """
This is a
multiline string.
"""`,

  `parts = text.split(",")
joined = " | ".join(parts)`,

  `cleaned = text.strip().lower()`,

  `replaced = text.replace("old", "new")`,

  `lines = text.splitlines()`,

  `padded = str(num).zfill(4)`,

  `import re
matches = re.findall(r"\\d+", text)`,

  `title_case = "hello world".title()`,

  `centered = text.center(20, "-")`,
];

export const PYTHON_FILE_SNIPPETS = [
  `with open("file.txt", "r") as f:
    content = f.read()`,

  `with open("file.txt", "w") as f:
    f.write(content)`,

  `with open("data.json", "r") as f:
    data = json.load(f)`,

  `with open("data.json", "w") as f:
    json.dump(data, f, indent=2)`,

  `import csv
with open("data.csv", "r") as f:
    reader = csv.DictReader(f)
    rows = list(reader)`,

  `from pathlib import Path
path = Path("folder") / "file.txt"
content = path.read_text()`,

  `import os
files = os.listdir(directory)`,

  `if os.path.exists(filepath):
    os.remove(filepath)`,
];

export const PYTHON_DECORATOR_SNIPPETS = [
  `def decorator(func):
    def wrapper(*args, **kwargs):
        print("Before")
        result = func(*args, **kwargs)
        print("After")
        return result
    return wrapper`,

  `@decorator
def my_function():
    pass`,

  `import functools

def memoize(func):
    cache = {}
    @functools.wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper`,

  `def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Time: {time.time() - start:.2f}s")
        return result
    return wrapper`,

  `@property
def name(self):
    return self._name

@name.setter
def name(self, value):
    self._name = value`,

  `@classmethod
def from_json(cls, json_str):
    data = json.loads(json_str)
    return cls(**data)`,

  `@staticmethod
def validate(value):
    return value is not None`,
];

export const PYTHON_ASYNC_SNIPPETS = [
  `import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return {"status": "ok"}`,

  `async def main():
    results = await asyncio.gather(
        fetch_users(),
        fetch_posts(),
    )`,

  `async with aiohttp.ClientSession() as session:
    async with session.get(url) as response:
        data = await response.json()`,

  `async for item in async_generator():
    process(item)`,

  `asyncio.run(main())`,

  `task = asyncio.create_task(coroutine())`,

  `try:
    result = await asyncio.wait_for(coro, timeout=5.0)
except asyncio.TimeoutError:
    print("Timeout!")`,
];

// =============================================================================
// HTML - EXPANDED
// =============================================================================

export const HTML_FORM_SNIPPETS = [
  `<form action="/submit" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  <button type="submit">Submit</button>
</form>`,

  `<input type="text" placeholder="Search..." autocomplete="off">`,

  `<select name="country" id="country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
</select>`,

  `<textarea name="message" rows="4" cols="50" placeholder="Your message..."></textarea>`,

  `<input type="checkbox" id="agree" name="agree">
<label for="agree">I agree to the terms</label>`,

  `<input type="radio" id="option1" name="choice" value="1">
<label for="option1">Option 1</label>`,

  `<input type="range" min="0" max="100" value="50" step="10">`,

  `<input type="file" accept="image/*" multiple>`,

  `<input type="date" min="2024-01-01" max="2024-12-31">`,

  `<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
</datalist>`,
];

export const HTML_SEMANTIC_SNIPPETS = [
  `<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>`,

  `<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content goes here.</p>
  </article>
</main>`,

  `<footer>
  <p>&copy; 2024 Company Name</p>
</footer>`,

  `<section>
  <h2>Section Title</h2>
  <p>Section content.</p>
</section>`,

  `<aside>
  <h3>Related Links</h3>
  <ul>
    <li><a href="#">Link 1</a></li>
  </ul>
</aside>`,

  `<figure>
  <img src="image.jpg" alt="Description">
  <figcaption>Image caption</figcaption>
</figure>`,

  `<details>
  <summary>Click to expand</summary>
  <p>Hidden content here.</p>
</details>`,

  `<time datetime="2024-01-15">January 15, 2024</time>`,
];

export const HTML_TABLE_SNIPPETS = [
  `<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Age</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice</td>
      <td>25</td>
    </tr>
  </tbody>
</table>`,

  `<th scope="col">Column Header</th>`,

  `<td colspan="2">Spans two columns</td>`,

  `<td rowspan="3">Spans three rows</td>`,

  `<caption>Table Caption</caption>`,

  `<tfoot>
  <tr>
    <td>Total</td>
    <td>100</td>
  </tr>
</tfoot>`,
];

// =============================================================================
// CSS - EXPANDED
// =============================================================================

export const CSS_FLEXBOX_SNIPPETS = [
  `.container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,

  `.flex-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}`,

  `.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}`,

  `.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}`,

  `.flex-item {
  flex: 1 1 auto;
}`,

  `.flex-shrink-0 {
  flex-shrink: 0;
}`,

  `.flex-grow {
  flex-grow: 1;
}`,

  `.order-first {
  order: -1;
}`,
];

export const CSS_GRID_SNIPPETS = [
  `.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,

  `.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}`,

  `.grid-areas {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}`,

  `.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }`,

  `.span-2 {
  grid-column: span 2;
}`,

  `.center-grid {
  display: grid;
  place-items: center;
}`,

  `.grid-gap {
  row-gap: 10px;
  column-gap: 20px;
}`,
];

export const CSS_ANIMATION_SNIPPETS = [
  `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,

  `.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}`,

  `.slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}`,

  `.transition-all {
  transition: all 0.3s ease;
}`,

  `.hover-scale:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}`,

  `.rotate {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,

  `.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}`,
];

export const CSS_RESPONSIVE_SNIPPETS = [
  `@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}`,

  `@media (min-width: 1024px) {
  .sidebar {
    display: block;
  }
}`,

  `@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #ffffff;
  }
}`,

  `@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}`,

  `.responsive-image {
  max-width: 100%;
  height: auto;
}`,

  `:root {
  --spacing: 1rem;
}

@media (min-width: 768px) {
  :root {
    --spacing: 2rem;
  }
}`,
];

export const CSS_UTILITY_SNIPPETS = [
  `.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}`,

  `.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`,

  `.clearfix::after {
  content: "";
  display: table;
  clear: both;
}`,

  `.aspect-ratio-16-9 {
  aspect-ratio: 16 / 9;
}`,

  `.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`,

  `.scroll-smooth {
  scroll-behavior: smooth;
}`,

  `.pointer-events-none {
  pointer-events: none;
}`,
];

// =============================================================================
// SQL - EXPANDED
// =============================================================================

export const SQL_QUERY_SNIPPETS = [
  `SELECT * FROM users WHERE active = true;`,

  `SELECT name, email FROM users ORDER BY created_at DESC LIMIT 10;`,

  `SELECT COUNT(*) as total FROM orders WHERE status = 'completed';`,

  `SELECT category, SUM(price) as total
FROM products
GROUP BY category
HAVING SUM(price) > 1000;`,

  `SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;`,

  `SELECT * FROM products
WHERE price BETWEEN 10 AND 100
AND category IN ('electronics', 'clothing');`,

  `SELECT DISTINCT category FROM products;`,

  `SELECT * FROM users
WHERE name LIKE '%smith%'
OR email LIKE '%@gmail.com';`,

  `SELECT * FROM orders
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);`,

  `SELECT
  CASE
    WHEN price < 10 THEN 'cheap'
    WHEN price < 100 THEN 'moderate'
    ELSE 'expensive'
  END as price_tier,
  COUNT(*) as count
FROM products
GROUP BY price_tier;`,
];

export const SQL_CRUD_SNIPPETS = [
  `INSERT INTO users (name, email, created_at)
VALUES ('Alice', 'alice@example.com', NOW());`,

  `INSERT INTO orders (user_id, total, status)
SELECT id, 0, 'pending'
FROM users
WHERE active = true;`,

  `UPDATE users
SET last_login = NOW()
WHERE id = 1;`,

  `UPDATE products
SET price = price * 0.9
WHERE category = 'clearance';`,

  `DELETE FROM sessions
WHERE expires_at < NOW();`,

  `DELETE FROM users
WHERE id NOT IN (
  SELECT DISTINCT user_id FROM orders
);`,

  `REPLACE INTO settings (key, value)
VALUES ('theme', 'dark');`,

  `INSERT INTO logs (message, level)
VALUES ('User logged in', 'info')
ON DUPLICATE KEY UPDATE count = count + 1;`,
];

export const SQL_DDL_SNIPPETS = [
  `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,

  `ALTER TABLE users
ADD COLUMN phone VARCHAR(20);`,

  `ALTER TABLE products
DROP COLUMN deprecated_field;`,

  `CREATE INDEX idx_users_email ON users(email);`,

  `DROP INDEX idx_users_email ON users;`,

  `CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);`,

  `TRUNCATE TABLE temp_data;`,

  `DROP TABLE IF EXISTS old_table;`,
];

// =============================================================================
// REACT - EXPANDED
// =============================================================================

export const REACT_HOOKS_SNIPPETS = [
  `const [count, setCount] = useState(0);`,

  `const [state, setState] = useState({
  loading: false,
  data: null,
  error: null,
});`,

  `useEffect(() => {
  fetchData();
}, []);`,

  `useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, [dependency]);`,

  `const memoizedValue = useMemo(() => {
  return expensiveComputation(data);
}, [data]);`,

  `const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);`,

  `const inputRef = useRef(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);`,

  `const { user, loading } = useContext(AuthContext);`,

  `const [state, dispatch] = useReducer(reducer, initialState);`,

  `const deferredValue = useDeferredValue(searchQuery);`,
];

export const REACT_COMPONENT_SNIPPETS = [
  `function Button({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}`,

  `const Card = ({ title, children }) => (
  <div className="card">
    <h2>{title}</h2>
    {children}
  </div>
);`,

  `function List({ items, renderItem }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id ?? index}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}`,

  `const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};`,

  `function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <div>Something went wrong.</div>;
  }

  return children;
}`,
];

export const REACT_PATTERN_SNIPPETS = [
  `{isLoading && <Spinner />}`,

  `{error ? <Error message={error} /> : <Content />}`,

  `{items.length > 0 ? (
  <List items={items} />
) : (
  <EmptyState />
)}`,

  `<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>`,

  `{show && <Transition>
  <Dialog />
</Transition>}`,

  `<Provider value={contextValue}>
  {children}
</Provider>`,

  `const LazyComponent = lazy(() => import("./Component"));`,

  `{children ?? <DefaultContent />}`,
];

// =============================================================================
// JSON - EXPANDED
// =============================================================================

export const JSON_CONFIG_SNIPPETS = [
  `{
  "name": "project-name",
  "version": "1.0.0",
  "description": "Project description",
  "main": "index.js"
}`,

  `{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint ."
  }
}`,

  `{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,

  `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true
  }
}`,

  `{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}`,
];

export const JSON_DATA_SNIPPETS = [
  `{
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "roles": ["admin", "user"]
  }
}`,

  `{
  "items": [
    { "id": 1, "name": "Item 1", "price": 9.99 },
    { "id": 2, "name": "Item 2", "price": 19.99 }
  ],
  "total": 29.98
}`,

  `{
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "hasNext": true
  }
}`,

  `{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}`,

  `{
  "settings": {
    "theme": "dark",
    "language": "en",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}`,
];

// =============================================================================
// GO SNIPPETS
// =============================================================================

export const GO_SNIPPETS = [
  `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,

  `func add(a, b int) int {
    return a + b
}`,

  `type User struct {
    ID    int
    Name  string
    Email string
}`,

  `users := make([]User, 0)
users = append(users, User{ID: 1, Name: "Alice"})`,

  `for i := 0; i < 10; i++ {
    fmt.Println(i)
}`,

  `for _, item := range items {
    process(item)
}`,

  `if err != nil {
    return fmt.Errorf("failed: %w", err)
}`,

  `data := map[string]int{
    "a": 1,
    "b": 2,
}`,

  `go func() {
    result <- process()
}()`,

  `ch := make(chan int, 10)`,

  `select {
case msg := <-ch1:
    handle(msg)
case <-time.After(time.Second):
    timeout()
}`,

  `defer file.Close()`,
];

// =============================================================================
// RUST SNIPPETS
// =============================================================================

export const RUST_SNIPPETS = [
  `fn main() {
    println!("Hello, World!");
}`,

  `fn add(a: i32, b: i32) -> i32 {
    a + b
}`,

  `let mut count = 0;
count += 1;`,

  `struct User {
    id: u32,
    name: String,
    email: String,
}`,

  `impl User {
    fn new(name: String) -> Self {
        Self {
            id: 0,
            name,
            email: String::new(),
        }
    }
}`,

  `enum Status {
    Pending,
    Active,
    Completed,
}`,

  `match status {
    Status::Pending => println!("Pending"),
    Status::Active => println!("Active"),
    Status::Completed => println!("Done"),
}`,

  `let numbers: Vec<i32> = vec![1, 2, 3, 4, 5];`,

  `let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();`,

  `if let Some(value) = option {
    process(value);
}`,

  `fn read_file(path: &str) -> Result<String, std::io::Error> {
    std::fs::read_to_string(path)
}`,

  `let result = value.unwrap_or_default();`,
];

// =============================================================================
// SHELL/BASH SNIPPETS
// =============================================================================

export const SHELL_SNIPPETS = [
  `#!/bin/bash

echo "Hello, World!"`,

  `for file in *.txt; do
    echo "Processing $file"
done`,

  `if [ -f "$file" ]; then
    echo "File exists"
fi`,

  `while read -r line; do
    echo "$line"
done < input.txt`,

  `count=$(ls -1 | wc -l)
echo "Files: $count"`,

  `name=\${1:-default}`,

  `[ -z "$var" ] && echo "Empty"`,

  `find . -name "*.log" -mtime +7 -delete`,

  `grep -r "pattern" --include="*.js" .`,

  `curl -X POST -H "Content-Type: application/json" \\
    -d '{"key": "value"}' \\
    https://api.example.com/endpoint`,

  `tar -czvf archive.tar.gz folder/`,

  `chmod +x script.sh`,
];

// =============================================================================
// ADDITIONAL JAVASCRIPT SNIPPETS
// =============================================================================

export const JS_EXTRA_SNIPPETS = [
  `const isEmpty = obj => Object.keys(obj).length === 0;`,

  `const range = (start, end) =>
  Array.from({ length: end - start }, (_, i) => start + i);`,

  `const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});`,

  `const capitalize = str =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();`,

  `const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;`,

  `const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);`,

  `const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));`,

  `const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);`,

  `const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);`,

  `const throttle = (fn, wait) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      return fn(...args);
    }
  };
};`,

  `const once = fn => {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
};`,

  `const curry = fn => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...more) => curried(...args, ...more);
  };
};`,

  `const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
};`,

  `const partition = (arr, predicate) =>
  arr.reduce(
    ([pass, fail], item) =>
      predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
    [[], []]
  );`,

  `const zip = (...arrays) =>
  arrays[0].map((_, i) => arrays.map(arr => arr[i]));`,
];

// =============================================================================
// ADDITIONAL PYTHON SNIPPETS
// =============================================================================

export const PYTHON_EXTRA_SNIPPETS = [
  `from typing import List, Dict, Optional`,

  `def get_or_default(d: dict, key: str, default=None):
    return d.get(key, default)`,

  `class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance`,

  `from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float`,

  `from enum import Enum, auto

class Status(Enum):
    PENDING = auto()
    ACTIVE = auto()
    COMPLETED = auto()`,

  `from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    yield
    print(f"Elapsed: {time.time() - start:.2f}s")`,

  `import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)`,

  `from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,

  `from itertools import chain, islice

batched = list(islice(items, 10))`,

  `try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Value error: {e}")
except Exception as e:
    logger.exception("Unexpected error")
    raise`,

  `assert condition, "Error message"`,

  `with open(path, encoding="utf-8") as f:
    for line in f:
        process(line.strip())`,

  `numbers = [x for x in range(100) if x % 2 == 0]`,

  `result = next((x for x in items if x.valid), None)`,

  `total = sum(item.price for item in cart)`,
];

// =============================================================================
// ADDITIONAL CSS SNIPPETS
// =============================================================================

export const CSS_EXTRA_SNIPPETS = [
  `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}`,

  `.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}`,

  `.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}`,

  `.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}`,

  `.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}`,

  `.badge {
  display: inline-block;
  padding: 0.25em 0.5em;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background: #e5e7eb;
}`,

  `.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`,

  `.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}`,

  `.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.5rem;
  background: #333;
  color: white;
  font-size: 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.tooltip:hover::after {
  opacity: 1;
}`,

  `:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}`,
];

// =============================================================================
// ADDITIONAL SQL SNIPPETS
// =============================================================================

export const SQL_EXTRA_SNIPPETS = [
  `SELECT * FROM users u
INNER JOIN profiles p ON u.id = p.user_id
WHERE u.active = true;`,

  `SELECT
  DATE_FORMAT(created_at, '%Y-%m') as month,
  COUNT(*) as total
FROM orders
GROUP BY month
ORDER BY month DESC;`,

  `WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as rn
  FROM products
)
SELECT * FROM ranked WHERE rn <= 3;`,

  `SELECT COALESCE(nickname, name, 'Unknown') as display_name
FROM users;`,

  `SELECT * FROM orders
WHERE status = 'pending'
FOR UPDATE;`,

  `BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;`,

  `EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';`,

  `CREATE VIEW active_users AS
SELECT * FROM users WHERE active = true AND last_login > DATE_SUB(NOW(), INTERVAL 30 DAY);`,

  `CREATE PROCEDURE get_user_orders(IN user_id INT)
BEGIN
  SELECT * FROM orders WHERE user_id = user_id;
END;`,

  `CREATE TRIGGER update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
SET NEW.updated_at = NOW();`,
];

// =============================================================================
// ADDITIONAL REACT SNIPPETS
// =============================================================================

export const REACT_EXTRA_SNIPPETS = [
  `const Input = forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));`,

  `const Counter = memo(({ count, onIncrement }) => (
  <button onClick={onIncrement}>{count}</button>
));`,

  `function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}`,

  `function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,

  `function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = event => {
      if (!ref.current?.contains(event.target)) {
        handler(event);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}`,

  `const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);`,

  `function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}`,

  `const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});`,

  `const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => queryClient.invalidateQueries(["users"]),
});`,

  `<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("email", { required: true })} />
  {errors.email && <span>Email is required</span>}
  <button type="submit">Submit</button>
</form>`,
];

// =============================================================================
// ADDITIONAL TYPESCRIPT SNIPPETS
// =============================================================================

export const TS_EXTRA_SNIPPETS = [
  `type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";`,

  `type AsyncFunction<T> = () => Promise<T>;`,

  `interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: number;
}`,

  `type EventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  scroll: Event;
};`,

  `function assertNever(value: never): never {
  throw new Error(\`Unexpected value: \${value}\`);
}`,

  `const result = value as unknown as TargetType;`,

  `class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}`,

  `function isString(value: unknown): value is string {
  return typeof value === "string";
}`,

  `type Brand<T, B> = T & { __brand: B };
type UserId = Brand<string, "UserId">;`,

  `const enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}`,
];

// =============================================================================
// FINAL BATCH - ADDITIONAL SNIPPETS
// =============================================================================

export const FINAL_BATCH_SNIPPETS = [
  `const isEven = n => n % 2 === 0;`,

  `const clamp = (num, min, max) => Math.min(Math.max(num, min), max);`,

  `const sum = arr => arr.reduce((a, b) => a + b, 0);`,

  `const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;`,

  `const last = arr => arr[arr.length - 1];`,

  `const compact = arr => arr.filter(Boolean);`,

  `const uniqBy = (arr, key) => [...new Map(arr.map(x => [x[key], x])).values()];`,

  `const shuffle = arr => arr.sort(() => Math.random() - 0.5);`,

  `const pick = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj[k]]));`,

  `const omit = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));`,

  `const deepClone = obj => JSON.parse(JSON.stringify(obj));`,

  `const toQueryString = obj => new URLSearchParams(obj).toString();`,

  `const parseJSON = str => { try { return JSON.parse(str); } catch { return null; } };`,

  `const isObject = val => val !== null && typeof val === "object" && !Array.isArray(val);`,

  `const debounce = (fn, ms) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };`,

  `def flatten(nested: list) -> list:
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result`,

  `class Counter:
    def __init__(self, initial=0):
        self.value = initial

    def increment(self):
        self.value += 1
        return self

    def decrement(self):
        self.value -= 1
        return self`,

  `def safe_get(d: dict, *keys, default=None):
    for key in keys:
        if isinstance(d, dict):
            d = d.get(key, default)
        else:
            return default
    return d`,

  `def chunk(lst: list, size: int) -> list:
    return [lst[i:i + size] for i in range(0, len(lst), size)]`,

  `@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5`,

  `SELECT id, name,
  RANK() OVER (ORDER BY score DESC) as rank
FROM players;`,

  `SELECT * FROM products
WHERE category_id IN (
  SELECT id FROM categories WHERE active = true
);`,

  `SELECT
  name,
  LAG(value) OVER (ORDER BY date) as prev_value,
  value - LAG(value) OVER (ORDER BY date) as diff
FROM metrics;`,

  `UPDATE products p
JOIN categories c ON p.category_id = c.id
SET p.discount = 0.1
WHERE c.name = 'sale';`,

  `import { render, screen, fireEvent } from "@testing-library/react";

test("button click increments counter", () => {
  render(<Counter />);
  fireEvent.click(screen.getByText("Increment"));
  expect(screen.getByText("1")).toBeInTheDocument();
});`,

  `const { container } = render(<Component />);
expect(container).toMatchSnapshot();`,

  `const mockFn = jest.fn();
mockFn.mockReturnValue(42);
expect(mockFn()).toBe(42);`,

  `beforeEach(() => {
  jest.clearAllMocks();
});`,

  `describe("Calculator", () => {
  it("should add two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("should subtract two numbers", () => {
    expect(subtract(5, 3)).toBe(2);
  });
});`,

  `const wrapper = mount(
  <Provider store={store}>
    <Component />
  </Provider>
);`,

  `await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});`,

  `expect.assertions(1);
await expect(fetchData()).rejects.toThrow("Error");`,

  `it.each([
  [1, 1, 2],
  [2, 2, 4],
  [3, 3, 6],
])("adds %i + %i = %i", (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});`,

  `.sr-only {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}`,

  `.text-gradient {
  background: linear-gradient(45deg, #f00, #00f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}`,

  `.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}`,

  `.aspect-video {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}`,
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getAllExpandedCodeSnippets(): string[] {
  return [
    ...JS_ARRAY_SNIPPETS,
    ...JS_OBJECT_SNIPPETS,
    ...JS_STRING_SNIPPETS,
    ...JS_DATE_SNIPPETS,
    ...JS_PROMISE_SNIPPETS,
    ...JS_DOM_SNIPPETS,
    ...JS_MODULE_SNIPPETS,
    ...JS_EXTRA_SNIPPETS,
    ...TS_INTERFACE_SNIPPETS,
    ...TS_TYPE_ADVANCED_SNIPPETS,
    ...TS_GENERIC_SNIPPETS,
    ...TS_UTILITY_SNIPPETS,
    ...TS_EXTRA_SNIPPETS,
    ...PYTHON_LIST_SNIPPETS,
    ...PYTHON_DICT_SNIPPETS,
    ...PYTHON_STRING_SNIPPETS,
    ...PYTHON_FILE_SNIPPETS,
    ...PYTHON_DECORATOR_SNIPPETS,
    ...PYTHON_ASYNC_SNIPPETS,
    ...PYTHON_EXTRA_SNIPPETS,
    ...HTML_FORM_SNIPPETS,
    ...HTML_SEMANTIC_SNIPPETS,
    ...HTML_TABLE_SNIPPETS,
    ...CSS_FLEXBOX_SNIPPETS,
    ...CSS_GRID_SNIPPETS,
    ...CSS_ANIMATION_SNIPPETS,
    ...CSS_RESPONSIVE_SNIPPETS,
    ...CSS_UTILITY_SNIPPETS,
    ...CSS_EXTRA_SNIPPETS,
    ...SQL_QUERY_SNIPPETS,
    ...SQL_CRUD_SNIPPETS,
    ...SQL_DDL_SNIPPETS,
    ...SQL_EXTRA_SNIPPETS,
    ...REACT_HOOKS_SNIPPETS,
    ...REACT_COMPONENT_SNIPPETS,
    ...REACT_PATTERN_SNIPPETS,
    ...REACT_EXTRA_SNIPPETS,
    ...JSON_CONFIG_SNIPPETS,
    ...JSON_DATA_SNIPPETS,
    ...GO_SNIPPETS,
    ...RUST_SNIPPETS,
    ...SHELL_SNIPPETS,
    ...FINAL_BATCH_SNIPPETS,
  ];
}

export function getExpandedCodeCount(): number {
  return getAllExpandedCodeSnippets().length;
}
