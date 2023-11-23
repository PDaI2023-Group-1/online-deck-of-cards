import express from 'express';
import {
    createRoom,
    roomInfo,
    roomCapacity,
    joinRoom,
} from '../controllers/room';

const roomRouter = express.Router();

roomRouter.post('/room', createRoom);
roomRouter.get('/room/info', roomInfo);
roomRouter.put('/room/:roomCode', joinRoom);
roomRouter.get('/room', roomCapacity);

export { roomRouter };
