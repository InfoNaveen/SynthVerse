// Socket configuration
// In production, this would be a real Socket.io connection
// For the hackathon, the useSocket hook handles simulation internally

export const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export function getSocketUrl(): string {
  if (!SOCKET_URL) {
    console.warn("NEXT_PUBLIC_BACKEND_URL not configured — running in simulation mode.");
    return "";
  }
  return SOCKET_URL;
}
