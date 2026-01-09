import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";

/**
 * Password hashing service compatible with legacy PHP system.
 *
 * Legacy PHP uses double SHA-512 hashing:
 * 1. Client sends: sha512(globalSalt + password + globalSalt)
 * 2. Server stores: sha512(userSalt + clientHash + userSalt)
 *
 * For new TypeScript implementation, we accept plain password and handle both steps.
 */
@Injectable()
export class PasswordService {
  private readonly globalSalt: string;

  constructor() {
    // Global salt should be configured per installation
    this.globalSalt = process.env.GLOBAL_SALT || "sammo-global-salt";
  }

  /**
   * Generate a random salt for a new user
   */
  generateSalt(): string {
    return randomBytes(8).toString("hex"); // 16 char hex string
  }

  /**
   * Hash password for storage (new user registration)
   * @param plainPassword - The plain text password
   * @param userSalt - User-specific salt
   * @returns The final hash to store in database
   */
  hashPassword(plainPassword: string, userSalt: string): string {
    // Step 1: Client-side hash (globalSalt + password + globalSalt)
    const clientHash = this.hashWithGlobalSalt(plainPassword);
    // Step 2: Server-side hash (userSalt + clientHash + userSalt)
    return this.hashWithUserSalt(clientHash, userSalt);
  }

  /**
   * Verify password against stored hash
   * @param plainPassword - The plain text password to verify
   * @param userSalt - User-specific salt from database
   * @param storedHash - The hash stored in database
   * @returns true if password matches
   */
  verifyPassword(plainPassword: string, userSalt: string, storedHash: string): boolean {
    const computedHash = this.hashPassword(plainPassword, userSalt);
    return this.timingSafeEqual(computedHash, storedHash);
  }

  /**
   * Verify password when client already sent hashed password
   * (for legacy client compatibility)
   * @param clientHash - Hash from client (sha512(globalSalt + password + globalSalt))
   * @param userSalt - User-specific salt from database
   * @param storedHash - The hash stored in database
   * @returns true if password matches
   */
  verifyClientHash(clientHash: string, userSalt: string, storedHash: string): boolean {
    const computedHash = this.hashWithUserSalt(clientHash, userSalt);
    return this.timingSafeEqual(computedHash, storedHash);
  }

  /**
   * First stage hash (simulates what client does)
   */
  private hashWithGlobalSalt(password: string): string {
    const data = this.globalSalt + password + this.globalSalt;
    return createHash("sha512").update(data).digest("hex");
  }

  /**
   * Second stage hash (server-side)
   */
  private hashWithUserSalt(clientHash: string, userSalt: string): string {
    const data = userSalt + clientHash + userSalt;
    return createHash("sha512").update(data).digest("hex");
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Get global salt (for client-side hashing info)
   */
  getGlobalSalt(): string {
    return this.globalSalt;
  }
}
