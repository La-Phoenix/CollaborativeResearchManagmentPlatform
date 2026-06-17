import { Server, Socket } from 'socket.io';

export const setupCollaborationSockets = (io: Server) => {
  // We can create a dedicated namespace, or just use the root namespace. We'll use root for simplicity.
  io.on('connection', (socket: Socket) => {
    
    // When a user opens a document, they join a dedicated room for that document
    socket.on('join-document', (documentId: string, userId: string) => {
      socket.join(documentId);
      console.log(`User ${userId} joined document room: ${documentId}`);
      
      // Optionally notify others in the room that someone joined
      socket.to(documentId).emit('user-joined', { userId });
    });

    // When a user closes the document
    socket.on('leave-document', (documentId: string, userId: string) => {
      socket.leave(documentId);
      console.log(`User ${userId} left document room: ${documentId}`);
      socket.to(documentId).emit('user-left', { userId });
    });

    // Real-time synchronization of text/delta changes
    socket.on('send-changes', (documentId: string, delta: any) => {
      // Broadcast the changes to everyone else in the same document room
      socket.to(documentId).emit('receive-changes', delta);
    });

    // Real-time synchronization of cursor positions
    socket.on('cursor-move', (documentId: string, cursorData: any) => {
      // Broadcast cursor movements (e.g., { userId: '123', index: 15, length: 0 })
      socket.to(documentId).emit('cursor-update', cursorData);
    });

    // ------------------------------------------------------------------------
    // Project Dashboard & Activity Feed Events (per PRD)
    // ------------------------------------------------------------------------

    // User joins a project room (for dashboard notifications)
    socket.on('join-project', (projectId: string, userId: string) => {
      socket.join(`project-${projectId}`);
      console.log(`User ${userId} joined project dashboard: ${projectId}`);
    });

    // User leaves a project room
    socket.on('leave-project', (projectId: string, userId: string) => {
      socket.leave(`project-${projectId}`);
      console.log(`User ${userId} left project dashboard: ${projectId}`);
    });

    // Broadcast a general project activity (e.g., Task completed, Document added)
    socket.on('broadcast-activity', (payload: { projectId: string, activityType: string, message: string }) => {
      // Forward the notification to all users currently viewing the project dashboard
      socket.to(`project-${payload.projectId}`).emit('receive-activity', payload);
    });
    
  });
};
