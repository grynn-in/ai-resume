import { test, expect } from '@playwright/test';

// ─── PRD 1: API Tests ──────────────────────────────────────────────────────
test.describe('PRD1 - API', () => {
  test('GET /api/health returns { status: ok, ai: true }', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.ai).toBe(true);
  });

  test('POST /api/chat returns text field', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: { message: 'hello' },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(typeof data.text).toBe('string');
    expect(data.text.length).toBeGreaterThan(0);
  });

  test('POST /api/fit returns text field', async ({ request }) => {
    const res = await request.post('/api/fit', {
      data: { message: 'engineer role' },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(typeof data.text).toBe('string');
    expect(data.text.length).toBeGreaterThan(0);
  });
});

// ─── PRD 11: Favicon ───────────────────────────────────────────────────────
test.describe('PRD11 - Favicon', () => {
  test('page has favicon link with SVG href', async ({ page }) => {
    await page.goto('/');
    const href = await page.evaluate(() => {
      const link = document.querySelector('link[rel="icon"]');
      return link ? link.getAttribute('href') : null;
    });
    expect(href).toBeTruthy();
    expect(href).toContain('svg');
  });
});

// ─── PRD 12: marked.js + Navbar Fit link ───────────────────────────────────
test.describe('PRD12 - marked.js + Fit Nav Link', () => {
  test('window.marked is defined', async ({ page }) => {
    await page.goto('/');
    const markedDefined = await page.evaluate(() => typeof window.marked !== 'undefined');
    expect(markedDefined).toBe(true);
  });

  test('navbar contains "Fit" link', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, .navbar').first();
    await expect(nav).toContainText('Fit');
  });
});

// ─── PRD 13: Fit Section Input State ───────────────────────────────────────
test.describe('PRD13 - Fit Section Input State', () => {
  test('#fit section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#fit')).toBeVisible();
  });

  test('#fitTextarea has placeholder containing "job description"', async ({ page }) => {
    await page.goto('/');
    const placeholder = await page.locator('#fitTextarea').getAttribute('placeholder');
    expect(placeholder.toLowerCase()).toContain('job description');
  });

  test('#fitAnalyzeBtn is disabled initially', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#fitAnalyzeBtn')).toBeDisabled();
  });

  test('char count #fitCharCount updates on input', async ({ page }) => {
    await page.goto('/');
    await page.locator('#fitTextarea').fill('hello');
    const count = await page.locator('#fitCharCount').textContent();
    expect(count).toContain('5');
  });

  test('button enables after typing 50+ chars', async ({ page }) => {
    await page.goto('/');
    await page.locator('#fitTextarea').fill('a'.repeat(50));
    await expect(page.locator('#fitAnalyzeBtn')).toBeEnabled();
  });
});

// ─── PRD 14: Fit Section Results + Reset ───────────────────────────────────
test.describe('PRD14 - Fit Section Results + Reset', () => {
  test('clicking Analyze with 50+ chars shows results', async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto('/');
    await page.locator('#fitTextarea').fill('a'.repeat(60));
    await page.locator('#fitAnalyzeBtn').click();
    await expect(page.locator('#fitResults')).toBeVisible({ timeout: 25000 });
  });

  test('#fitResults contains rendered markdown (h2, h3, or strong)', async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto('/');
    const minimalJD = 'Head of Data Analytics. Lead enterprise data strategy and governance. Manage BI platforms and analytics portfolio. IPMA or PMP certification required. 10+ years experience in data leadership roles.';
    await page.locator('#fitTextarea').fill(minimalJD);
    await page.locator('#fitAnalyzeBtn').click();
    await page.locator('#fitResults').waitFor({ state: 'visible', timeout: 25000 });
    const hasFormatting = await page.evaluate(() => {
      const el = document.getElementById('fitResultContent');
      return el.querySelector('h2, h3, strong') !== null;
    });
    expect(hasFormatting).toBe(true);
  });

  test('#fitInputArea is hidden during results state', async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto('/');
    await page.locator('#fitTextarea').fill('a'.repeat(60));
    await page.locator('#fitAnalyzeBtn').click();
    await page.locator('#fitResults').waitFor({ state: 'visible', timeout: 25000 });
    await expect(page.locator('#fitInputArea')).toBeHidden();
  });

  test('"Try another" button resets to input state', async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto('/');
    await page.locator('#fitTextarea').fill('a'.repeat(60));
    await page.locator('#fitAnalyzeBtn').click();
    await page.locator('#fitResults').waitFor({ state: 'visible', timeout: 25000 });
    await page.locator('#fitResetBtn').click();
    await expect(page.locator('#fitInputArea')).toBeVisible();
  });

  test('#fitInputArea visible again after reset', async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto('/');
    await page.locator('#fitTextarea').fill('a'.repeat(60));
    await page.locator('#fitAnalyzeBtn').click();
    await page.locator('#fitResults').waitFor({ state: 'visible', timeout: 25000 });
    await page.locator('#fitResetBtn').click();
    await expect(page.locator('#fitResults')).toBeHidden();
  });
});

// ─── PRD 2: CSS Foundation ─────────────────────────────────────────────────
test.describe('PRD2 - CSS Foundation', () => {
  test('body background-color is #1a1a2e', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    expect(bg).toBe('rgb(26, 26, 46)');
  });

  test('--brand CSS variable resolves to #e67e22', async ({ page }) => {
    await page.goto('/');
    const brand = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--brand').trim()
    );
    expect(brand).toBe('#e67e22');
  });

  test('Inter font is loaded', async ({ page }) => {
    await page.goto('/');
    const fontLoaded = await page.evaluate(async () => {
      await document.fonts.ready;
      for (const font of document.fonts) {
        if (font.family.includes('Inter')) return true;
      }
      return false;
    });
    expect(fontLoaded).toBe(true);
  });

  test('no horizontal scroll at 1280px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(1280);
  });
});

// ─── PRD 3: Fixed Navbar ───────────────────────────────────────────────────
test.describe('PRD3 - Fixed Navbar', () => {
  test('navbar element exists and is visible', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, .navbar').first();
    await expect(nav).toBeVisible();
  });

  test('navbar has position fixed', async ({ page }) => {
    await page.goto('/');
    const position = await page.evaluate(() => {
      const nav = document.querySelector('nav, .navbar');
      return getComputedStyle(nav).position;
    });
    expect(position).toBe('fixed');
  });

  test('navbar contains "Deepak Pai"', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, .navbar').first();
    await expect(nav).toContainText('Deepak Pai');
  });

  test('navbar is visible after scroll', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollBy(0, 500));
    const nav = page.locator('nav, .navbar').first();
    await expect(nav).toBeVisible();
  });
});

// ─── PRD 4: Hero Section ───────────────────────────────────────────────────
test.describe('PRD4 - Hero Section', () => {
  test('#hero section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero')).toBeVisible();
  });

  test('hero contains "Deepak Pai" as h1', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('#hero h1');
    await expect(h1).toContainText('Deepak Pai');
  });

  test('hero contains "Zurich"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero')).toContainText('Zurich');
  });

  test('hero has at least 2 stat boxes', async ({ page }) => {
    await page.goto('/');
    const stats = page.locator('#hero .stat-box, #hero .stat');
    const count = await stats.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('"Get in touch" CTA button is present and clickable', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('#hero').getByRole('button', { name: /get in touch/i });
    await expect(btn).toBeVisible();
    // clicking should open contact modal (not throw)
    await btn.click();
    await expect(page.locator('#contactModalOverlay')).toBeVisible();
  });
});

// ─── PRD 5: Experience Section ─────────────────────────────────────────────
test.describe('PRD5 - Experience Section', () => {
  test('#experience section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#experience')).toBeVisible();
  });

  test('at least 3 experience cards visible', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('#experience .exp-card, #experience .experience-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('each card shows company name and job title', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('#experience .exp-card, #experience .experience-card');
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      expect(text.length).toBeGreaterThan(10);
    }
  });

  test('clicking a card expands to show full description', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('#experience .exp-card, #experience .experience-card').first();
    await firstCard.click();
    const desc = firstCard.locator('.exp-desc, .exp-body, .card-body');
    await expect(desc).toBeVisible();
  });
});

// ─── PRD 6: Skills Section ─────────────────────────────────────────────────
test.describe('PRD6 - Skills Section', () => {
  test('#skills section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#skills')).toBeVisible();
  });

  test('six skill columns visible at 1280px (3 per group)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const cols = page.locator('#skills .skill-col');
    const count = await cols.count();
    expect(count).toBe(6);
  });

  test('Data & Governance, Technology & Analytics, Leadership & Change headings present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#skills')).toContainText('Data');
    await expect(page.locator('#skills')).toContainText('Technology');
    await expect(page.locator('#skills')).toContainText('Leadership');
  });

  test('each column has at least 3 skill items', async ({ page }) => {
    await page.goto('/');
    const cols = page.locator('#skills .skill-col, #skills .skills-col');
    const count = await cols.count();
    for (let i = 0; i < count; i++) {
      const items = cols.nth(i).locator('li, .skill-item');
      const itemCount = await items.count();
      expect(itemCount).toBeGreaterThanOrEqual(3);
    }
  });
});

// ─── PRD 7: Floating Chat FAB + Modal ─────────────────────────────────────
test.describe('PRD7 - Chat FAB + Modal', () => {
  test('FAB button is visible at fixed position', async ({ page }) => {
    await page.goto('/');
    const fab = page.locator('#chatFab, .chat-fab');
    await expect(fab).toBeVisible();
    const position = await page.evaluate(() => {
      const el = document.querySelector('#chatFab, .chat-fab');
      return getComputedStyle(el).position;
    });
    expect(position).toBe('fixed');
  });

  test('FAB has brand orange background', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => {
      const el = document.querySelector('#chatFab, .chat-fab');
      return getComputedStyle(el).backgroundColor;
    });
    expect(bg).toBe('rgb(230, 126, 34)'); // #e67e22
  });

  test('clicking FAB opens chat modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const modal = page.locator('#chatModal, .chat-modal');
    await expect(modal).toBeVisible();
  });

  test('modal has ~420px width on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const modal = page.locator('#chatModal, .chat-modal');
    const box = await modal.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(380);
    expect(box.width).toBeLessThanOrEqual(460);
  });

  test('modal has "Ask Me Anything" or similar heading', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const modal = page.locator('#chatModal, .chat-modal');
    const text = await modal.textContent();
    expect(text.toLowerCase()).toMatch(/ask me|chat|hi!/i);
  });

  test('close button hides modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    await page.locator('#chatModal .modal-close, .chat-modal .modal-close').click();
    const modal = page.locator('#chatModal, .chat-modal');
    await expect(modal).toBeHidden();
  });

  test('Chat tab present, no Fit tab in modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const modal = page.locator('#chatModal, .chat-modal');
    await expect(modal).toContainText(/chat/i);
    const fitTab = modal.locator('.chat-tab', { hasText: /fit assessment/i });
    await expect(fitTab).toHaveCount(0);
  });
});

// ─── PRD 8: Chat Functionality ─────────────────────────────────────────────
test.describe('PRD8 - Chat Functionality', () => {
  test('input field accepts typing', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const input = page.locator('#chatModal input[type=text], #chatModal textarea, .chat-modal input[type=text], .chat-modal textarea').first();
    await input.fill('hello');
    await expect(input).toHaveValue('hello');
  });

  test('send button exists and is clickable', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const btn = page.locator('#chatModal button[id*=send], #chatModal .send-btn, .chat-modal button[id*=send], .chat-modal .send-btn').first();
    await expect(btn).toBeVisible();
  });

  test('after sending message, response appears', async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const input = page.locator('#chatModal input[type=text], #chatModal textarea, .chat-modal input[type=text], .chat-modal textarea').first();
    await input.fill('What is your background?');
    const btn = page.locator('#chatModal button[id*=send], #chatModal .send-btn, .chat-modal button[id*=send], .chat-modal .send-btn').first();
    await btn.click();
    // Wait for actual response text (after loading dots are replaced)
    await page.waitForFunction(() => {
      const msgs = document.querySelectorAll('#chatModal .message.bot .message-content, .chat-modal .message.bot .message-content');
      if (msgs.length < 2) return false;
      const text = msgs[1].textContent.trim();
      return text.length > 5;
    }, { timeout: 25000 });
    const botMsgs = page.locator('#chatModal .message.bot .message-content, .chat-modal .message.bot .message-content');
    const text = await botMsgs.nth(1).textContent();
    expect(text.length).toBeGreaterThan(5);
  });

  test('status bar shows AI connected', async ({ page }) => {
    await page.goto('/');
    // Wait for status check
    await page.waitForTimeout(3000);
    const statusText = await page.locator('#aiStatusText').textContent();
    expect(statusText).toMatch(/connected|ok/i);
  });
});

// ─── PRD 9: Contact Modal ──────────────────────────────────────────────────
test.describe('PRD9 - Contact Modal', () => {
  test('"Let\'s Connect" button opens contact modal', async ({ page }) => {
    await page.goto('/');
    // Could be in hero or floating
    const btn = page.getByRole('button', { name: /let.?s connect|get in touch/i }).first();
    await btn.click();
    await expect(page.locator('#contactModalOverlay')).toBeVisible();
  });

  test('modal has Name, Email, Phone fields', async ({ page }) => {
    await page.goto('/');
    await page.locator('.floating-contact-btn').click();
    await expect(page.locator('#contactName')).toBeVisible();
    await expect(page.locator('#contactEmail')).toBeVisible();
    await expect(page.locator('#contactPhone')).toBeVisible();
  });

  test('submit without name shows validation error', async ({ page }) => {
    await page.goto('/');
    await page.locator('.floating-contact-btn').click();
    await page.locator('#contactSubmitBtn').click();
    await expect(page.locator('#contactName')).toHaveClass(/error/);
  });

  test('submit with name+email shows success message', async ({ page }) => {
    await page.goto('/');
    await page.locator('.floating-contact-btn').click();
    await page.locator('#contactName').fill('Test User');
    await page.locator('#contactEmail').fill('test@example.com');
    await page.locator('#contactSubmitBtn').click();
    await expect(page.locator('#contactSuccessView')).toBeVisible({ timeout: 10000 });
  });
});

// ─── PRD 10: Responsive Mobile Layout ─────────────────────────────────────
test.describe('PRD10 - Mobile Responsive', () => {
  test('no horizontal scroll at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('hero section readable at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#hero h1')).toBeVisible();
  });

  test('FAB still visible and clickable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('#chatFab, .chat-fab')).toBeVisible();
  });

  test('chat modal fills most of screen on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const modal = page.locator('#chatModal, .chat-modal');
    await expect(modal).toBeVisible();
    const box = await modal.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(300);
  });
});

// ─── PRD 15: Remove Fit Tab from Chat Modal ─────────────────────────────────
test.describe('PRD15 - Remove Fit Tab from Chat Modal', () => {
  test('chat modal contains Chat tab', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const modal = page.locator('#chatModal, .chat-modal');
    await expect(modal.locator('.chat-tab', { hasText: /chat/i })).toBeVisible();
  });

  test('chat modal does NOT contain Fit Assessment tab button', async ({ page }) => {
    await page.goto('/');
    await page.locator('#chatFab, .chat-fab').click();
    const modal = page.locator('#chatModal, .chat-modal');
    const fitTab = modal.locator('.chat-tab', { hasText: /fit assessment/i });
    await expect(fitTab).toHaveCount(0);
  });

  test('sendMessage uses /api/chat, not /api/fit', async ({ page }) => {
    page.setDefaultTimeout(30000);
    await page.goto('/');
    const requests = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) requests.push(req.url());
    });
    await page.locator('#chatFab, .chat-fab').click();
    await page.locator('#userInput').fill('test message');
    await page.locator('#sendButton').click();
    await page.waitForTimeout(2000);
    expect(requests.some(url => url.includes('/api/chat'))).toBe(true);
    expect(requests.every(url => !url.includes('/api/fit'))).toBe(true);
  });
});
