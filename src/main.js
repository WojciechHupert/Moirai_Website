import './style.css'
import React from 'react';
import { createRoot } from 'react-dom/client';
import GraphApp from './GraphApp';

const STUDIO_FULL_IMAGES = {
  'src/assets/studio/system-settings.png': new URL('./assets/studio/system-settings.png', import.meta.url).href,
  'src/assets/studio/activity-graph.png': new URL('./assets/studio/activity-graph.png', import.meta.url).href,
  'src/assets/studio/latency-throughput.png': new URL('./assets/studio/latency-throughput.png', import.meta.url).href,
  'src/assets/studio/subjects-registry.png': new URL('./assets/studio/subjects-registry.png', import.meta.url).href,
  'src/assets/studio/archives-summaries.png': new URL('./assets/studio/archives-summaries.png', import.meta.url).href,
};

// Mount React force graph into the hero
const graphMount = document.getElementById('force-graph-mount');
if (graphMount) {
  const root = createRoot(graphMount);
  root.render(React.createElement(GraphApp));
}

/**
 * Lightbox System for CPS Studio Gallery
 */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const captionText = document.getElementById('caption');
  const closeBtn = document.querySelector('.close-modal');
  const lightboxTriggers = document.querySelectorAll('.cps-interface-slide');

  if (!lightbox || !lightboxImg || !lightboxTriggers.length) return;

  lightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const img = trigger.querySelector('img');
      const dataFull = trigger.getAttribute('data-full');
      const fullSrc = (dataFull && STUDIO_FULL_IMAGES[dataFull]) || dataFull || img?.currentSrc || img?.getAttribute('src');
      const altText = img ? img.getAttribute('alt') : '';

      if (!fullSrc) return;

      lightbox.style.display = 'block';
      lightboxImg.src = fullSrc;
      captionText.textContent = altText;
      document.body.style.overflow = 'hidden'; // Prevent scrolling
      closeBtn?.focus();
    });
  });

  const closeLightbox = () => {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxImg || e.target === closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function initCarousel() {
  const carousels = document.querySelectorAll('[data-carousel]');
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    const getScrollAmount = () => {
      const firstSlide = track.querySelector('.cps-interface-slide');
      if (!firstSlide) return 320;
      const gap = 14;
      return firstSlide.getBoundingClientRect().width + gap;
    };

    const updateButtons = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      prev.style.opacity = scrollLeft <= 10 ? '0' : '1';
      prev.style.pointerEvents = scrollLeft <= 10 ? 'none' : 'auto';
      next.style.opacity = scrollLeft + clientWidth >= scrollWidth - 10 ? '0' : '1';
      next.style.pointerEvents = scrollLeft + clientWidth >= scrollWidth - 10 ? 'none' : 'auto';
    };

    prev.addEventListener('click', () => {
      track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateButtons);
    // Use a small timeout to ensure track is rendered for initial check
    setTimeout(updateButtons, 100);
    window.addEventListener('resize', updateButtons);
  });
}

function initFaqAccordion() {
  const accordions = document.querySelectorAll('[data-accordion]');
  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const items = accordion.querySelectorAll('.faq-item');

    items.forEach((item) => {
      const trigger = item.querySelector('.faq-trigger');
      const panel = trigger ? document.getElementById(trigger.getAttribute('aria-controls') || '') : null;
      if (!trigger) return;

      const setOpenState = (open) => {
        item.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
        panel?.setAttribute('aria-hidden', String(!open));
        panel?.toggleAttribute('inert', !open);
      };

      setOpenState(false);

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        items.forEach((entry) => {
          const entryTrigger = entry.querySelector('.faq-trigger');
          const entryPanel = entryTrigger ? document.getElementById(entryTrigger.getAttribute('aria-controls') || '') : null;
          entry.classList.remove('is-open');
          entryTrigger?.setAttribute('aria-expanded', 'false');
          entryPanel?.setAttribute('aria-hidden', 'true');
          entryPanel?.toggleAttribute('inert', true);
        });

        if (!isOpen) {
          setOpenState(true);
        }
      });
    });
  });
}

function copyTextWithFallback(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
  }

  return fallbackCopyText(text);
}

function fallbackCopyText(text) {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }

    textarea.remove();

    if (copied) {
      resolve();
    } else {
      reject(new Error('Clipboard copy failed'));
    }
  });
}

function getPanelCopyText(panel) {
  const content = panel.querySelector('.use-case-tile-panel-inner');
  if (!content) return '';

  const clone = content.cloneNode(true);
  clone.querySelectorAll('button').forEach((button) => button.remove());
  return clone.innerText
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function initUseCaseCards() {
  const groups = document.querySelectorAll('[data-use-cases]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const cards = group.querySelectorAll('.use-case-tile');

    cards.forEach((card) => {
      const trigger = card.querySelector('.use-case-tile-toggle');
      const panel = trigger ? document.getElementById(trigger.getAttribute('aria-controls') || '') : null;
      const label = trigger?.querySelector('.use-case-toggle-label');
      const icon = trigger?.querySelector('.use-case-toggle-icon');
      const copyButton = card.querySelector('.use-case-copy-button');
      if (!trigger) return;

      const setOpenState = (open) => {
        card.classList.toggle('is-expanded', open);
        trigger.setAttribute('aria-expanded', String(open));
        panel?.setAttribute('aria-hidden', String(!open));
        panel?.toggleAttribute('inert', !open);
        if (label) label.textContent = open ? 'Close' : 'Read more';
        if (icon) icon.textContent = open ? '-' : '+';
      };

      setOpenState(false);

      trigger.addEventListener('click', () => {
        const nextOpen = !card.classList.contains('is-expanded');
        setOpenState(nextOpen);
      });

      copyButton?.addEventListener('click', async () => {
        if (!panel) return;

        const text = getPanelCopyText(panel);
        if (!text) return;

        const originalLabel = copyButton.dataset.originalLabel || copyButton.textContent || 'Copy text';
        copyButton.dataset.originalLabel = originalLabel;

        try {
          await copyTextWithFallback(text);
          copyButton.textContent = 'Copied.';
          copyButton.classList.add('is-copied');
          window.clearTimeout(copyButton._copyResetTimer);
          copyButton._copyResetTimer = window.setTimeout(() => {
            copyButton.textContent = originalLabel;
            copyButton.classList.remove('is-copied');
          }, 1600);
        } catch (error) {
          copyButton.textContent = 'Copy failed';
          window.clearTimeout(copyButton._copyResetTimer);
          copyButton._copyResetTimer = window.setTimeout(() => {
            copyButton.textContent = originalLabel;
          }, 1600);
        }
      });
    });
  });
}

// Initialize the system
document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initCarousel();
  initFaqAccordion();
  initUseCaseCards();

  // Auto-initialize visualization
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('moirai-initialize'));
    const hero = document.querySelector('.hero');
    if (hero) hero.classList.add('graph-active');
  }, 500);

  // Update status numbers randomly to simulate "processing"
  const statusItems = document.querySelectorAll('.status-item span:last-child');

  setInterval(() => {
    statusItems.forEach(item => {
      if (item.innerText.includes('%')) {
        const current = parseFloat(item.innerText);
        const next = (current + (Math.random() * 0.02 - 0.01)).toFixed(2);
        item.innerText = `${next}%`;
      }
    });
  }, 3000);

  // System Log Simulation
  const logContainer = document.getElementById('log-container');
  const logMessages = [
    '> NEURAL_RECORD: New high-fidelity fact extracted [Type: IDT]',
    '> DURABLE_STORAGE: Persisting cognitive preference for Subject 2',
    '> KNOWLEDGE_FLOW: Subject 5 → Subject 2 [Social Hop: 1]',
    '> RECALL_FILTER: Fading older memory details for Subject 4',
    '> SYNTHESIS: Distilling durable facts from Subject 1 interactions',
    '> INTENT_FLOW: Subject 3 goal → ACTIVATED',
    '> SCHEMA_SYNC: Historical records validated',
    '> PRIVACY_GATE: Protecting private thoughts from social spread',
    '> RECALL_BALANCE: Organizing memory tiers for efficiency',
    '> SOCIAL_ROUTING: Identifying eligible recipients in shared circles',
    '> DRIFT_MONITOR: Subject 5 hearsay reaching propagation limit',
    '> RECALL_STABILITY: Adjusting memory clarity for Subject 6',
    '> VITALITY_MONITOR: System latency stable, memory depth increasing',
    '> SUBJECT_WEAVER: Subject 1 identity refined and updated',
    '> LOOP_SUPPRESSION: Preventing redundant gossip cycles',
    '> [INFO] ENGINE_HEALTH: Narrative processing active',
    '> TEMPORAL_CHAIN: Linking Subject 2 experiences chronologically'
  ];

  if (logContainer) {
    setInterval(() => {
      const msg = document.createElement('div');
      msg.innerText = logMessages[Math.floor(Math.random() * logMessages.length)];
      logContainer.prepend(msg);
      if (logContainer.children.length > 15) {
        logContainer.lastElementChild.remove();
      }
    }, 2000);
  }
});
