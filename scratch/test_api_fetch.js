async function testFetch() {
  const url = 'http://localhost:3001/api/data/footer';
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response text:", text);
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}

testFetch();
