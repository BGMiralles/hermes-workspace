# Mission Brief: Falsification Campaign Round 2 — New Candidates vs v2 (34,248)

Date: 2026-08-30 | Author: Orchestrator (approved by BGM in chat)
Predecessor: `scripts/bull_optuna_falsify_vt015.py` (pre-registered 2026-07-17, run 2026-08-27 → winner (34,248)).

## Objective

Find a NEW deterministic signal/sizing candidate that beats the standing v2 (34,248) OUT-OF-SAMPLE under the same anti-p-hacking discipline that crowned v2. Output: evidence, not a deploy.

## Pre-registered protocol (FIXED BEFORE ANY RUN — do not tune the protocol)

1. Engine: causal main (w.iloc[i]), panel `data/ohlcv_ext`, universe LOCKED top100/floor100M,
   costs frozen (taker 5bp + slip 3bp, same as bull_config / falsify script).
2. Search space (from researcher brief `research/icaro-strategy-research.md`, 2026-08-30):
   - A) Multi-speed TSMOM blend: speeds subsets of {1m,3m,6m,12m} ≈ {30,90,180,365} daily bars,
     equal-weight or inverse-vol blend; vol_target ∈ {0.10,0.15}; lev cap 6.
   - B) Vol-targeting overlay on the v2 signal: vary vol est window {20,60,126} and
     sigma_target {0.10,0.15,0.20}; lev cap 6; breaker dd_limit 0.35 fixed.
   - C) DSL-registry combos (reversal_z / funding_mom / oi_div / TA palette) as small- weight
     diversifiers (≤25% risk share) around the v2 core. Funding/oi candidates marked
     FUNDING-DEP (feed is 28d stale — see data-ops task).
3. Split: TRAIN ≤ 2023-12-31 (Optuna/sweep may see it); TEST ≥ 2024-01-01 held out, evaluated ONCE.
4. Multiple-testing haircut: DSR of each winner deflated by the FULL trial count of its own
   family (A, B, C counted separately and jointly for the final read).
5. PRE-REGISTERED verdict — a candidate beats v2 iff on TEST (data never optimized on):
   - TEST Sharpe > v2's TEST Sharpe measured on the SAME panel run (rebuild v2 live as reproduction check, as the 2026-08-27 script did), AND
   - DSR(deflated by that family's total trials) > v2's DSR-deflated (0.718) , AND
   - full maxDD ≤ 35% (MANDATE), AND beats-BTC ≥ 3/4 regimes.
     Otherwise → v2 (34,248) STANDS; the round is reported as a null result.
6. Null results are VALUABLE: record them in the handoff exactly like wins (this is
   falsification, not promotion).

## Constraints

- Do NOT modify production: `icaro/backtest/bull_config.py` (FROZEN_BULL), existing
  forward-tracker crons, and `data/forward/*` are read-only for this mission.
- New scripts live in `scripts/` named `bull_falsify_r2_<family>.py` (one per family).
- No new deps without stating them in the handoff. Optuna already available.
- STOP after the checkpoint; wait for orchestrator (greenlight gate applies to any deploy).

## Deliverables

- Per-family: script + trial count + winner params + TEST metrics table (winner vs v2 vs vt0.15)
- Shared handoff: `memory/handoffs/swarm/builder-r2-falsification.md` with the verdict table
- Checkpoint in the required format (STATE/FILES_CHANGED/COMMANDS_RUN/RESULT/BLOCKER/NEXT_ACTION)
