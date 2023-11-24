import WebSocket from 'ws';

const playerIdsByWebsockets = new Map<WebSocket, number>();
const playerData = new Map<number, Token>();

// socket to player id map
const hasSocket = (socket: WebSocket): boolean => {
    return playerIdsByWebsockets.has(socket);
};

const setSocket = (socket: WebSocket, playerId: number): void => {
    playerIdsByWebsockets.set(socket, playerId);
};

const getPlayerIdBySocket = (socket: WebSocket): number | undefined => {
    return playerIdsByWebsockets.get(socket);
};

const removePlayerIdBySocket = (socket: WebSocket): void => {
    playerIdsByWebsockets.delete(socket);
};

// player id to player data map
const setPlayerData = (playerId: number, decoded: Token): void => {
    playerData.set(playerId, decoded);
};

const getPlayerData = (playerId: number): Token | undefined => {
    return playerData.get(playerId);
};

const getPlayerDataBySocket = (socket: WebSocket): Token | undefined => {
    const playerId = getPlayerIdBySocket(socket);
    if (playerId === undefined) {
        return;
    }

    return getPlayerData(playerId);
};

const removePlayerData = (playerId: number): void => {
    playerData.delete(playerId);
};

export {
    hasSocket,
    setSocket,
    setPlayerData,
    getPlayerIdBySocket,
    getPlayerData,
    getPlayerDataBySocket,
    removePlayerData,
    removePlayerIdBySocket,
};
