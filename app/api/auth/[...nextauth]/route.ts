import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
// import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { initializeSocket } from "@/lib/socket";

const handler = NextAuth(authOptions);

// Create a global socket server instance
let io: SocketIOServer;

export async function GET(req: Request) {
  if (io) {
    return NextResponse.json({ success: true, message: "Socket server already running" });
  }

  // For development with Next.js reloads
  const server = (global as any).__socketServer;
  if (!server) {
    return NextResponse.json({ success: false, message: "HTTP server not available" }, { status: 500 });
  }

  try {
    io = initializeSocket(server);
    return NextResponse.json({ success: true, message: "Socket server initialized" });
  } catch (error) {
    console.error("Failed to initialize socket server:", error);
    return NextResponse.json({ success: false, message: "Failed to initialize socket server" }, { status: 500 });
  }
}

export { handler as GET, handler as POST };