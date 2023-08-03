// crawl website
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import fs from "fs";

let word_list = [];

function storeData(crawledData) {
  try {
    const jsonData = JSON.stringify(crawledData, null, 2);
    // Write the JSON data to a file
    fs.writeFileSync("path", jsonData, "utf8");
    console.log("Store data successful");
  } catch (error) {
    console.log(error);
  }
}

const urlToCrawlWordList = "https://www.dictionary4it.com/term/";

// Function to fetch and parse the webpage
async function scrapeWebsite(url) {
  try {
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const firstUl = $("#dictionary__left ul").eq(0);
    const items = firstUl.find(".dictionary__item");

    await Promise.all(
      items.map(async (i, el) => {
        const titleWhatIs_header = $(el).find("h3").text();
        const titleWhatIs_body = $(el).find("p").text();
        const linkToDetail = $(el).find("a").attr("href");

        const response_detail = await fetch(linkToDetail);
        const body_detail = await response_detail.text();
        const inner$ = cheerio.load(body_detail);

        // Word detail
        const dictionary__type = inner$(".dictionary__type").text().trim();
        const dictionary__language = inner$(".dictionary__language")
          .text()
          .trim();
        const definition1 = inner$(".dictionary__body").find("p:eq(0)").text();
        const definition2 = inner$(".dictionary__body").find("p:eq(1)").text();

        word_list.push({
          titleWhatIs_header,
          titleWhatIs_body,
          linkToDetail,
          dictionary__type,
          dictionary__language,
          definition1,
          definition2,
        });
      })
    );

    console.log(word_list);
    storeData(word_list);

    // next page
    const allLiElements = $(".pagination li");
    const lastLi = allLiElements.last();
    const hrefValue = lastLi.find("a").attr("href");
    scrapeWebsite(hrefValue);
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

// Call the function with the URL of the website you want to crawl
scrapeWebsite(urlToCrawlWordList);
