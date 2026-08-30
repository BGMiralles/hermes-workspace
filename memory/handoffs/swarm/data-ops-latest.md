# HANDOFF — data-ops (Swarm Worker)

STATE: DONE (baseline inspection & data-availability verification complete)

## Assigned task

Inspect Icaro forward-tracker results in data/forward/\*.json, establish baseline
performance metrics (Sharpe, max drawdown, volatility-target compliance), verify data
availability for evaluating new strategy candidates.

## Baseline performance metrics (data/forward/, verified)

Recomputed against the repo's own `icaro.backtest.soak.soak_metrics` from the on-disk
parquet — values match the registered JSON exactly. Windows host, WSL parquet.

REFERENCE / standing book bull_vt015 (vt0.15, tsmom (30,360), FROZEN_BULL):
n_days = 43
Sharpe (ann) = -2.548
vol (ann) = 23.09% -> TARGET 15% => OVER-volted by ~54%. NOT volat-compliance.
maxDD (net) = 10.03% (dd_limit mandate 35%; within absolute mandate OK)
cum_net = -6.85% (book down over the forward window)
corr_btc = -0.49 (light anti-beta, as designed)
beats_btc = false (margin -28.6pp vs BTC over window)
watch = edge_decay p8 OK, dd_anomaly p74 OK -> no kill flags raised
funding_parity= ok (stale_days=28, est_bias -0.07% equity, flagged inmaterial <=0.25%)
go_real.ready = false. Blockers: maxDD 10.0% beyond the 30d p5 band (8.9%);
sl_exchange_validated_real / parity_live_vs_backtest not verified.

CANDIDATE v2 bull_v2 = (34,248) optuna winner vs vt0.15:
n_days = 2 only (forward from 2026-08-27). EVERYTHING NaN/meaningless.
cum_net -0.31%, maxdd 0.31%, vol NaN (<2 valid obs).
go_real.ready = false; blockers: min_days 2/30, band shorter than bootstrap horizon(30).

## Vol-target compliance (the headline answer)

vol_target = 0.15 (FROZEN_BULL.vol_target, bull_config.py:16 dataclass replace keeps 0.15).
Realized net vol = 0.2309 -> 1.54x target. The standing book is trading ABOVE its
volatility target across the entire 43-day forward window.

## Data availability for candidate evaluation

Feeds present on disk: ohlcv(+ext), funding (binance & okx, BTC & ETH), funding_ext, gex(+free),
liq, metrics5m, perp_30m, vol_snapshot. Universe frozen (576-panel coins / top100 floor100M).

Candidate scripts present & pre-registered in scripts/:
bull_derisk_variants_falsify.py, bull_multispeed_diverge_falsify.py (both KILLED 2026-08-30)
bull_optuna_falsify_vt015.py (winner (34,248): OOS 0.74 vs 0.50 baseline)
bull_pyramid_probe.py, bull_exit_overlay_probe.py, bull_letrun_probe.py,
bull_universe_probe.py / \_probe2.py, bull_amplify_leverage_probe.py, bull_breaker_leverage_probe.py
bull_baseline_pit.py, bull_full_report.py, bull_forward_fidelity.py

## Caveats for orchestrator

1. Funding feed STALE 28d (funding_adv=0 in refresh). Any funding-dependent candidate is
   evaluated on stale funding. Confirm/refresh funding source before judging funding-dep strategies.
2. v2 ((34,248)) has only 2 real forward days. Fair vs-production eval only after v2 track >= 30
   forward days (scheduled review 2026-09-10). Until then v2 is NOT benchmarkable.

## Proof / verification

Commands: wsl.exe bash -lc '...' (cd ~/icaro), data/forward cat; .venv/bin/python recompute via
`from icaro.backtest import soak; soak.soak_metrics(eq, {"BTC":...})` -> exact match to JSON.
Files: data/forward/{bull_v2,bull_vt015}\_metrics.json + \*\_track.parquet (read-only, no writes).

## BLOCKER

None. Data assets exist, pipeline deterministically recomputable. Caveat only: stale funding.

## NEXT_ACTION

Orchestrator: route candidate evaluation once v2 >=30 forward days (~2026-09-10) — e.g. run a
pre-registered falsification (bull_derisk_variants / bull_multispeed_diverge) or a direct
(34,248) vs (30,360) forward comparison on the already-ready ohlcv side. Fix funding feed in
parallel if any funding-dependent candidate is queued.
