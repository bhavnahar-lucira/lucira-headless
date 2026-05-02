const http = require('http');

async function debugCollection() {
  const handle = 'all-rings';
  const url = `http://localhost:3000/api/collection?handle=${handle}&limit=1`;
  
  console.log(`Debugging URL: ${url}`);
  
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const col = json.collection;
        
        console.log("------------------------------------------");
        console.log(`Collection Title: ${col?.title}`);
        console.log(`FAQ Question (raw): ${col?.faqQuestion ? 'EXISTS' : 'MISSING'}`);
        console.log(`FAQ Answers (raw): ${col?.faqAnswers ? 'EXISTS' : 'MISSING'}`);
        console.log(`SEO Content: ${col?.seoContent ? 'EXISTS' : 'MISSING'}`);
        console.log("------------------------------------------");
        
        if (col?.faqQuestion && col?.faqAnswers) {
          console.log("✅ FAQ data IS coming from the API.");
          console.log("Question preview:", String(col.faqQuestion).substring(0, 50));
        } else {
          console.log("❌ FAQ data is MISSING from the API response.");
        }
        
        if (col?.seoContent) {
          console.log("✅ SEO Content IS coming from the API.");
        } else {
          console.log("❌ SEO Content is MISSING from the API response.");
        }
      } catch (e) {
        console.error("Error parsing API response. Is the server running?");
      }
    });
  }).on('error', (err) => {
    console.error("Connection failed:", err.message);
  });
}

debugCollection();
