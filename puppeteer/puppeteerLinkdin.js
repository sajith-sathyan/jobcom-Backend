const puppeteer = require("puppeteer");

const puppeteerJsConnection = async (keyword) => {
  console.log("keyword", keyword);
  function generateLinkedInSearchURL(keyword) {
    const location = "India";
    const baseUrl = "https://www.linkedin.com/jobs/search";
    const encodedKeyword = encodeURIComponent(keyword);
    const encodedLocation = encodeURIComponent(location);
    const searchParams = [
      `keywords=${encodedKeyword}`,
      `location=${encodedLocation}`,
    ];
    const queryParams = searchParams.join("&");
    return `${baseUrl}?${queryParams}`;
  }
  const searchKeyword = generateLinkedInSearchURL(keyword);
  console.log("searchKeyword", searchKeyword);
    const browser = await puppeteer.launch({
      headless: "new",
      timeout: 60000,
    });
  const page = await browser.newPage();
  await page.goto(searchKeyword);
  await page.screenshot({ path: "example.png", fullPage: true });
  // const html = await page.content();
  // console.log(html);
  // const title = await page.evaluate(() => document.title);
  // console.log(title);
  // const text = await page.evaluate(() => document.body.innerText);
  // console.log(text);
  // const links = await page.evaluate(() =>
  //   Array.from(document.querySelectorAll("a"), (e) => e.href)
  // );
  // console.log(links);

  const LinkdinJobDetails = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".jobs-search__results-list li"), (e) => {
    const titleElement = e.querySelector(".base-search-card__info .base-search-card__title");
    const linkElement = e.querySelector(".base-search-card__info .hidden-nested-link");
    const timeElement = e.querySelector(".job-search-card__listdate");
    const jobStatus = e.querySelector(".base-search-card__info .base-search-card__metadata .job-search-card__benefits .result-benefits .result-benefits__text");

    // Extract company name and link
    const companyName = linkElement ? linkElement.innerText.trim() : "Company name not found";
    const companyLink = linkElement ? linkElement.href : "Company link not found";
    const timeText = timeElement ? timeElement.innerText.trim() : "Time not found";

    // Extract location and logo image
    const locationElement = e.querySelector(".job-search-card__location");
    const location = locationElement ? locationElement.innerText.trim() : "Location not found";

    const logoElement = e.querySelector(".job-search-card__logo-image a");
    const logoImage = logoElement ? logoElement.src : "Logo image not found";

    return {
      title: titleElement ? titleElement.innerText.trim() : "Title not found",
      jobStatus: jobStatus ? jobStatus.innerText.trim() : "jobStatus not found",
      companyName,
      companyLink,
      time: timeText,
      location,
      logoImage,
    };
  })
);


  await browser.close();

  return LinkdinJobDetails;
};

module.exports = puppeteerJsConnection;
