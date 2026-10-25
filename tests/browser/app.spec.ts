import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { initialState, dailyGame } from "../../shared/catalog";
import {
  dailyClaim,
  startGame,
  publicRun,
  gameAction,
  gameReward,
  redeem,
} from "../../shared/engine";

test.beforeEach(async ({ page }) => {
  const state: any = initialState();
  let balance = 300;
  const history: any[] = [];
  let run: any = null;
  const identityUser = {
    id: randomUUID(),
    email: "explorer@example.test",
    user_metadata: { full_name: "Mochi" },
    app_metadata: { provider: "email" },
    confirmed_at: new Date().toISOString(),
  };
  const session = [
    Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url"),
    Buffer.from(
      JSON.stringify({
        sub: identityUser.id,
        email: identityUser.email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url"),
    randomUUID(),
  ].join(".");
  await page.route("**/.netlify/identity/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/settings"))
      return route.fulfill({
        json: {
          disable_signup: false,
          autoconfirm: false,
          external: { email: true },
        },
      });
    if (url.pathname.endsWith("/token"))
      return route.fulfill({
        json: {
          access_token: session,
          refresh_token: randomUUID(),
          expires_in: 3600,
          token_type: "bearer",
          user: identityUser,
        },
      });
    if (url.pathname.endsWith("/logout")) return route.fulfill({ status: 204 });
    return route.fulfill({ json: identityUser });
  });
  await page.route("**/api/quest", async (route) => {
    const day = new Date().toISOString().slice(0, 10);
    let result: any = null;
    try {
      if (route.request().method() === "POST") {
        const b = route.request().postDataJSON();
        let amount = 0;
        if (b.action === "daily") amount = dailyClaim(state, day);
        if (b.action === "avatar") {
          state.avatar = b.avatar;
          state.styleDay = day;
        }
        if (b.action === "preset")
          state.presets.push({
            id: randomUUID(),
            name: b.name,
            avatar: structuredClone(state.avatar),
          });
        if (b.action === "settings") state.settings = b.settings;
        if (b.action === "start")
          run = startGame(b.kind, b.difficulty, Date.now() - 500);
        if (b.action === "move") {
          gameAction(run, b);
          if (run.done) {
            amount = gameReward(run);
            run.reward = amount;
            state.stats.games++;
          }
        }
        if (b.action === "buy" || b.action === "box") {
          result = redeem(state, balance, b.id, b.action === "box");
          amount = result.amount;
        }
        balance += amount;
        if (amount)
          history.unshift({
            amount,
            description: b.action,
            created_at: new Date().toISOString(),
          });
      }
      await route.fulfill({
        json: {
          name: "Mochi",
          balance,
          state: { ...state, run: publicRun(run) },
          history,
          result,
          day,
        },
      });
    } catch (e) {
      await route.fulfill({
        status: 400,
        json: { error: (e as Error).message },
      });
    }
  });
});
async function signIn(page: any) {
  await page.goto("/");
  await page.getByLabel("Email or user ID").fill("explorer@example.test");
  await page.getByLabel("Password", { exact: true }).fill(randomUUID());
  await page.getByRole("button", { name: "Step inside" }).click();
  await expect(
    page.getByRole("heading", { name: /Hello, Mochi/ }),
  ).toBeVisible();
}

test("login gate, password visibility, login and refresh persistence", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome home." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show", exact: true }).click();
  await expect(page.locator("#auth-password")).toHaveAttribute("type", "text");
  await signIn(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Hello, Mochi/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/fan-quest-dashboard.png",
    fullPage: true,
  });
});
test("daily reward updates the wallet and cannot be clicked twice", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "+5 · Claim gift" }).click();
  await expect(page.getByText("305 Fan Points", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Claimed ✓" })).toBeDisabled();
});
test("avatar edit, unequip, save and named presets work", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "My Avatar", exact: true }).click();
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page
    .locator(".item-card")
    .filter({ hasText: "Milk tea tee" })
    .getByRole("button", { name: "Unequip" })
    .click();
  await page
    .getByRole("button", { name: "Save appearance", exact: true })
    .click();
  await expect(page.locator("#toast")).toContainText("Your look is saved");
  await page.getByRole("button", { name: "Save this look" }).click();
  await page.getByLabel("Look name").fill("Sunday explorer");
  await page.getByRole("button", { name: "Save look", exact: true }).click();
  await expect(page.locator(".look-row")).toContainText("Sunday explorer");
});
test("wardrobe purchase confirms price and changes ownership", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "Wardrobe", exact: true }).click();
  await page
    .locator(".item-card")
    .filter({ hasText: "Peach kitten" })
    .getByRole("button")
    .click();
  await expect(page.locator("dialog")).toContainText("120 Fan Points");
  await page.getByRole("button", { name: "Redeem for 120 points" }).click();
  await expect(page.getByText("180 Fan Points", { exact: true })).toBeVisible();
  await expect(
    page
      .locator(".item-card")
      .filter({ hasText: "Peach kitten" })
      .getByRole("button"),
  ).toHaveText("Equip");
});
test("blind box odds, confirmed spending, opening and result update collection", async ({
  page,
}) => {
  await signIn(page);
  await page
    .getByRole("button", { name: "Blind Box Shop", exact: true })
    .click();
  await page
    .getByRole("button", { name: "See possible rewards" })
    .first()
    .click();
  await expect(page.locator("dialog")).toContainText("Common: 85%");
  await page.getByRole("button", { name: "Got it" }).click();
  await page
    .getByRole("button", { name: "50 points · Open box", exact: true })
    .click();
  await page.getByRole("button", { name: "Open for 50 points" }).click();
  await expect(page.getByRole("button", { name: "Lovely!" })).toBeVisible();
  await expect(page.getByText("250 Fan Points", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Lovely!" }).click();
  await expect(page.locator(".history")).toContainText("Common Box");
});
test("quick tap starts, records targets, pauses and resumes", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page
    .locator(".game-card")
    .filter({ hasText: "Quick Tap" })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  await page.getByRole("button", { name: "Tap the star" }).click();
  await expect(page.locator(".game-hud")).toContainText("1 score");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByText("A little breather. Resume when you’re ready."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tap the star" }),
  ).toBeVisible();
});
test("trivia questions produce a results screen and memory reveals cards", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await page
    .locator(".game-card")
    .filter({ hasText: "Fan Trivia" })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    await expect(page.locator(".question .eyebrow")).toHaveText(
      "QUESTION " + (i + 1) + " OF 5",
    );
    await page.waitForTimeout(200);
    await page.locator(".answers button").first().click();
  }
  await expect(page.getByText("ADVENTURE COMPLETE")).toBeVisible();
  await page.getByRole("button", { name: "← All games" }).click();
  await page
    .locator(".game-card")
    .filter({ hasText: "Memory Match" })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  await expect(page.locator(".memory-card")).toHaveCount(12);
  await page.locator(".memory-card").first().click();
  await expect(page.locator(".memory-card").first()).toHaveAttribute(
    "aria-label",
    /Symbol/,
  );
});
test("settings persist theme and layout; logout closes the app", async ({
  page,
}) => {
  await signIn(page);
  await page
    .getByRole("button", { name: "Profile & Settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Appearance", exact: true })
    .selectOption("dark");
  await page.getByRole("button", { name: "Save my preferences" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Log out", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Welcome home." }),
  ).toBeVisible();
});
test("mobile dashboard and navigation fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("button", { name: "My Collection", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "My little treasures" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
