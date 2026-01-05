/**
 * Special Abilities System
 *
 * This module provides the special abilities system for both war and domestic actions.
 * Special abilities modify general stats, domestic actions, and war calculations.
 */

// Core types and base classes
export * from './types';
export { BaseSpecial } from './BaseSpecial';

// War special abilities
export * from './war';

// Domestic special abilities
export * from './domestic';
