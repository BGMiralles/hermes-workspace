# Research: Candidate Quantitative Strategies for the Icaro Framework

Worker: researcher | Mission: mission-mteu55k0-8s8rgo | 2026-08-30

Note: "Icaro" has no public published framework (searched) — treated as the user's
deterministic-control-plane orchestrator (Policy/Risk Engine, RESEARCH→BACKTEST→PAPER→LIVE).
All three candidate strategies are deterministic, rules-based, and backtest-friendly,
i.e. compatible with execution outside the LLM.

## 1. Time-Series Momentum (TSMOM)

Literature:

- Moskowitz, Ooi & Pedersen (2012), "Time Series Momentum", J. Financial Economics 104(2):228-250.
  PDF: https://www.sciencedirect.com/science/article/abs/pii/S1386418116301379
  Working PDF: https://w4.stern.nyu.edu/facdir/lpederse/papers/TimeSeriesMomentum.pdf
- Huang, Li, Wang & Zhou (2020), "Time series momentum: Is it there?" JFE 135(1) — replication critique.
- Kim, Tse & Wald (2016), "Time Series Momentum and Volatility Scaling", J. Financial Markets 30:103-125.

Formulation (MOP 2012):
signal*s(t) = sign( r*{t-12m, t}^{s} ) # past 12m own excess return
w*s(t) = signal_s(t) * ( sigma_target / sigma_s(t-1) ) # vol-scaled position
r_TSMOM(t+1) = (1/N_t) * sum_s w_s(t) \* r*{t,t+1}^{s}
Vol estimate: EWMA of squared daily returns, delta = 0.94 (RiskMetrics),
sigma^2*t = 261 * (1-delta) * sum*{i>=0} delta^i \* r\_{t-1-i}^2 (annualized)
MOP target each instrument at 40% ex-ante vol (paper factor version); per-instrument
variant 0.60%/sigma_t-1 monthly sizing. Realized portfolio vol ~12% annualized 1985-2009.

Suggested backtest parameter ranges:

- Lookback k: 1, 3, 6, 9, 12 months (MOP: results robust across 1-12m; strongest ~12m)
- Holding h: 1, 3, 6, 12 months (MOP: robust across h; use overlapping h=12 if tradeable)
- Vol target per instrument: 10-40% annualized (aggregate 10-15%)
- EWMA decay delta: 0.94-0.97 (equivalently 60-day EWMA stdev)
- Universe: 50+ liquid futures across equity index, bonds, FX, commodities
- Known caveats: Hurst/Ooi/Pedersen 2017 report decay post-2009; Kim et al. 2016 show
  alpha sensitivity to vol-scaling assumptions; momentum-crash risk (Daniel & Moskowitz 2016).

## 2. Volatility Targeting / Volatility-Managed Portfolios

Literature:

- Moreira & Muir (2017), "Volatility-Managed Portfolios", Journal of Finance 72(4):1611-1644.
- Harvey, Hoyle, Korgaonkar, Rattray, Sargaison & Van Hemert (2018), "The Impact of Volatility
  Targeting", Journal of Portfolio Management 45(1). https://www.man.com/insights/the-impact-of-volatility-targeting

Formulation:
w*t = min( sigma_target / sigma_hat*{t-1}, leverage_cap ) # exposure scaled to realized vol
sigma_hat: EWMA stdev of daily returns (delta ~0.94, ~1-3 month window)
Mechanism: vol clustering + leverage effect (neg. return-vol correlation) means scaling
down in high vol acts as a short-term momentum overlay; improves Sharpe for risk assets
(equities, credit) but NOT reliably for commodities/FX (Harvey et al. 2018). Also thins
the left tail and cuts max drawdown for balanced/risk-parity allocations.

Suggested backtest parameter ranges:

- sigma_target: 10-15% annualized (per asset), portfolio 8-12%
- Estimation window: 20 / 60 / 126 trading days EWMA or rolling stdev
- Rebalance: daily (vol estimate) with weekly/monthly trade-frequency cap
- Leverage cap: 1.5-2.0x notional; floors to avoid pathological sizing in ultra-low vol
- Test on: equity indices and credit (expected Sharpe gain ~35-50% full sample per
  Moreira-Muir style results, less post-1990), commodities/FX as falsification cases.

## 3. Multi-Asset Trend Following (CTA-style)

Literature:

- Hurst, Ooi & Pedersen (2017), "A Century of Evidence on Trend-Following Investing",
  Journal of Portfolio Management 44(1):15-29. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2993026
- Baltas & Kosowski (2013/2020) on TSMOM vs CTA indices and demomentumization.
- Han, Zhou & Zhu (2016), "Taming Momentum Crashes" / trend vs momentum crash literature.

Formulation (HOP 2017 implementation):
For each asset and each lookback L in {1m, 3m, 12m} (they use 3 horizons):
signal = sign( excess return over L months )
position_L = signal _ ( sigma_target_per_asset / sigma_hat ) _ (1/H)
Aggregate: average over H = 3 horizons, equal risk per asset across 4 asset classes.
Portfolio vol target ~10%; long history 1880-2016, Sharpe ~1.0 gross, low equity beta,
best performance in crises (convexity).

Suggested backtest parameter ranges:

- Lookbacks: {1,3}, {3,12}, {1,3,6,12} months, equal-weighted signal blend
- Signal: sign of past return (binary) vs continuous score r_L / (sigma \* sqrt(L)) —
  test both; binary is more robust, continuous smoother turnover
- Assets: 40-60 liquid futures (equity idx, rates/bonds, FX, commodities)
- Vol target: 10% portfolio, 40/bond 10-20% per-asset typical CTA scaling
- Rebalance: daily vol update, monthly signal refresh (turnover 1-3x/year typical)
- Fees assumption: include 1-2% annual cost + 2-5bp per side; trend is turnover-sensitive.

## Compatibility with Icaro (deterministic control plane)

All three are fully rules-based (no ML), so they belong entirely OUTSIDE the LLM:
policy engine emits positions from data; risk engine enforces vol targets/leverage caps;
LLM never sizes trades. Recommended pipeline: TSMOM (core signal) + volatility targeting
(sizing layer, shared EWMA vol estimator) + multi-asset blend (diversification) is
effectively one coherent strategy stack, matching the AQR/HOP architecture.

## Open uncertainties

- Post-2010 decay of TSMOM returns (in-sample optimism in MOP 2012; Hurst et al. show
  weaker but positive post-GFC performance).
- Whether vol targeting alpha persists post-1990 (Moreira-Muir out-of-sample debate).
- Cost/turnover assumptions dominate net results at short lookbacks.
