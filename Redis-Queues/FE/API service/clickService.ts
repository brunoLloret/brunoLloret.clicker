// clickService.js
const API_BASE_URL = 'http://localhost:3000'; // Your backend URL

export const getTotalClicks = async () => {
    const response = await fetch(`${API_BASE_URL}/clicks`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json()
    console.log("response json getTotalClicks", data)
    return data;
};

export const postClick = async (clickData: {}) => {
    const response = await fetch(`${API_BASE_URL}/click`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clickData),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json()
    console.log("response json postClick", data)
    return data;
};
