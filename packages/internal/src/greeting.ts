export interface Greeting {
  message: string;
  timestamp: number;
}

export function createGreeting(name: string): Greeting {
  return {
    message: `Hello, ${name}!`,
    timestamp: Date.now(),
  };
}
