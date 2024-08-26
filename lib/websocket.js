import { io } from 'socket.io-client'

export function initializeSocket() {
    const socket = io('http://localhost:3001')
    return socket
}