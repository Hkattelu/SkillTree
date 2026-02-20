// See https://simpleicons.org/ for icons
const BASE_PATH = 'https://cdn.jsdelivr.net/npm/simple-icons@14.0.1/icons/';

function icon(name) {
  return `${BASE_PATH}${name}.svg`;
}

export const skillConfig = [
  // --- CORE FOUNDATION ---
  {
    id: 'core-web',
    title: 'Web Fundamentals',
    description: 'The bedrock of the web: HTML, CSS, and HTTP.',
    points: 100,
    iconPath: icon('html5')
  },
  {
    id: 'js-core',
    title: 'JavaScript Deep Dive',
    description: 'Closures, Event Loop, Prototypes, and ESNext.',
    points: 90,
    iconPath: icon('javascript'),
    dependsOn: ['core-web']
  },
  
  // --- FRONTEND BRANCH ---
  {
    id: 'ui-frameworks',
    title: 'Modern UI Frameworks',
    description: 'React, Vue, Svelte. Component architecture.',
    points: 85,
    iconPath: icon('react'),
    dependsOn: ['js-core']
  },
  {
    id: 'state-mgmt',
    title: 'State Management',
    description: 'Redux, Zustand, Context API mastery.',
    points: 70,
    iconPath: icon('redux'),
    dependsOn: ['ui-frameworks']
  },
  {
    id: 'a11y',
    title: 'Accessibility',
    description: 'WCAG guidelines, semantic HTML, and ARIA.',
    points: 60,
    iconPath: icon('w3c'),
    dependsOn: ['ui-frameworks']
  },

  // --- BACKEND BRANCH ---
  {
    id: 'server-side',
    title: 'Server Runtime',
    description: 'Node.js, Deno, or Bun. Asynchronous I/O.',
    points: 80,
    iconPath: icon('nodedotjs'),
    dependsOn: ['js-core']
  },
  {
    id: 'db-sql',
    title: 'Relational DB',
    description: 'PostgreSQL, normalization, complex joins.',
    points: 75,
    iconPath: icon('postgresql'),
    dependsOn: ['server-side']
  },
  {
    id: 'api-design',
    title: 'API Architecture',
    description: 'REST, GraphQL, gRPC patterns.',
    points: 65,
    iconPath: icon('graphql'),
    dependsOn: ['server-side']
  },

  // --- ADVANCED / DEVOPS ---
  {
    id: 'containers',
    title: 'Containerization',
    description: 'Docker, Podman, OCI standards.',
    points: 50,
    iconPath: icon('docker'),
    dependsOn: ['server-side']
  },
  {
    id: 'cloud-native',
    title: 'Cloud Native',
    description: 'Kubernetes, Serverless, IaC.',
    points: 40,
    iconPath: icon('kubernetes'),
    dependsOn: ['containers', 'db-sql']
  },
  
  // --- AI SPECIALIZATION ---
  {
    id: 'ai-integration',
    title: 'AI Engineering',
    description: 'LLM integration, RAG pipelines, Prompt Engineering.',
    points: 30,
    iconPath: icon('openai'),
    dependsOn: ['api-design', 'js-core'] // Hybrid dependency
  }
];
