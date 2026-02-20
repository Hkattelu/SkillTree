export class SkillTree {
  constructor(containerSelector, data, options = {}) {
    this.container = typeof containerSelector === 'string' 
      ? document.querySelector(containerSelector) 
      : containerSelector;
    
    if (!this.container) {
      throw new Error(`SkillTree: Container '${containerSelector}' not found.`);
    }

    this.data = JSON.parse(JSON.stringify(data)); // Deep copy
    this.options = {
      orientation: 'horizontal', // or 'vertical'
      theme: {
        primary: '#00f0ff', // Cyberpunk cyan
        secondary: '#7000ff', // Cyberpunk purple
        background: '#0a0a0a',
        text: '#ffffff',
        nodeSize: 80,
        gap: 100,
        ...options.theme
      },
      ...options
    };

    this.nodes = new Map();
    this.layers = [];
    this.svg = null;
    this.resizeObserver = null;

    this.init();
  }

  init() {
    this.container.classList.add('st-container');
    this.container.style.setProperty('--st-primary', this.options.theme.primary);
    this.container.style.setProperty('--st-secondary', this.options.theme.secondary);
    this.container.style.setProperty('--st-bg', this.options.theme.background);
    this.container.style.setProperty('--st-text', this.options.theme.text);
    this.container.style.setProperty('--st-node-size', `${this.options.theme.nodeSize}px`);
    this.container.style.setProperty('--st-gap', `${this.options.theme.gap}px`);

    this.processData();
    this.renderLayout();
    this.bindEvents();
    
    // Initial draw might be too early for correct coordinates if images haven't loaded, 
    // but ResizeObserver will catch the subsequent layout stability.
    this.resizeObserver = new ResizeObserver(() => {
      this.drawConnections();
    });
    this.resizeObserver.observe(this.container);
    
    // Trigger initial animation
    requestAnimationFrame(() => this.container.classList.add('st-loaded'));
  }

  processData() {
    // 1. Map ID to Node and Initialize
    this.data.forEach(item => {
      this.nodes.set(item.id, {
        ...item,
        children: [],
        parents: [],
        layer: 0,
        element: null
      });
    });

    // 2. Build Relationships
    this.nodes.forEach(node => {
      if (node.dependsOn && Array.isArray(node.dependsOn)) {
        node.dependsOn.forEach(parentId => {
          const parent = this.nodes.get(parentId);
          if (parent) {
            parent.children.push(node.id);
            node.parents.push(parentId);
          }
        });
      }
    });

    // 3. Calculate Layers (Topological-ish Sort)
    // Simple approach: Layer = Max(Parent Layers) + 1
    // We iterate until stable to handle deep trees.
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 100) {
      changed = false;
      this.nodes.forEach(node => {
        if (node.parents.length > 0) {
          const maxParentLayer = Math.max(...node.parents.map(pid => this.nodes.get(pid).layer));
          if (node.layer <= maxParentLayer) {
            node.layer = maxParentLayer + 1;
            changed = true;
          }
        }
      });
      iterations++;
    }

    // 4. Group by Layer
    const layers = [];
    this.nodes.forEach(node => {
      if (!layers[node.layer]) layers[node.layer] = [];
      layers[node.layer].push(node);
    });
    this.layers = layers;
  }

  renderLayout() {
    this.container.innerHTML = '';
    
    // Create SVG Layer for connections
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.classList.add('st-connections');
    this.container.appendChild(this.svg);

    // Create DOM Layer for nodes
    const grid = document.createElement('div');
    grid.classList.add('st-grid');
    if (this.options.orientation === 'vertical') {
      grid.classList.add('st-vertical');
    }
    
    this.layers.forEach((layerNodes, layerIndex) => {
      const column = document.createElement('div');
      column.classList.add('st-layer');
      
      layerNodes.forEach(node => {
        const el = this.createNodeElement(node);
        node.element = el;
        column.appendChild(el);
      });
      
      grid.appendChild(column);
    });

    this.container.appendChild(grid);
  }

  createNodeElement(node) {
    const el = document.createElement('div');
    el.classList.add('st-node');
    el.dataset.id = node.id;
    el.tabIndex = 0; // Make focusable

    // Hierarchy Classes
    if (node.layer === 0) el.classList.add('st-node-root');
    if (node.children.length === 0) el.classList.add('st-node-leaf');

    // Status Classes
    const isCompleted = node.points >= 100;
    const isStarted = node.points > 0 && node.points < 100;
    
    // Check if locked (if any parent is not completed)
    const isLocked = node.parents.some(pid => {
        const p = this.nodes.get(pid);
        return !p || (p.points || 0) < 100;
    });

    if (isLocked) {
        el.classList.add('st-locked');
    } else if (isCompleted) {
        el.classList.add('st-completed');
    } else if (isStarted) {
        el.classList.add('st-started');
    } else {
        el.classList.add('st-unlocked'); // Available but not started
    }

    // Icon
    if (node.iconPath) {
      const iconContainer = document.createElement('div');
      iconContainer.classList.add('st-node-icon');
      const img = document.createElement('img');
      img.src = node.iconPath;
      img.alt = node.title;
      iconContainer.appendChild(img);
      el.appendChild(iconContainer);
    } else {
        // Fallback text icon
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('st-node-icon', 'text-fallback');
        iconContainer.textContent = node.title.substring(0, 2).toUpperCase();
        el.appendChild(iconContainer);
    }

    // Info Content (Title + desc)
    const content = document.createElement('div');
    content.classList.add('st-node-content');
    
    const header = document.createElement('div');
    header.classList.add('st-node-header');
    
    const title = document.createElement('div');
    title.classList.add('st-node-title');
    title.textContent = node.title;
    
    const meta = document.createElement('div');
    meta.classList.add('st-node-meta');
    meta.textContent = isLocked ? 'LOCKED' : (isCompleted ? 'MASTERED' : `${node.points}%`);

    header.appendChild(title);
    header.appendChild(meta);
    
    const desc = document.createElement('div');
    desc.classList.add('st-node-desc');
    desc.textContent = node.description || '';

    content.appendChild(header);
    content.appendChild(desc);
    el.appendChild(content);

    // Progress Bar (Visual only)
    if (!isLocked) {
        const progress = document.createElement('div');
        progress.classList.add('st-progress-bar');
        const fill = document.createElement('div');
        fill.style.width = `${node.points}%`;
        progress.appendChild(fill);
        el.appendChild(progress);
    }

    return el;
  }

  drawConnections() {
    if (!this.svg) return;
    
    // Clear existing paths
    this.svg.innerHTML = '';
    
    // Update SVG dimensions to match container scroll area
    const rect = this.container.getBoundingClientRect();
    const scrollWidth = this.container.scrollWidth;
    const scrollHeight = this.container.scrollHeight;
    
    this.svg.setAttribute('width', scrollWidth);
    this.svg.setAttribute('height', scrollHeight);
    
    // Create definitions for markers (arrowheads)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', this.options.theme.primary);
    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    // Draw paths
    const containerRect = this.container.getBoundingClientRect();
    const offsetX = this.container.scrollLeft;
    const offsetY = this.container.scrollTop;

    this.nodes.forEach(node => {
      node.parents.forEach(parentId => {
        const parent = this.nodes.get(parentId);
        if (!parent || !parent.element || !node.element) return;

        const pRect = parent.element.getBoundingClientRect();
        const cRect = node.element.getBoundingClientRect();

        // Calculate relative coordinates including scroll offset
        const startX = (pRect.right - containerRect.left) + offsetX;
        const startY = (pRect.top + pRect.height / 2 - containerRect.top) + offsetY;
        
        const endX = (cRect.left - containerRect.left) + offsetX;
        const endY = (cRect.top + cRect.height / 2 - containerRect.top) + offsetY;

        // Path Logic: Orthogonal / Manhattan Routing (Brutalist)
        // Horizontal: Start -> (Mid X, Start Y) -> (Mid X, End Y) -> End
        const deltaX = endX - startX;
        const midX = startX + deltaX * 0.5;

        const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.classList.add('st-path');
        
        // Add classes for interactivity
        path.dataset.from = parent.id;
        path.dataset.to = node.id;

        this.svg.appendChild(path);
      });
    });
  }

  bindEvents() {
    // Delegation for node interactions
    this.container.addEventListener('click', (e) => {
      const nodeEl = e.target.closest('.st-node');
      if (nodeEl) {
        this.handleNodeClick(nodeEl.dataset.id);
      }
    });

    this.container.addEventListener('mouseover', (e) => {
      const nodeEl = e.target.closest('.st-node');
      if (nodeEl) {
        this.highlightConnections(nodeEl.dataset.id, true);
      }
    });

    this.container.addEventListener('mouseout', (e) => {
      const nodeEl = e.target.closest('.st-node');
      if (nodeEl) {
        this.highlightConnections(nodeEl.dataset.id, false);
      }
    });
  }

  handleNodeClick(id) {
    const node = this.nodes.get(parseInt(id) || id);
    if (node) {
      console.log('Skill clicked:', node);
      // Dispatch custom event
      this.container.dispatchEvent(new CustomEvent('skillclick', { detail: node }));
      
      // Toggle active state
      this.container.querySelectorAll('.st-node.active').forEach(el => el.classList.remove('active'));
      node.element.classList.add('active');
    }
  }

  highlightConnections(id, active) {
    const node = this.nodes.get(parseInt(id) || id);
    if (!node) return;

    // Helper to traverse and highlight
    const traverse = (currentId, direction, visited = new Set()) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      
      const currentNode = this.nodes.get(currentId);
      if (!currentNode) return;

      if (active) currentNode.element.classList.add('st-highlight');
      else currentNode.element.classList.remove('st-highlight');

      if (direction === 'parents' || direction === 'both') {
        currentNode.parents.forEach(pid => {
          // Find path
          const path = this.svg.querySelector(`path[data-from="${pid}"][data-to="${currentId}"]`);
          if (path) {
             if (active) path.classList.add('st-path-highlight');
             else path.classList.remove('st-path-highlight');
          }
          traverse(pid, 'parents', visited);
        });
      }

      if (direction === 'children' || direction === 'both') {
        currentNode.children.forEach(cid => {
          const path = this.svg.querySelector(`path[data-from="${currentId}"][data-to="${cid}"]`);
          if (path) {
             if (active) path.classList.add('st-path-highlight');
             else path.classList.remove('st-path-highlight');
          }
          traverse(cid, 'children', visited);
        });
      }
    };

    traverse(node.id, 'both');
  }
}
