"""Pydantic schemas for NIFTY 50 Options endpoints."""

from typing import Optional
from pydantic import BaseModel, Field


class OptionsSummary(BaseModel):
    """Overall summary metrics for NIFTY 50 Call (CE) and Put (PE) options."""

    total_ce_records: int = Field(..., description="Total observed Call Option contract rows")
    total_pe_records: int = Field(..., description="Total observed Put Option contract rows")
    unique_trading_dates: int = Field(..., description="Total unique trading dates")
    date_range_start: str = Field(..., description="Earliest trading date (YYYY-MM-DD)")
    date_range_end: str = Field(..., description="Latest trading date (YYYY-MM-DD)")
    total_ce_contracts: float = Field(..., description="Sum of all CE contracts traded")
    total_pe_contracts: float = Field(..., description="Sum of all PE contracts traded")
    total_ce_turnover_lakhs: float = Field(..., description="Sum of CE notional turnover in ₹ Lakhs")
    total_pe_turnover_lakhs: float = Field(..., description="Sum of PE notional turnover in ₹ Lakhs")
    total_ce_premium_turnover_lakhs: float = Field(..., description="Sum of CE premium turnover in ₹ Lakhs")
    total_pe_premium_turnover_lakhs: float = Field(..., description="Sum of PE premium turnover in ₹ Lakhs")
    avg_pcr_oi: float = Field(..., description="Mean Put-Call Ratio based on Open Interest")
    median_pcr_oi: float = Field(..., description="Median Put-Call Ratio based on Open Interest")
    avg_pcr_volume: float = Field(..., description="Mean Put-Call Ratio based on contract volume")


class DailyOptionsComparisonPoint(BaseModel):
    """Daily side-by-side comparison of Call and Put options."""

    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    ce_contracts: float = Field(..., description="Daily Call contracts traded")
    pe_contracts: float = Field(..., description="Daily Put contracts traded")
    total_contracts: float = Field(..., description="Combined options contracts traded")
    ce_oi: float = Field(..., description="Daily Call aggregate Open Interest")
    pe_oi: float = Field(..., description="Daily Put aggregate Open Interest")
    total_oi: float = Field(..., description="Combined aggregate Open Interest")
    pcr_oi: Optional[float] = Field(None, description="Put-Call Ratio by Open Interest (PE_OI / CE_OI)")
    pcr_volume: Optional[float] = Field(None, description="Put-Call Ratio by Volume (PE_Contracts / CE_Contracts)")
    ce_turnover_lakhs: float = Field(..., description="Daily Call notional turnover in ₹ Lakhs")
    pe_turnover_lakhs: float = Field(..., description="Daily Put notional turnover in ₹ Lakhs")
    ce_premium_turnover_lakhs: Optional[float] = Field(None, description="Daily Call premium turnover in ₹ Lakhs")
    pe_premium_turnover_lakhs: Optional[float] = Field(None, description="Daily Put premium turnover in ₹ Lakhs")


class OptionsComparisonResponse(BaseModel):
    """Time-series of daily options comparison."""

    total_records: int = Field(..., description="Total dates in range")
    series: list[DailyOptionsComparisonPoint] = Field(..., description="Daily options observations")


class OptionsVolumePoint(BaseModel):
    """Daily volume comparison point."""

    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    ce_contracts: float = Field(..., description="CE contracts traded")
    pe_contracts: float = Field(..., description="PE contracts traded")
    total_contracts: float = Field(..., description="Total contracts traded")
    ce_pe_volume_ratio: Optional[float] = Field(None, description="Ratio of CE to PE volume")


class OptionsVolumeResponse(BaseModel):
    """Time-series of options trading volume."""

    total_records: int = Field(..., description="Total dates in range")
    series: list[OptionsVolumePoint] = Field(..., description="Daily volume observations")


class OptionsPremiumTurnoverPoint(BaseModel):
    """Daily premium turnover observation."""

    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    ce_premium_turnover_lakhs: Optional[float] = Field(None, description="CE premium turnover in ₹ Lakhs")
    pe_premium_turnover_lakhs: Optional[float] = Field(None, description="PE premium turnover in ₹ Lakhs")
    total_premium_turnover_lakhs: Optional[float] = Field(None, description="Total premium turnover in ₹ Lakhs")


class OptionsPremiumTurnoverResponse(BaseModel):
    """Time-series of options premium turnover."""

    total_records: int = Field(..., description="Total dates in range")
    series: list[OptionsPremiumTurnoverPoint] = Field(..., description="Daily premium turnover observations")


class StrikeAnalysisPoint(BaseModel):
    """Open Interest and Volume aggregated by strike price."""

    strike_price: float = Field(..., description="Option strike price")
    ce_open_interest: float = Field(..., description="Call Open Interest for strike")
    pe_open_interest: float = Field(..., description="Put Open Interest for strike")
    ce_contracts: float = Field(..., description="Call contracts traded for strike")
    pe_contracts: float = Field(..., description="Put contracts traded for strike")
    pcr_oi: Optional[float] = Field(None, description="Put-Call Ratio by OI for strike")


class StrikeAnalysisResponse(BaseModel):
    """Strike-wise Open Interest and volume distribution."""

    total_strikes: int = Field(..., description="Count of strikes included")
    snapshot_date: Optional[str] = Field(None, description="Specific date if filtered, or overall aggregation")
    strikes: list[StrikeAnalysisPoint] = Field(..., description="Strike breakdown sorted by strike price")


class ExpiryAnalysisPoint(BaseModel):
    """Contract volume and Open Interest aggregated by expiration date."""

    expiry: str = Field(..., description="Expiration date (YYYY-MM-DD)")
    total_contracts: float = Field(..., description="Total contracts traded for expiry")
    total_open_interest: float = Field(..., description="Peak or latest Open Interest for expiry")
    ce_contracts: float = Field(..., description="Call contracts for expiry")
    pe_contracts: float = Field(..., description="Put contracts for expiry")
    unique_strikes: int = Field(..., description="Number of unique strike prices traded for expiry")


class ExpiryAnalysisResponse(BaseModel):
    """Expiry-wise distribution of options market activity."""

    total_expiries: int = Field(..., description="Count of distinct expiry dates")
    expiries: list[ExpiryAnalysisPoint] = Field(..., description="Expiry breakdown sorted by expiry date")
