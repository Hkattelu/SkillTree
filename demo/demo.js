import { SkillTree } from '../skilltree.js';
import { skillConfig } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the Skill Tree
  const container = document.getElementById('skill-tree-wrapper');
  
  const tree = new SkillTree(container, skillConfig, {
    theme: {
      primary: '#00f0ff', // Cyberpunk cyan
      secondary: '#ff003c', // Cyberpunk red/pink
      nodeSize: 80,
      gap: 120
    }
  });

  // Example: Listen for skill clicks
  const detailPanel = document.getElementById('selected-skill');
  const titleEl = document.getElementById('skill-title');
  const descEl = document.getElementById('skill-desc');

  container.addEventListener('skillclick', (e) => {
    const skill = e.detail;
    titleEl.textContent = skill.title;
    descEl.textContent = skill.description;
    
    detailPanel.classList.add('visible');
    
    // Auto-hide after 5 seconds
    if (window.detailTimeout) clearTimeout(window.detailTimeout);
    window.detailTimeout = setTimeout(() => {
        detailPanel.classList.remove('visible');
    }, 5000);
  });
  
  // Button Controls
  document.getElementById('reset-view').addEventListener('click', () => {
      // Could implement zoom reset here
      container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });

  let altTheme = false;
  document.getElementById('toggle-theme').addEventListener('click', () => {
    altTheme = !altTheme;
    if (altTheme) {
        container.style.setProperty('--st-primary', '#ffcc00'); // Gold
        container.style.setProperty('--st-secondary', '#ffffff');
        container.style.setProperty('--st-bg', '#2a1a05'); // Dark brown/gold bg
    } else {
        container.style.setProperty('--st-primary', '#00f0ff');
        container.style.setProperty('--st-secondary', '#ff003c');
        container.style.setProperty('--st-bg', '#0a0a0a');
    }
  });
});
