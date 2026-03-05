# Code Review Fixes Checklist

## Status: IN PROGRESS

---

## CRITICAL (1)

- [ ] **SEC-001**: Add authorization to API routes - verify memberId ownership before syncing ✅ DONE

---

## HIGH (7)

- [ ] **ARCH-001**: Replace in-memory CreditService state with database persistence
- [x] **ARCH-003**: Fix memory leak in WebSocket metrics (reset counters or use sliding window)
- [x] **SEC-002**: Add authentication to WebSocket trust subscriptions
- [x] **SEC-003**: Add authentication to POST API endpoints (regulate, update-buffer, update-pulse)
- [x] **SEC-006**: Fix CORS configuration - ensure ALLOWED_ORIGINS is required in production
- [ ] **SEC-007**: Fix runtime compatibility - use Web Crypto API or runtime-safe UUID
- [x] **MAIN-001**: Fix singleton anti-pattern in credit-service.ts
- [ ] **MAIN-004**: Add unit tests for CreditService, PostingEngine, UbuntuBackbone

---

## MEDIUM (12)

- [ ] **ARCH-002**: Add database persistence to UbuntuBackbone memberProfiles
- [ ] **ARCH-004**: Persist audit trail to database instead of in-memory
- [ ] **ARCH-005**: Remove Math.random() from deriveContributionHistory()
- [x] **SEC-004**: Add bounds checking to limit parameter in API
- [ ] **SEC-005**: Add validation to updateSafetyBuffer() - reject negative values
- [ ] **SEC-008**: Add retry/dead-letter handling for failed status transitions
- [ ] **PERF-001**: Implement batch processing for pending events
- [ ] **PERF-002**: Combine redundant loan iterations in getPoolHealthInput()
- [ ] **PERF-003**: Use Map lookup for O(1) loan lookup in processPayment()
- [ ] **PERF-004**: Cache active member count instead of filtering on every call
- [ ] **MAIN-002**: Replace Chinese characters with ASCII in privilege strings
- [ ] **MAIN-003**: Externalize community keywords to configuration
- [ ] **MAIN-005**: Standardize crypto.randomUUID() usage across codebase

---

## LOW (2)

- [ ] **MAIN-006**: Fix 9 JSX escaping errors in VillageStatus.tsx
