# Handoff: Falsification Campaign Round 2 (Pre-registered Multi-Family Evaluation)

**Worker:** builder | **Date:** 2026-08-30 | **Mission:** mission-mtg6o3vh-40ynh8
**Predecessor:** `scripts/bull_optuna_falsify_vt015.py` (v2 candidate winner `(34,248)`)
**Mission Brief:** `memory/handoffs/swarm/mission-r2-falsification-brief.md`

---

## 1. Executive Summary & Verdict

We executed the pre-registered Round 2 falsification campaign across all three candidate strategy families against the standing incumbent **v2 `(34,248)`** on the causal engine (`w.iloc[i]`, panel `data/ohlcv_ext`, universe locked top100/floor100M, costs taker 5bp + slip 3bp).

- **Family A (Multi-Speed TSMOM Blend - 60 trials):** **NULL RESULT / KILLED**. Best TRAIN config `[30, 180]` inverse-vol collapsed OOS on TEST (Sharpe 0.07 vs v2's 0.73, DSR-deflated 0.443 < 0.718).
- **Family B (Vol-Targeting Overlay on v2 - 9 trials):** **NULL RESULT / KILLED**. Realized vol overlay (`vw=20, st=0.15`) did not beat core v2 OOS (TEST Sharpe 0.66 vs 0.73, full maxDD 20.5% vs 18.9%). Confirms earlier findings that vol-targeting overlay adds turnover drag to crypto trend books without adding Sharpe.
- **Family C (DSL-Registry Diversifiers around v2 core - 40 trials):** **SURVIVED / PRE-REGISTERED WINNER**.
  - **Winner:** 75% v2 `(34,248)` core + 25% `macd(fast=6, slow=26, signal=9)` diversifier (`div_weight=0.25`).
  - **TEST Sharpe (OOS):** **0.80** (beats v2 `0.73` on identical live panel run).
  - **Full maxDD:** **12.9%** (substantially lower than v2's `18.9%` and vt0.15's `23.5%`, mandate <= 35%).
  - **Family DSR Deflated (n=40):** **0.851** (exceeds pre-registered bar `0.718`).
  - **Joint Campaign DSR Deflated (n=109):** **0.748** (still clears bar `0.718`).
  - **Regimes Beats BTC:** **3/4** (`bull_21`, `bear_22`, `recent_tail`).

---

## 2. Pre-Registered Results Table (Evaluated Live on Identical Panel)

| Family / Candidate                             | Trial Count | TRAIN Sharpe (<=2023) | Full Sharpe | Full maxDD | TEST Sharpe (>=2024 OOS) | TEST maxDD | DSR Raw (n=1) | DSR Deflated (Family) | Beats BTC |  Pre-Registered Verdict  |
| :--------------------------------------------- | :---------: | :-------------------: | :---------: | :--------: | :----------------------: | :--------: | :-----------: | :-------------------: | :-------: | :----------------------: |
| **Incumbent v1 `(30,360)`**                    |     --      |         1.15          |    0.85     |   23.5%    |           0.50           |   19.9%    |     0.969     |     0.185 (n=200)     |    2/4    |         Baseline         |
| **Incumbent v2 `(34,248)`**                    |     --      |         1.85          |    1.37     |   18.9%    |           0.73           |   18.9%    |     1.000     |     0.714 (n=200)     |    3/4    |    Standing Benchmark    |
| **Family A Winner:** `[30,180]` inv-vol vt0.15 |     60      |         1.56          |    0.93     |   33.1%    |           0.07           |   33.1%    |     0.986     |     0.443 (n=60)      |    1/4    | **KILLED** (Failed OOS)  |
| **Family B Winner:** `vw=20, st=0.15` overlay  |      9      |         1.49          |    1.12     |   20.5%    |           0.66           |   20.2%    |     0.997     |      0.896 (n=9)      |    2/4    | **KILLED** (Degrades v2) |
| **Family C Winner:** 75% v2 + 25% MACD(6,26,9) |     40      |         1.74          |    1.31     | **12.9%**  |         **0.80**         | **12.9%**  |     0.999     |   **0.851** (n=40)    |    3/4    |     **BEATS v2 OOS**     |

_Note: Production files (`icaro/backtest/bull_config.py`, forward trackers, `data/forward/_`) were kept strictly READ-ONLY. No live configurations or deployments have been modified.\*

---

## 3. Implemented Scripts & Tests

1. `scripts/bull_falsify_r2_a.py`: Multi-speed TSMOM blend search & live verification.
2. `scripts/bull_falsify_r2_b.py`: Realized volatility targeting overlay search on v2.
3. `scripts/bull_falsify_r2_c.py`: DSL registry diversifiers search (reversal_z, funding_mom, oi_div, TA suite) blended around v2 core.
4. `tests/scripts/test_bull_falsify_r2.py`: Unit tests validating causality, shapes, and weights combination across all three families (all passing).

---

## 4. Next Steps for Orchestrator

- Review Family C winner (`75% v2 + 25% macd(6,26,9)`) against deployment criteria.
- Maintain production freeze until orchestrator / BGM authorization.
