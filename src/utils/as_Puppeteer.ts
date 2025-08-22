import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { LaunchOptions } from "puppeteer";
import { as_IsDev } from "@root/utils";
import fs from "fs";

class as_Puppeteer {
  private puppeteer: any;
  private browser: any;

  constructor() {
    const puppeteerExtra = require("puppeteer-extra");
    const puppeteerCore = require("puppeteer-core");

    // Linka o puppeteer-core como base do puppeteer-extra
    puppeteerExtra.use(StealthPlugin());
    puppeteerExtra.puppeteer = puppeteerCore;

    this.puppeteer = puppeteerExtra;
  }

  private async getChromePath(): Promise<string> {
    const programFiles = process.env["PROGRAMFILES"] || "C:\\Program Files";
    const programFilesx86 =
      process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";

    const paths = [
      `${programFiles}\\Google\\Chrome\\Application\\chrome.exe`,
      `${programFilesx86}\\Google\\Chrome\\Application\\chrome.exe`,
    ];

    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }

    throw new Error("Chrome.exe não encontrado nos caminhos padrões.");
  }

  private async getLaunchOptions(): Promise<LaunchOptions> {
    const baseOptions: LaunchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--hide-scrollbars",
        // "--start-maximized",
      ],
      // ignoreHTTPSErrors: true,
    };

    // Em produção: setar caminho do Chrome
    if (!as_IsDev()) {
      baseOptions.executablePath = await this.getChromePath();
    }

    return baseOptions;
  }

  public async openBrowser(extraOpt: LaunchOptions = {}) {
    const options = await this.getLaunchOptions();
    const finalOptions = { ...options, ...extraOpt };

    this.browser = await this.puppeteer.launch(finalOptions);
    // const page = await this.browser.newPage();
    const [page] = await this.browser.pages();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    return page;
  }

  public async openPage(pg: { url?: string; opt?: LaunchOptions } = {}) {
    let page;

    if (this.browser) {
      page = await this.browser.newPage();
    } else {
      page = await this.openBrowser(pg.opt);
    }

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    if (pg.url) {
      page.response = await page.goto(pg.url)
    };
    
    return page;
  }

  public getBrowser() {
    return this.browser;
  }

  public async closeBrowser() {
    if (this.browser) await this.browser.close();
  }
}

export { as_Puppeteer };
