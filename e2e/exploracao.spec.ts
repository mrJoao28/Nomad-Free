import { expect, test } from "@playwright/test";

test.describe("landing", () => {
  test("mostra hero, busca, regiões, estações e aviso de demonstração", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Encontre");
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Escolha a região" })).toBeVisible();
    await expect(page.getByTestId("hero-card")).toHaveCount(4);
    await expect(page.getByTestId("resort-card").first()).toBeVisible();
    await expect(page.getByTestId("demo-notice")).toBeVisible();
  });

  test("a busca atualiza os parâmetros da URL em /explorar", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Estação, país ou região").fill("zermatt");
    await page.getByLabel("Perfil").selectOption("luxo");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/explorar\?.*q=zermatt/);
    await expect(page).toHaveURL(/perfil=luxo/);
    await expect(page.getByRole("heading", { level: 3, name: "Zermatt" })).toBeVisible();
  });
});

test.describe("explorar", () => {
  test("lista as 100 estações por padrão", async ({ page }) => {
    await page.goto("/explorar");
    await expect(page.getByTestId("results-count")).toContainText("100 resultados");
  });

  test("filtra por região e orçamento e ordena por maior altitude", async ({ page }) => {
    await page.goto("/explorar");
    await page.getByLabel("Região").selectOption("alpes");
    await page.getByLabel("Orçamento diário máx. (R$)").fill("2000");
    await page.getByLabel("Ordenar por").selectOption("maior-altitude");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/regiao=alpes/);
    await expect(page).toHaveURL(/orcamento=2000/);
    await expect(page).toHaveURL(/ordem=maior-altitude/);
    const count = await page.getByTestId("resort-card").count();
    expect(count).toBeGreaterThan(0);
    await expect(page.getByTestId("results-count")).toContainText(`${count}`);
    const first = await page.getByTestId("card-elevation").allTextContents();
    const meters = first.map((t) => Number(t.replace(/\D/g, "")));
    expect(meters).toEqual([...meters].sort((a, b) => b - a));
  });

  test("mostra estado vazio e permite limpar filtros", async ({ page }) => {
    await page.goto("/explorar?q=nadaquecombine");
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await page.getByRole("link", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL(/\/explorar$/);
    await expect(page.getByTestId("results-count")).toContainText("100 resultados");
  });

  test("ignora parâmetros inválidos com um aviso", async ({ page }) => {
    await page.goto("/explorar?perfil=voluntariado&orcamento=abc");
    await expect(page.getByRole("status")).toContainText("perfil");
    await expect(page.getByTestId("results-count")).toContainText("100 resultados");
  });
});

test.describe("estação", () => {
  test("mostra dados principais e aviso de estimativa", async ({ page }) => {
    await page.goto("/destinos/zermatt");
    await expect(page.getByRole("heading", { level: 1, name: "Zermatt" })).toBeVisible();
    await expect(page.getByTestId("daily-budget")).toContainText("R$");
    await expect(page.getByTestId("top-elevation")).toContainText("3.883");
    await expect(page.getByText("Estimativa ilustrativa").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Orçamento estimado" })).toBeVisible();
  });

  test("cada país tem a sua paleta de cores", async ({ page }) => {
    await page.goto("/destinos/zermatt");
    const swiss = await page.locator("[data-theme-country]").first().getAttribute("style");
    await page.goto("/destinos/niseko");
    const japan = await page.locator("[data-theme-country]").first().getAttribute("style");
    expect(swiss).toContain("--color-fjord");
    expect(japan).toContain("--color-fjord");
    expect(swiss).not.toBe(japan);
  });

  test("retorna 404 para estação inexistente", async ({ page }) => {
    const response = await page.goto("/destinos/nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });

  test("a rota antiga de oportunidades não existe mais", async ({ page }) => {
    const response = await page.goto("/oportunidades/qualquer");
    expect(response?.status()).toBe(404);
  });
});

test.describe("comparar", () => {
  test("compara duas estações e calcula o total da viagem", async ({ page }) => {
    await page.goto("/comparar?d=zermatt&d=chamonix&dias=7");
    await expect(page.getByTestId("compare-table")).toBeVisible();
    await expect(page.getByTestId("compare-total")).toHaveCount(2);
    await expect(page.getByTestId("compare-total").first()).toContainText("R$");
  });

  test("pede pelo menos duas estações", async ({ page }) => {
    await page.goto("/comparar?d=zermatt");
    await expect(page.getByTestId("compare-empty")).toBeVisible();
  });

  test("o botão da estação leva ao comparador com ela selecionada", async ({ page }) => {
    await page.goto("/destinos/verbier");
    await page.getByRole("link", { name: "Comparar com outras estações" }).click();
    await expect(page).toHaveURL(/\/comparar\?d=verbier/);
  });
});

test.describe("favoritos", () => {
  test("salva e remove uma estação, com contador no cabeçalho", async ({ page }) => {
    await page.goto("/destinos/zermatt");
    const button = page.getByTestId("favorite-button").first();
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("favorites-count").first()).toHaveText("1");

    await page.goto("/favoritos");
    await expect(page.getByTestId("favorites-list")).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Zermatt" })).toBeVisible();

    await page.getByTestId("favorite-button").first().click();
    await expect(page.getByTestId("favorites-empty")).toBeVisible();
  });
});
