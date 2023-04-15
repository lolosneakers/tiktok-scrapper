
# tiktok-scrapper 

Simple Profile Data Extract (Followers, Following, videos, descriptions...), Work in April 2023.



## Installation Guide
Follow these steps to set up the required dependencies for this repository :

Ensure you have Node.js installed on your system. You can check by running `node -v` in your terminal. If you don't have it installed, visit the `Node.js` website to download and install the latest version.

Clone or download the repository to your local machine and go inside

```bash
cd tiktok-scrapper
```

Install the necessary dependencies by running the following command:

```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth cheerio fs
```


That's it! You have now installed the required dependencies for this repository. 

## How to Run it ?

Put some tiktok username in *usernames.txt* and run
```bash
node index.js
 ```

Then scrapped data go to ./datatiktok separate with different json file. (You have an exemple in ./datatiktok folder).

If you have some Captcha problems you can apply a cookie in `session_cookies` with the Chrome extension "EditThisCookie".

