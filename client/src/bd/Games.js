const API_URL = "http://localhost:5000/api";

export const createGame = async ({ name, userId, isPrivate, password }) => {
  try {
    const response = await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, userId, isPrivate, password }),
    });

    if (!response.ok) {
      throw new Error("Error creating game");
    }

    const data = await response.json();
    return data.gameId;
  } catch (error) {
    console.error("Error creating game:", error);
    throw new Error("API error");
  }
};

export const getGamesList = async () => {
  try {
    const response = await fetch(`${API_URL}/games`);

    if (!response.ok) {
      throw new Error("Error getting games list");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting games list:", error);
    throw new Error("API error");
  }
};

export const getGame = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`);

    if (!response.ok) {
      throw new Error("Error getting game");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting game:", error);
    throw new Error("API error");
  }
};
