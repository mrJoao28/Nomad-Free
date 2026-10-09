import { expect, test } from "@playwright/test";

test.describe("landing", () => {
  test("mostra hero, busca, destinos e aviso de demonstração", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Viaje leve");
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Escolha o lugar" })).toBeVisible();
    await expect(page.getByTestId("catalog-card").first()).toBeVisible();
    await expect(page.getByTestId("demo-notice")).toBeVisible();
  });

  test("a busca atualiza os parâmetros da URL em /explorar", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Destino ou palavra-chave").fill("cusco");
    await page.getByLabel("Categoria").selectOption("destino-economico");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/explorar\?.*q=cusco/);
    await expect(page).toHaveURL(/categoria=destino-economico/);
    await expect(page.getByRole("heading", { level: 3, name: "Cusco" })).toBeVisible();
  });
});

test.describe("explorar", () => {
  test("filtra por categoria e orçamento e ordena por menor custo", async ({ page }) => {
    await page.goto("/explorar");
    await page.getByLabel("Categoria").selectOption("voluntariado");
    await page.getByLabel("Orçamento diário máx. (R$)").fill("70");
    await page.getByLabel("Ordenar por").selectOption("menor-custo");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/categoria=voluntariado/);
    await expect(page).toHaveURL(/orcamento=70/);
    const count = await page.getByTestId("catalog-card").count();
    expect(count).toBeGreaterThan(0);
    await expect(page.getByTestId("results-count")).toContainText(`${count}`);
  });

  test("mostra estado vazio e permite limpar filtros", async ({ page }) => {
    await page.goto("/explorar?q=nadaquecombine");
    await expect(page.getByTestId("empty-state")).toBeVisible();
    await page.getByRole("link", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL(/\/explorar$/);
    await expect(page.getByTestId("catalog-card").first()).toBeVisible();
  });

  test("ignora parâmetros inválidos com aviso", async ({ page }) => {
    await page.goto("/explorar?categoria=xyz&orcamento=-1");
    await expect(page.getByRole("status")).toContainText("inválidos");
    await expect(page.getByTestId("catalog-card").first()).toBeVisible();
  });
});

test.describe("detalhes", () => {
  test("abre a página de um destino a partir do card", async ({ page }) => {
    await page.goto("/explorar?q=medellin");
    await page.getByRole("link", { name: "Medellín", exact: true }).first().click();
    await expect(page).toHaveURL(/\/destinos\/medellin-colombia$/);
    await expect(page.getByRole("heading", { level: 1, name: "Medellín" })).toBeVisible();
    await expect(page.getByTestId("daily-budget")).toContainText("R$");
    await expect(page.getByRole("heading", { name: "Trabalho remoto" })).toBeVisible();
    await expect(page.getByText("Estimativa ilustrativa").first()).toBeVisible();
  });

  test("abre a página de uma oportunidade", async ({ page }) => {
    await page.goto("/oportunidades/voluntariado-ingles-escola-cusco");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Aulas de inglês");
    await expect(page.getByText("Taxa única de programa")).toBeVisible();
    await expect(page.getByRole("link", { name: /link de exemplo/i })).toHaveAttribute(
      "rel",
      /noopener/,
    );
  });

  test("slug inexistente mostra página não encontrada", async ({ page }) => {
    const response = await page.goto("/destinos/nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });
});

test.describe("favoritos", () => {
  test("salva, persiste após recarregar e remove", async ({ page }) => {
    await page.goto("/destinos/cusco-peru");
    const button = page.getByTestId("favorite-button").first();
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("favorites-count").first()).toHaveText("1");

    await page.reload();
    await expect(page.getByTestId("favorite-button").first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.goto("/favoritos");
    await expect(page.getByTestId("favorites-list")).toContainText("Cusco");

    await page.getByTestId("favorite-button").first().click();
    await expect(page.getByTestId("favorites-empty")).toBeVisible();
  });
});
