const API_URL = 'http://localhost:3000/api/games';

export async function submitGame(pgn) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({pgn})
    });

    if (!res.ok){
        throw new Error('Failed to submit game');
    }

    return res.json();
}

export async function getGame(id){
    const res = await fetch(`${API_URL}/${id}`);

    if (!res.ok){
        throw new Error('Failed to fetch status');
    }

    return res.json();
}