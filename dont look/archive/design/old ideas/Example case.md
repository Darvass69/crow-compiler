
# Transaction Processing Problem

Operations:
```
authorize(card, amount)
capture(auth)
refund(charge)
void(auth)
```

typestate:
```
Created
Authorized
Captured
Refunded
Voided
Expired
```

state transition:
```
authorize : Created → Authorized
capture   : Authorized → Captured
refund    : Captured → Refunded
void      : Authorized → Voided
```


---


```
type Card = {
	number: string<>;
	expiration: Date<>;
	cvs: int;
}

function authorize(card: Card, amount: int) -> (
	
) {
}

```













Idempotency:
```
client times out
client retries
server processes twice
→ double charge
```

```
capture(auth, idempotency_key)
same key => same result
```


Conservation invariant:
```
sum(charges) - sum(refunds) = ledger delta
```


Concurrency correctness
```
Worker A captures
Worker B voids
```
- exclusive capability
- atomic compare-and-swap semantics
- linear resource ownership

Temporal correctness?
```
capture → (24h) → refund allowed
```



```
type Payment<S>

authorize : Payment<Created> -> Payment<Authorized>
capture   : Payment<Authorized> -> Payment<Captured>
refund    : Payment<Captured> -> Payment<Refunded>
void      : Payment<Authorized> -> Payment<Voided>

retry     : IdempotencyKey -> Action -> SameResult
```

- prevent double capture
- allow retries
- preserve money invariant
- concurrent workers
- expiration windows

# Minimal “reference API” you can copy

You don’t design semantics — just encode them:

`begin read account A read account B write A write B commit`

Then gradually enforce:

1. no partial commit
    
2. invariants preserved
    
3. concurrency safe
    
4. retry safe
    
5. persistent
    

Each step isolates a missing language feature.