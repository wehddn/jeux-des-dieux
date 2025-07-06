const API_URL = "http://localhost:5000";

const getAuthHeaders = (additionalHeaders = {}) => {
  const token = localStorage.getItem("token");
  return token
    ? { ...additionalHeaders, Authorization: `Bearer ${token}` }
    : additionalHeaders;
};

export const createGame = async ({ name, userId, isPrivate, password }) => {
  try {
    const response = await fetch(`${API_URL}/games`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
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
    const response = await fetch(`${API_URL}/games`, {
      headers: getAuthHeaders()
    });

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
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error("Error getting game");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting game:", error);
    throw new Error("API error");
  }
};

export const joinGame = async (gameId, password = '') => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}/join`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error joining game");
    }

    return await response.json();
  } catch (error) {
    console.error("Error joining game:", error);
    throw error;
  }
};

export const getGamesForAdmin = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/games`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error("Error getting games for admin");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting games for admin:", error);
    throw new Error("API error");
  }
};

export const updateGame = async (gameId, gameData) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error updating game");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating game:", error);
    throw error;
  }
};

export const deleteGame = async (gameId) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error deleting game");
    }

    return true;
  } catch (error) {
    console.error("Error deleting game:", error);
    throw error;
  }
};

export const updateGameStatus = async (gameId, status) => {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}/status`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error updating game status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating game status:", error);
    throw error;
  }
};
