"""Statistical computation service replicating Notebook 04 analytics."""

from typing import Any
import numpy as np
import pandas as pd
from backend.app.schemas.analytics import (
    ComparativeAnalyticsResponse,
    CorrelationMatrixResponse,
    DescriptiveAnalyticsResponse,
    DescriptiveStats,
    InstrumentShare,
)
from backend.app.services.data_service import data_service


class AnalyticsService:
    """Computes descriptive, correlation, and comparative statistics."""

    @staticmethod
    def _compute_stats(series: pd.Series) -> DescriptiveStats:
        clean = series.dropna()
        if clean.empty:
            return DescriptiveStats(
                count=0,
                mean=0.0,
                std=0.0,
                min=0.0,
                p25=0.0,
                median=0.0,
                p75=0.0,
                max=0.0,
                skewness=None,
                kurtosis=None,
            )
        q = clean.quantile([0.25, 0.5, 0.75])
        return DescriptiveStats(
            count=int(clean.count()),
            mean=float(clean.mean()),
            std=float(clean.std()),
            min=float(clean.min()),
            p25=float(q[0.25]),
            median=float(q[0.5]),
            p75=float(q[0.75]),
            max=float(clean.max()),
            skewness=float(clean.skew()) if len(clean) > 2 else None,
            kurtosis=float(clean.kurtosis()) if len(clean) > 3 else None,
        )

    def get_descriptive_analytics(self) -> DescriptiveAnalyticsResponse:
        """Descriptive statistics across futures, options, PCR, and returns."""
        fut = data_service.get_daily_futures()
        opt = data_service.get_daily_options_comparison()

        merged = pd.merge(
            fut[["Date", "Contracts", "Open_Interest", "Return"]],
            opt[["Date", "CE_Contracts", "PE_Contracts", "CE_OI", "PE_OI", "PCR_OI"]],
            on="Date",
            how="inner",
        )

        return DescriptiveAnalyticsResponse(
            futures_returns=self._compute_stats(merged["Return"]),
            pcr_oi=self._compute_stats(merged["PCR_OI"]),
            futures_contracts=self._compute_stats(merged["Contracts"]),
            ce_contracts=self._compute_stats(merged["CE_Contracts"]),
            pe_contracts=self._compute_stats(merged["PE_Contracts"]),
            futures_oi=self._compute_stats(merged["Open_Interest"]),
            ce_oi=self._compute_stats(merged["CE_OI"]),
            pe_oi=self._compute_stats(merged["PE_OI"]),
        )

    def get_correlation_matrix(self) -> CorrelationMatrixResponse:
        """Compute Pearson and Spearman correlation matrices across daily metrics."""
        fut = data_service.get_daily_futures()
        opt = data_service.get_daily_options_comparison()

        merged = pd.merge(
            fut[["Date", "Contracts", "Open_Interest", "Return"]].rename(
                columns={
                    "Contracts": "Futures_Contracts",
                    "Open_Interest": "Futures_OI",
                    "Return": "Futures_Return",
                }
            ),
            opt[["Date", "CE_Contracts", "PE_Contracts", "CE_OI", "PE_OI", "PCR_OI"]],
            on="Date",
            how="inner",
        ).dropna()

        feature_cols = [
            "Futures_Contracts",
            "CE_Contracts",
            "PE_Contracts",
            "Futures_OI",
            "CE_OI",
            "PE_OI",
            "Futures_Return",
            "PCR_OI",
        ]
        subset = merged[feature_cols]

        pearson_df = subset.corr(method="pearson").round(4)
        spearman_df = subset.corr(method="spearman").round(4)

        return CorrelationMatrixResponse(
            features=feature_cols,
            pearson=pearson_df.values.tolist(),
            spearman=spearman_df.values.tolist(),
        )

    def get_comparative_analytics(self) -> ComparativeAnalyticsResponse:
        """Consolidated comparative metrics replicating Notebook 04 conclusions."""
        fut = data_service.get_daily_futures()
        opt = data_service.get_daily_options_comparison()

        merged = pd.merge(fut, opt, on="Date", how="inner").dropna(subset=["Contracts", "CE_Contracts", "PE_Contracts"])

        total_fut_vol = merged["Contracts"].sum()
        total_ce_vol = merged["CE_Contracts"].sum()
        total_pe_vol = merged["PE_Contracts"].sum()
        combined_vol = total_fut_vol + total_ce_vol + total_pe_vol

        total_fut_oi = merged["Open_Interest"].sum()
        total_ce_oi = merged["CE_OI"].sum()
        total_pe_oi = merged["PE_OI"].sum()
        combined_oi = total_fut_oi + total_ce_oi + total_pe_oi

        pcr = merged["PCR_OI"].dropna()

        # Spearman correlation between CE and PE volume / OI
        vol_corr = float(merged["CE_Contracts"].corr(merged["PE_Contracts"], method="spearman"))
        oi_corr = float(merged["CE_OI"].corr(merged["PE_OI"], method="spearman"))

        fut_ret_vol = float(merged["Return"].dropna().std())

        return ComparativeAnalyticsResponse(
            common_trading_days=len(merged),
            average_pcr=round(float(pcr.mean()), 4),
            median_pcr=round(float(pcr.median()), 4),
            pcr_std=round(float(pcr.std()), 4),
            ce_pe_volume_correlation=round(vol_corr, 4),
            ce_pe_oi_correlation=round(oi_corr, 4),
            futures_return_volatility_pct=round(fut_ret_vol, 4),
            volume_shares=InstrumentShare(
                futures_pct=round((total_fut_vol / combined_vol) * 100.0, 2),
                ce_pct=round((total_ce_vol / combined_vol) * 100.0, 2),
                pe_pct=round((total_pe_vol / combined_vol) * 100.0, 2),
            ),
            open_interest_shares=InstrumentShare(
                futures_pct=round((total_fut_oi / combined_oi) * 100.0, 2),
                ce_pct=round((total_ce_oi / combined_oi) * 100.0, 2),
                pe_pct=round((total_pe_oi / combined_oi) * 100.0, 2),
            ),
        )


analytics_service = AnalyticsService()
