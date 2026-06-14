async function testAPI() {
  const url = 'http://localhost:3000/api/games';
  const data = { 
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6" 
  };

  console.log("Sending PGN to API...");

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await response.json();
    
    console.log("Server Responded:", response.status);
    console.log(json);

  } catch (err) {
    console.error("API Call Failed:", err);
  }
}

testAPI();