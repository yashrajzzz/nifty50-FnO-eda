"""Pydantic schemas for comparative statistical analytics endpoints."""

from typing import Optional
from pydantic import BaseModel, Field


class DescriptiveStats(BaseModel):
    """Statistical summary metrics for a numerical distribution."""

    count: int = Field(..., description="Number of non-null observations")
    mean: float = Field(..., description="Arithmetic mean")
    std: float = Field(..., description="Standard deviation")
    min: float = Field(..., description="Minimum value")
    p25: float = Field(..., description="25th percentile (Q1)")
    median: float = Field(..., description="Median (50th percentile)")
    p75: float = Field(..., description="75th percentile (Q3)")
    max: float = Field(..., description="Maximum value")
    skewness: Optional[float] = Field(None, description="Sample skewness")
    kurtosis: Optional[float] = Field(None, description="Sample kurtosis")


class DescriptiveAnalyticsResponse(BaseModel):
    """Descriptive statistics across derivatives instruments and market metrics."""

    futures_returns: DescriptiveStats = Field(..., description="Daily NIFTY returns distribution")
    pcr_oi: DescriptiveStats = Field(..., description="Daily Put-Call Ratio distribution")
    futures_contracts: DescriptiveStats = Field(..., description="Daily futures contract volume distribution")
    ce_contracts: DescriptiveStats = Field(..., description="Daily Call option contract volume distribution")
    pe_contracts: DescriptiveStats = Field(..., description="Daily Put option contract volume distribution")
    futures_oi: DescriptiveStats = Field(..., description="Daily futures Open Interest distribution")
    ce_oi: DescriptiveStats = Field(..., description="Daily Call Open Interest distribution")
    pe_oi: DescriptiveStats = Field(..., description="Daily Put Open Interest distribution")


class CorrelationMatrixResponse(BaseModel):
    """Pearson and Spearman correlation matrices across market features."""

    features: list[str] = Field(..., description="Ordered list of feature labels")
    pearson: list[list[float]] = Field(..., description="2D square Pearson correlation matrix")
    spearman: list[list[float]] = Field(..., description="2D square Spearman correlation matrix")


class InstrumentShare(BaseModel):
    """Market share percentage breakdown across instruments."""

    futures_pct: float = Field(..., description="Futures percentage share")
    ce_pct: float = Field(..., description="Call Options percentage share")
    pe_pct: float = Field(..., description="Put Options percentage share")


class ComparativeAnalyticsResponse(BaseModel):
    """Consolidated comparative analytics matching Notebook 04 methodology."""

    common_trading_days: int = Field(..., description="Number of aligned trading sessions (1,421)")
    average_pcr: float = Field(..., description="Mean Open Interest Put-Call Ratio")
    median_pcr: float = Field(..., description="Median Open Interest Put-Call Ratio")
    pcr_std: float = Field(..., description="Standard deviation of Put-Call Ratio")
    ce_pe_volume_correlation: float = Field(..., description="Spearman correlation between CE and PE volume")
    ce_pe_oi_correlation: float = Field(..., description="Spearman correlation between CE and PE Open Interest")
    futures_return_volatility_pct: float = Field(..., description="Annualized or daily return volatility for Futures")
    volume_shares: InstrumentShare = Field(..., description="Proportional volume share across instruments")
    open_interest_shares: InstrumentShare = Field(..., description="Proportional Open Interest share across instruments")
