import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Domínios de Produção
 * Validação completa da arquitetura HarvestPilot
 */

test.describe('Produção - Domínios HarvestPilot', () => {

  test('API - Root endpoint deve retornar info da API', async ({ request }) => {
    const response = await request.get('https://api.harvestpilot.online');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBe('HarvestPilot API');
    expect(data.status).toBe('online');
    expect(data.version).toBe('1.0.0');
    expect(data.endpoints).toHaveProperty('api', '/api/v1');
    expect(data.endpoints).toHaveProperty('documentation', '/api/docs');
    expect(data.endpoints).toHaveProperty('health', '/health');
  });

  test('API - Health endpoint deve retornar status OK', async ({ request }) => {
    const response = await request.get('https://api.harvestpilot.online/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.environment).toBe('production');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
  });

  test('Frontend BO - Deve carregar página de login', async ({ page }) => {
    await page.goto('https://bo.harvestpilot.online');

    // Verificar título
    await expect(page).toHaveTitle(/HarvestPilot/);

    // Verificar que é HTML (não JSON da API)
    const contentType = await page.evaluate(() => document.contentType);
    expect(contentType).toContain('html');

    // Verificar elementos da página de login
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Verificar texto "HarvestPilot" na página
    await expect(page.locator('text=HarvestPilot')).toBeVisible();
  });

  test('Frontend APP - Deve carregar página de login', async ({ page }) => {
    await page.goto('https://app.harvestpilot.online');

    // Verificar título
    await expect(page).toHaveTitle(/HarvestPilot/);

    // Verificar que é HTML (não JSON da API)
    const contentType = await page.evaluate(() => document.contentType);
    expect(contentType).toContain('html');

    // Verificar elementos da página de login
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('API Docs - Swagger UI deve carregar', async ({ page }) => {
    await page.goto('https://api.harvestpilot.online/api/docs');

    // Aguardar Swagger UI carregar
    await page.waitForSelector('.swagger-ui', { timeout: 10000 });

    // Verificar elementos do Swagger
    await expect(page.locator('.swagger-ui')).toBeVisible();
    await expect(page.locator('text=HarvestPilot API')).toBeVisible();
  });

  test('CORS - API deve aceitar requisições do frontend BO', async ({ request }) => {
    const response = await request.get('https://api.harvestpilot.online/health', {
      headers: {
        'Origin': 'https://bo.harvestpilot.online'
      }
    });

    expect(response.ok()).toBeTruthy();

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('https://bo.harvestpilot.online');
    expect(headers['access-control-allow-credentials']).toBe('true');
  });

  test('CORS - API deve aceitar requisições do frontend APP', async ({ request }) => {
    const response = await request.get('https://api.harvestpilot.online/health', {
      headers: {
        'Origin': 'https://app.harvestpilot.online'
      }
    });

    expect(response.ok()).toBeTruthy();

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('https://app.harvestpilot.online');
    expect(headers['access-control-allow-credentials']).toBe('true');
  });

  test('Performance - API deve responder em < 2 segundos', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('https://api.harvestpilot.online/health');
    const duration = Date.now() - start;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('Performance - Frontend BO deve carregar em < 5 segundos', async ({ page }) => {
    const start = Date.now();
    await page.goto('https://bo.harvestpilot.online');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000);
  });

  test('SSL/HTTPS - Todos os domínios devem ter certificados válidos', async ({ request }) => {
    // Testar API
    const apiResponse = await request.get('https://api.harvestpilot.online');
    expect(apiResponse.ok()).toBeTruthy();

    // Testar BO
    const boResponse = await request.get('https://bo.harvestpilot.online');
    expect(boResponse.ok() || boResponse.status() === 307).toBeTruthy();

    // Testar APP
    const appResponse = await request.get('https://app.harvestpilot.online');
    expect(appResponse.ok() || appResponse.status() === 307).toBeTruthy();
  });
});
