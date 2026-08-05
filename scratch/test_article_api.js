async function testFetch() {
  const url = 'http://localhost:3001/api/data/articles?slug=find-brand-unique-voice';
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log("Success:", json.success);
    if (json.success && json.data && json.data.length > 0) {
      console.log("Article fields:", Object.keys(json.data[0]));
      console.log("metatitle:", json.data[0].metatitle);
      console.log("meta_description:", json.data[0].meta_description);
    } else {
      console.log("No article data found.");
    }
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}

testFetch();
