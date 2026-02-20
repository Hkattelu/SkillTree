# SkillTree

A bold, modern, and dependency-free vanilla JS skill tree component. Perfect for showcasing technical progression or rpg-style skill trees in web applications.

## Features

- **Zero Dependencies:** Pure Vanilla JS and CSS.
- **Auto-Layout:** Automatically arranges nodes in layers based on dependencies.
- **SVG Connections:** Smooth, cubic-bezier connectors between nodes.
- **Interactive:** Hover effects highlight entire dependency chains (ancestors and descendants).
- **Themable:** Built with CSS variables for easy customization (Cyberpunk, Sci-Fi, Minimalist).
- **Responsive:** Works on desktop and mobile.

## Usage

1. **Include the CSS:**
   ```html
   <link href="skilltree.css" rel="stylesheet">
   ```

2. **Prepare your container:**
   ```html
   <div id="skill-tree"></div>
   ```

3. **Initialize the component:**
   ```javascript
   import { SkillTree } from './skilltree.js';

   const data = [
     {
       id: 'html',
       title: 'HTML5',
       description: 'Semantic markup',
       points: 100
     },
     {
       id: 'css',
       title: 'CSS3',
       description: 'Style and Layout',
       dependsOn: ['html'], // Define dependencies by ID
       points: 80
     }
   ];

   const tree = new SkillTree('#skill-tree', data, {
     theme: {
       primary: '#00f0ff', // Accent color
       secondary: '#ff003c', // Secondary accent
       background: '#111', // Background color
       nodeSize: 80, // Size of nodes in px
       gap: 100 // Gap between nodes
     }
   });
   ```

## Configuration

### Node Data Structure
```javascript
{
  id: string | number,  // Unique identifier
  title: string,        // Display name
  description: string,  // Tooltip/Info text
  iconPath: string,     // URL to icon image (optional)
  dependsOn: [],        // Array of parent IDs
  points: number        // 0-100 (optional, affects progress ring)
}
```

### Options
- `orientation`: 'horizontal' (default) or 'vertical' (experimental).
- `theme`: Object containing color and size overrides.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
