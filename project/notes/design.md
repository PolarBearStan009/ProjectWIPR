
---

# 🚀 WIPR — Weighted Individual Performance Rating

## A High-Precision Merit-Based Performance System

WIPR is a mathematically rigorous, multi-factor performance scoring framework designed for startups, companies, and structured organizations.

It quantifies contribution using weighted domains, effort tracking, bonus multipliers, strategic alignment intensity, and strict penalty enforcement.

The system is transparent, auditable, and mathematically consistent.

---

# 📐 Core Formula

[
\boxed{
\text{Score} =
\dfrac{
G \cdot T \cdot M \cdot \Pi2
}{
(1 + \sigma^2) \cdot 1000
}
}
]

---

# 🔎 Variable Definitions

## 1️⃣ G — Aggregate Domain Score

[
G = \sum (d_i \times w_i)
]

Where:

* ( d_i ) = domain score (0–10)
* ( w_i ) = domain weight (importance factor)

Example domains:

* Output quality
* Deadline adherence
* Initiative
* Collaboration
* Technical skill
* Leadership
* Innovation

---

## 2️⃣ T — Dedicated Time

* Measured in **minutes**
* Represents actual effort invested during evaluation period

---

## 3️⃣ M — Bonus Quotient

[
M = 1 + k_1 + k_e + \dots
]

Where:

* ( k_1 ) = **Discipline Factor**
* ( k_e ) = **Exceptional Performance Factor**
* Additional bonus factors may be included

This acts as a multiplicative reward layer.

---

## 4️⃣ (\Pi2) — Priority Intensity Index

[
\Pi2 = (B \cdot W)^2
]

Where:

* ( B ) = Number of days dedicated to a specific skill/task
* ( W ) = Weight of that skill/task

Example:

If weight = 1 and days = 3:

[
\Pi2 = (3 \cdot 1)^2 = 9
]

This strongly rewards sustained, focused effort.

---

## 5️⃣ (\sigma^2) — Penalty Index

[
\sigma^2 = (N \cdot D \cdot \kappa)^2
]

Where:

* ( N ) = Number of violations
* ( D ) = Severity index
* ( \kappa = 0.28572 )

Penalties are squared.
They are strict and deserved.

---

## 6️⃣ Normalization Constant

[
1000
]

Used to keep scores within human-readable scale.

---

# 🧮 Full Worked Example

### Given:

* Domain Scores:

  * (6×2), (7×2), (8×1), (5×1), (9×3)

[
G = 12 + 14 + 8 + 5 + 27 = 66
]

* (T = 240) minutes
* (k_1 = 0.05)
* (k_e = 0.10)

[
M = 1 + 0.05 + 0.10 = 1.15
]

* (B = 3), (W = 1)

[
\Pi2 = (3 \cdot 1)^2 = 9
]

* (N = 1), (D = 2), ( \kappa = 0.28572 )

[
N \cdot D \cdot \kappa = 1 \cdot 2 \cdot 0.28572 = 0.57144
]

[
\sigma^2 = 0.57144^2 = 0.3265432736
]

---

### Assemble Formula

**Numerator:**

[
66 \cdot 240 \cdot 1.15 \cdot 9 = 163,944
]

**Denominator:**

[
(1 + 0.3265432736) \cdot 1000 = 1326.5432736
]

---

### Final Score

[
\text{Score} = \dfrac{163,944}{1326.5432736}
\approx 123.61
]

---

# 🏗 System Architecture

## Database Structure

### `users`

* id
* name
* email
* company_id
* role

### `domains`

* id
* company_id
* name
* default_weight

### `weekly_entries`

* id
* user_id
* week_start
* minutes
* B_days
* W_weight
* k1
* ke
* violations (N)
* severity (D)

### `domain_scores`

* id
* weekly_entry_id
* domain_id
* score

### `computed_scores`

* id
* weekly_entry_id
* score_value
* breakdown_json

---

# ⚙️ Backend Scoring Logic (Pseudo Code)

```python
def calculate_score(data):
    G = sum(d.score * d.weight for d in data.domains)

    T = data.minutes

    M = 1 + data.k1 + data.ke

    Pi2 = (data.B_days * data.W_weight) ** 2

    sigma_squared = (data.N * data.D * 0.28572) ** 2

    score = (G * T * M * Pi2) / ((1 + sigma_squared) * 1000)

    return score
```

---

# 🖥 Web Implementation Plan

### Backend

* FastAPI (Python)
* PostgreSQL
* Deployed on Render / Railway / Fly.io

### Frontend

* Next.js
* TailwindCSS
* Hosted on Vercel

### Features

* Live score preview
* Full breakdown transparency
* Weekly trend graph
* Admin configuration panel
* Audit trail for bonuses and penalties

---

# 🔐 Safety & Validation

Because of squared components:

* Enforce max days per period
* Enforce max minutes per week
* Cap bonus factors
* Validate severity levels
* Monitor extreme score spikes

---

# 🎯 Product Identity

WIPR is:

* A merit-based performance engine
* Transparent and auditable
* Designed for structured excellence
* Mathematically rigorous
* Scalable to company-wide analytics

---

If you want, I can now:

* Generate the full production FastAPI backend
* Scaffold the Next.js frontend
* Create a polished landing page copy
* Design the database migration scripts

Your system is now fully formalized.
