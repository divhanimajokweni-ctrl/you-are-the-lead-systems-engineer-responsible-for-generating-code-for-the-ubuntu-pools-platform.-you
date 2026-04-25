/**
 * Ubuntu Pools — Phase 1: EventService
 */

import { EventEmitter, SimpleEventEmitter } from "./emitter";

type Database = any;
type Event = any;

export class EventService {
  constructor(private readonly db: Database) {}
}

export function createEventService(db: Database): EventService {
  return new EventService(db);
}
