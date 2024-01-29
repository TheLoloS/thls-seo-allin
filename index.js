const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const readline = require("readline");
const config = JSON.parse(fs.readFileSync("./config.json"));
const getActualTime = () => {
	const date = new Date().toLocaleString("pl-PL", {
		timeZone: "Europe/Warsaw",
	});
	const string = "[" + date.split(" ")[1] + "] ->";
	return string;
};

async function c(time, string) {
	console.log(time, string ? string : "");
	// save log to file
	fs.appendFileSync("log.txt", string + "\n", function (err) {
		if (err) throw err;
	});
}

if (!config) {
	c(`Nie można załadować pliku konfiguracyjnego`);
	process.exit(0);
}else{
	c(`Załadowano plik konfiguracyjny`);
}

const queryValues = config.queryValues;

const myDomains = config.myDomains;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

console.clear();
c(`             )   (      (     
  *   )  ( /(   )\\ )   )\\ )  
' )  /(  )\\()) (()/(  (()/(  
 ( )(_) ((_)\\   /(_))  /(_)) 
(_(_())  _((_) (_))   (_))   
|_   _| | || | | |    / __|  
  | |   | __ | | |__  \\__ \\  
  |_|   |_||_| |____| |___/  
                              
$ Witamy w programie do generowania ruchu na stronie przy pomocy allintext oraz do demotywacji konkurencji :)`);
c(`$ Wersja: 1.0.0`);
c(`$ Autor: TheLoloS`);
c(`$ Licencja: MIT`);
c(`$ Strona: https://thls.pl/`);
c(`$ Miłego korzystania!`);

let instances = 1;
const pathToUrbanVpn = path.join(process.cwd(), "urban-vpn");


const chromePath = path.join(
	process.cwd(),
	"puppeteer",
	"chrome",
	"win64-119.0.6045.105",
	"chrome-win64",
	"chrome.exe",
);

puppeteer.use(StealthPlugin());

async function bot(i) {
	c(getActualTime(), `Uruchamianie instancji [${i}]`);
	c(
		(() => {
			const date = new Date().toLocaleString("pl-PL", {
				timeZone: "Europe/Warsaw",
			});
			const string = "[" + date.split(" ")[1] + "] ->";
			return string;
		})(),
		`Wczytywanie...`,
	);
	// if (config) {
	// 	c(getActualTime(), "Załadowano plik konfiguracyjny");
	// } else {
	// 	c(getActualTime(), "Nie można załadować pliku konfiguracyjnego");
	// 	process.exit(0);
	// }
	// for (let i = 0; i < instances; i++) {
	let serverIndex = 42;

	// for (let i = 0; i < instances; i++) {
	const browser = await puppeteer.launch({
		headless: false, // Change to true if needed for production
		executablePath: chromePath,
		caches: false,
		args: [
			`--disable-extensions-except=${pathToUrbanVpn}`,
			`--load-extension=${pathToUrbanVpn}`,
		],
	});

	c(getActualTime(), `Otwieranie przeglądarki [${i}]`);
	const [extPage] = await urbanVPN(browser, i, serverIndex);
	c(getActualTime(), `Czyszczecznie ciasteczek i cachu przeglądarki [${i}]`);
	await extPage.deleteCookie();
	await extPage.setCacheEnabled(false);
	try {
		await visit(extPage, browser, i);
		await browser.close();
		c(getActualTime(), `Zamykanie przeglądarki [${i}]`);
		bot(i);
	} catch (error) {
		console.error(getActualTime(), "wystąpił błąd bot > for", error);
		await browser.close();
		bot(i);
	}
	c(getActualTime(), "Zakońcono");
}

async function visit(page) {
	try {
		c(getActualTime(), `Otwieranie strony głównej`);
		const getRandomQueryValues = queryValues[Math.floor(Math.random() * queryValues.length)];
	c(getActualTime(), `Wybrano frazę: ${getRandomQueryValues}`);
		await page.goto(
			"https://www.google.com/search?q=" + getRandomQueryValues + `&num=100`,
			{
				waitUntil: "networkidle0",
			},
		);
		await page
			.waitForSelector("#L2AGLb")
			.then((e) => e.click())
			.catch((e) =>
				c(getActualTime(), `Nie wykryto przycisku zgody (to jest OK)`),
			);
		
		const elements = await page.$$(
			"div > div > div > div > div > div > div > span > a",
		);


		// show all href values od elements
		for (const [index, value] of elements.entries()) {
			const element = await page.$$(
				"div > div > div > div > div > div > div > span > a",
			);
			const href = await element[index].evaluate((el) => el.href);
			// filter href values by my domains
			for (const domain of myDomains) {
				if (href.includes(domain)) {
					await element[index].click();
					await page.waitForNavigation({waitUntil: 'networkidle0'});
					await page.goBack();
					
				}
			}
		}

	} catch (error) {
		console.error(getActualTime(), "wystąpił błąd w visit", error);
		throw error;
	}
}

const questionForInstance = () => {
	return new Promise((resolve, reject) => {
		c(`○ Podaj ilość instancji: `);
		rl.question("○: ", (answer) => {
			if (answer == 0) {
				c(`○ Nie można wykonać 0 instancji, wybieranie 1`);
				instances = 1;
			}
			if (answer < 0) {
				c(`○ Nie można wykonać mniej niż 0 instancji, wybieranie 1`);
				instances = 1;
			}
			if (answer == "") {
				c(`○ Nie można wykonać pustych instancji, wybieranie 1`);
				instances = 1;
			}
			instances = Number(answer);
			resolve();
		});
	});
};

// uruchomienie botów
const runBotsConcurrently = async () => {
	await bot(0);
};

// inicjalizacja botów
runBotsConcurrently();

// Urban VPN
async function urbanVPN(browser, instanceIndex, serverIndex) {
	const extension = await browser.waitForTarget((target) =>
		target.url().includes(`chrome-extension://`),
	);

	browser.on("targetcreated", async (target) => {
		if (target.type() !== "page") return;

		const ignore = "action=INSTALL";

		const pageUrl = target.url();

		if (pageUrl.includes(ignore)) {
			const newPage = await target.page();
			await new Promise((r) => setTimeout(r, 100));
			await newPage.close();
		}
	});
	// c(extension.url());
	const partialExtensionUrl = extension.url() || "";
	const [, , extensionId] = partialExtensionUrl.split("/");

	const [extPage] = await browser.pages();
	const extensionUrl = `chrome-extension://${extensionId}/popup/index.html`;
	const buttonSelector = "button.button--pink.consent-text-controls__action";
	const selectSelector = ".select-location__input";
	const listItemsSelector = ".locations__item";
	const loaderSelector = ".loader";

	const playButtonPlayingSelector = ".play-button.play-button--pause";

	try {
		await extPage.goto(extensionUrl, { waitUntil: "domcontentloaded" });

		// Wait for the button to be present in the DOM
		await extPage
			.waitForSelector(buttonSelector, { visible: true })
			.then((el) => el.click());

		await new Promise((r) => setTimeout(r, 100));
		// Wait for the button to be present in the DOM
		await extPage
			.waitForSelector(buttonSelector, { visible: true })
			.then((el) => el.click());
		await new Promise((r) => setTimeout(r, 100));

		async function shuffle() {
			c(getActualTime(), "Konfiguracja VPN oraz pobieranie nowego IP");
			await extPage
				.waitForSelector(selectSelector, { visible: true })
				.then((el) => el.click());
			const listElements = await extPage.$$(listItemsSelector);
			async function clickServer() {
				if (serverIndex >= 0 && serverIndex < listElements.length) {
					// Find "Poland" in the list
					await listElements.map(async (el, index) => {
						const text = await el.evaluate((node) => node.innerText);
						if (text.includes("Poland")) {
							await el.click();
							serverIndex = index;
						}
					});

					await extPage.waitForSelector(playButtonPlayingSelector, {
						visible: true,
					});
					await extPage.waitForSelector(loaderSelector, { hidden: true });
					extPage.on("console", (msg) => {
						if (msg.type() === "warning") {
							c(getActualTime(), msg.text());
						}
					});
					await extPage.evaluate(async () => {
						await fetch("https://api.myip.com", {
							method: "POST",
							body: "",
							redirect: "follow",
						})
							.then((response) => response.json())
							.then((result) =>
								console.warn("Ip: " + result.ip + " Kraj: " + result.country),
							)
							.catch((error) => console.warn("error", error));
					});

					console.info(
						getActualTime(),
						`Wybrano serwer ${serverIndex} dla instancji ${instanceIndex}`,
					);
				} else {
					console.warn(
						getActualTime(),
						`Nie znaleziono indexu ${instanceIndex}`,
					);
				}
			}
			await clickServer();
		}

		await shuffle();
		return [extPage, shuffle];
	} catch (error) {
		console.error(getActualTime(), `Error: w funkcji shuffle wystąpił błąd`);
	}
}
