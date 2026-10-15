// Frontend-only "user database" kept in localStorage.
// Passwords are salted + hashed with SHA-256 (Web Crypto) rather than stored in plain text.
// This is a SIMULATION for the assignment – a real app would authenticate against a server.
import { STORAGE_KEYS, load, save } from '../utils/storage.js';

export const readUsers = () => load(STORAGE_KEYS.users, []);
export const writeUsers = (users) => save(STORAGE_KEYS.users, users);

export function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function createSalt() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Never put the salt/hash into Redux state.
export const toPublicUser = ({ id, name, email }) => ({ id, name, email });
