import { chromium } from "playwright";

const url = process.env.HEAR_SUITE_URL || "http://127.0.0.1:8080/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(300000);
try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(async () => {
    const suite = await import("/src/lib/piano/hear-suite.ts");
    return suite.runHearSuite();
  });
  const failures = result.failures.slice(0, 40);
  console.log(JSON.stringify({ ok: result.ok, checked: result.checked, failures }, null, 2));
  await browser.close();
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  await browser.close();
  process.exit(1);
}
