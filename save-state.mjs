import { chromium } from "playwright";
  import fs from "node:fs/promises";

  const output = "state/jd-storage-state.json";

  await fs.mkdir("state", { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.jd.com/");
  console.log("请在打开的浏览器里手动登录京东，登录完成后回到终端按回车。");

  process.stdin.resume();
  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  await context.storageState({ path: output });
  console.log(`已保存到 ${output}`);

  await browser.close();
  process.exit(0);
