# INVEINS.IN — CONCURRENCY & RACE CONDITION TEST RESULTS

**Target:** `https://inveins.in`  
**Classification:** HIGH-CONCURRENCY STRESS & THREAD SAFETY REPORT  
**Engine:** Multi-Threaded Asynchronous Benchmark & Load Simulator  

---

## 1. CONCURRENCY TEST SUMMARY MATRIX

| Target Scenario | Concurrency Level | Execution Mechanism | Expected Invariant | Actual System Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Final Stock Race** | 20 parallel checkouts for 1 remaining unit | Asynchronous Promise.all() burst | Exactly 1 success, 19 rejections | Exactly 1 success; 19 rejected with "Insufficient stock" | **PASS** |
| **Single-Use Coupon Race** | 20 parallel checkouts using 1-use coupon | Distributed worker simulation | Max 1 discount applied | 1 applied; 19 rejected with "Coupon limit exceeded" | **PASS** |
| **Identical Webhook Storm** | 10 concurrent identical webhook deliveries | Asynchronous POST burst | Idempotent single order commit | 10 acknowledged with 200; exactly 1 order row persisted | **PASS** |
| **Verify Callback vs Webhook** | 1 client verify + 1 gateway webhook simultaneously | Interleaved parallel execution | Idempotent upsert; no PK collisions | Both complete cleanly with upsert on `id` (Fix `NUCLEAR-002`) | **PASS** |
| **Concurrent Admin Updates** | 5 simultaneous status updates (`Shipped` vs `Delivered`) | Multi-admin parallel requests | Last committed write wins; consistent state | Database reflects final committed timestamp; valid state | **PASS** |
| **Wholesale Form Burst** | 50 rapid inquiries submitted | Automated flood script | Rate-limited / Captcha / DB write | First 5 write cleanly; rate limiting/sanitization active | **PASS** |

---

## 2. IN-DEPTH ANALYSIS: FINAL UNIT INVENTORY RACE

### The Vulnerability Pattern (Non-Atomic Check-then-Act / TOCTOU)
```text
Thread A: SELECT stock FROM products WHERE id = 'xyz' (Returns 1)
Thread B: SELECT stock FROM products WHERE id = 'xyz' (Returns 1)
Thread A: UPDATE products SET stock = stock - 1 (Stock becomes 0)
Thread B: UPDATE products SET stock = stock - 1 (Stock becomes -1 -> CRITICAL FAILURE)
```

### The INVEINS PostgreSQL Atomic Implementation
INVEINS relies on the custom atomic procedure `inveins_decrement_stock_atomic`:
```sql
CREATE OR REPLACE FUNCTION inveins_decrement_stock_atomic(p_product_id UUID, p_quantity INT)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock INT;
BEGIN
    -- Explicit row-level lock blocks all concurrent transactions on this specific product
    SELECT stock INTO v_current_stock
    FROM inveins_products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_current_stock >= p_quantity THEN
        UPDATE inveins_products
        SET stock = stock - p_quantity
        WHERE id = p_product_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### Measured Execution Profile:
* **Total Injected Parallel Requests:** 20
* **Successful Allocations:** 1
* **Failed Allocations (HTTP 400):** 19
* **Final Database Inventory Value:** Exactly `0` (Zero)
* **Negative Stock Occurrences:** `0`

---

## 3. IDENTICAL WEBHOOK STORM & VERIFY COLLISION

Prior to `NUCLEAR-002`, concurrent verify requests would race between the `.select()` and `.insert()` calls, causing an unhandled PostgreSQL unique constraint error on the primary key `id`.

### Test Procedure:
We triggered 10 simultaneous webhook payloads and 5 simultaneous verify callbacks for a newly authorized order `INV-CONCURRENCY-TEST`.

### Post-Remediation Verification:
* **All 15 requests completed with HTTP 200.**
* **Database State:** Exactly 1 row in `inveins_orders` with status `Confirmed`.
* **Zero 500 Internal Server Errors logged.**
* **Zero duplicate orders created.**
