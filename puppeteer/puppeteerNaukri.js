const puppeteer = require("puppeteer");

const puppeteerJsConnection = async (keyword) => {
  console.log("keyword", keyword);

  function generateNaukriSearchURL(keyword) {
    const baseUrl = "https://www.naukri.com/mern-stack-mern-stack-developer-jobs";
    const encodedKeyword = encodeURIComponent(keyword);
    const searchParam = `k=${encodedKeyword}`;
    return `${baseUrl}?${searchParam}`;
  }

  const searchKeyword = generateNaukriSearchURL(keyword);
  console.log("searchKeyword", searchKeyword);

  const browser = await puppeteer.launch({
    headless: "new",
    timeout: 60000,
  });
  const page = await browser.newPage();

  try {
    await page.goto(searchKeyword, { waitUntil: 'networkidle2', timeout: 60000 });

    // Increase the wait time if necessary
    await page.waitForSelector("article.jobTuple", { timeout: 120000 });

    await page.screenshot({ path: "example.png", fullPage: true });

    // Extract Naukri details
    const naukriDetails = await page.evaluate(() => {
      try {
        const jobElements = document.querySelectorAll("article.jobTuple");
        console.log(`Found ${jobElements.length} job elements`);

        return Array.from(jobElements, (element) => {
          const titleElement = element.querySelector(".jobTupleHeader .info .title.ellipsis");
          const companyNameElement = element.querySelector(".jobTupleHeader .info .companyInfo .subTitle.ellipsis.fleft");
          const experienceElement = element.querySelector(".fleft.br2.placeHolderLi.experience .expwdth");
          const salaryElement = element.querySelector(".fleft.br2.placeHolderLi.salary .ellipsis");
          const locationElement = element.querySelector(".fleft.br2.placeHolderLi.location .locWdth");
          const linkElement = element.querySelector(".jobTupleHeader .info .title.ellipsis");
          const postedDateElement = element.querySelector(".fleft.postedDate");
          const postedDate = postedDateElement ? postedDateElement.innerText.trim() : "Posted date not found";

          return {
            title: titleElement ? titleElement.innerText.trim() : "Title not found",
            companyName: companyNameElement ? companyNameElement.innerText.trim() : "Company name not found",
            experience: experienceElement ? experienceElement.innerText.trim() : "Experience not found",
            salary: salaryElement ? salaryElement.innerText.trim() : "Salary not found",
            location: locationElement ? locationElement.innerText.trim() : "Location not found",
            link: linkElement ? linkElement.getAttribute("href") : null,
            postedDate: postedDate ? postedDate : "Posted date not found",
          };
        });
      } catch (error) {
        console.error("Error extracting job details:", error);
        return [];
      }
    });

    console.log(naukriDetails);
    return naukriDetails;

  } catch (error) {
    console.error("Error occurred:", error);
    return [];
  } finally {
    await browser.close();
  }
};

// Example usage
puppeteerJsConnection('MERN Stack').then(data => {
  console.log('Extracted Data:', data);
}).catch(error => {
  console.error('Error:', error);
});

module.exports = puppeteerJsConnection;
