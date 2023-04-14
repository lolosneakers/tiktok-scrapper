const puppeteerExtra = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cheerio = require("cheerio");
const fs = require("fs")


// --------------------------------------------------------------------------
// NAV OPTION

puppeteerExtra.use(StealthPlugin());

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  // --
  const browser = await puppeteerExtra.launch({
    product: "chrome",
    headless: false,
    defaultViewport: null,
    args: ["--width=1280", "--height=800"],
  });

  const page = await browser.newPage();

  const customUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
  await page.setExtraHTTPHeaders({ "User-Agent": customUserAgent });

// --------------------------------------------------------------------------
  // JSON 

  const saveData = (data, filename) => {
    const outputPath = `datatiktok/${filename}`;
    return new Promise((resolve, reject) => {
      fs.writeFile(outputPath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      fs.readFile(file, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };

  // --------------------------------------------------------------------------
  // TXT INTEGRATION 

  const getUsernameList = async () => {
    try {
      const data = await readFile("usernames.txt");
      return data
        .split("\n")
        .map((username) => username.trim().replace(/\r/g, ""))
        .filter((username) => username !== "");
    } catch (err) {
      console.error("Erreur lors de la lecture du fichier :", err);
      return [];
    }
  };

  // --------------------------------------------------------------------------
  // CONVERT LETTER TO NUMBER 

  const convertLetterToNumber = (valueWithSuffix) => {
    const value = parseFloat(valueWithSuffix);
    const isK = valueWithSuffix.toLowerCase().includes("k");
    const isM = valueWithSuffix.toLowerCase().includes("m");
    
    if (isK) {
      return value * 1000;
    } else if (isM) {
      return value * 1000000;
    } else {
      return value;
    }
  };

// --------------------------------------------------------------------------
  // START

  const language = 'fr';

  const usernames = await getUsernameList();

  for (const username of usernames) {

  const url = "https://www.tiktok.com/@" + username + "?lang=" + language;
  await page.goto(url);

  await sleep(1200);

  await page.waitForSelector("[data-e2e='user-post-item-list']");

  const content = await page.content();

  const $ = cheerio.load(content);

  // PROFILE DATA
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const profileData = {};

  const nicknameElement = $("[data-e2e='user-subtitle']");
  const nameElement = $("[data-e2e='user-title']");
  const followersElement = $("[data-e2e='followers-count']");
  const followingElement = $("[data-e2e='following-count']");
  const totalLikesElement = $("[data-e2e='likes-count']");
  const descriptionElement = $("[data-e2e='user-bio']");
  const profileImageElement = $(".e1e9er4e1");
  const certifiedElement = $("svg[data-e2e='']");

  profileData.username = nicknameElement.text().trim();
  profileData.name = nameElement.text().trim();
  profileData.followers = convertLetterToNumber(followersElement.text().trim());
  profileData.following = convertLetterToNumber(followingElement.text().trim());
  profileData.totalLikes = convertLetterToNumber(totalLikesElement.text().trim());
  profileData.description = descriptionElement.text().trim();
  profileData.profileImageUrl = profileImageElement.attr("src");
  profileData.profileUrl = url
  const profileLinkElement = $(".eht0fek4");
    if (profileLinkElement.length) {
      profileData.profileLink = profileLinkElement.attr("href");
    } else {
      profileData.profileLink = null;
    }

  console.log(profileData);

  profileData.certified = certifiedElement.length > 0;


  // VIDEO DATA
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  const videoElements = $('[role="button"][aria-label="Regarder en plein écran"]');
  const videoData = [];

  videoElements.each((index, element) => {
    const videoViewElement = $(element).find('.video-count');
    const descriptionElement = $(element).find('.e1yey0rl1');
    const videoLinkElement = $(element).find('a[tabindex="-1"]');


    const fullDescription = descriptionElement.attr('alt') ? descriptionElement.attr('alt').trim() : null;

    let description = null;
    let music = null;

    if (fullDescription) {
      const descriptionParts = fullDescription.split('  ');

      description = descriptionParts[0] || null;
      music = descriptionParts[1] || null;
    }

    const videoInfo = {
      link: videoLinkElement.length ? videoLinkElement.attr('href') : null,
      views: videoViewElement.length ? convertLetterToNumber(videoViewElement.text().trim()) : null,
      description: description,
      music: music,
    };

    videoData.push(videoInfo);
  });

  //PUSH JSON 

  const userData = {
    profile: profileData,
    videos: videoData,
  };

  
  try {
    await saveData(userData, `${username}.json`);
    console.log(`Data save for ${username}`);
  } catch (err) {
    console.error(`Error saving data for user ${username}:`, err);
  }

}

await browser.close();
})();