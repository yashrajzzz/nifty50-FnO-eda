"""Pydantic schemas for NIFTY 50 Futures endpoints."""

from typing import Optional
from pydantic import BaseModel, Field


class FuturesSummary(BaseModel):
    """Aggregate summary statistics for NIFTY 50 Futures."""

    total_records: int = Field(..., description="Total contract observations in dataset")
    unique_trading_dates: int = Field(..., description="Number of distinct trading dates")
    date_range_start: str = Field(..., description="Earliest trading date (YYYY-MM-DD)")
    date_range_end: str = Field(..., description="Latest trading date (YYYY-MM-DD)")
    total_contracts_traded: float = Field(..., description="Sum of contracts traded")
    total_turnover_lakhs: float = Field(..., description="Sum of turnover in ₹ Lakhs")
    avg_daily_contracts: float = Field(..., description="Average daily contracts traded")
    avg_daily_turnover_lakhs: float = Field(..., description="Average daily turnover in ₹ Lakhs")
    avg_open_interest: float = Field(..., description="Mean Open Interest across observations")
    max_open_interest: float = Field(..., description="Peak observed Open Interest")
    latest_close: Optional[float] = Field(None, description="Most recent contract closing price")


class FuturesPricePoint(BaseModel):
    """Single contract price record."""

    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    expiry: Optional[str] = Field(None, description="Contract expiry date (YYYY-MM-DD)")
    open: Optional[float] = Field(None, description="Opening price")
    high: Optional[float] = Field(None, description="Highest price of session")
    low: Optional[float] = Field(None, description="Lowest price of session")
    close: Optional[float] = Field(None, description="Closing price")
    settle_price: Optional[float] = Field(None, description="Daily settlement price")
    underlying_value: Optional[float] = Field(None, description="Derivatives-implied underlying value proxy")


class FuturesPricesResponse(BaseModel):
    """Historical futures prices list with pagination."""

    total_records: int = Field(..., description="Total records matching filter")
    returned_records: int = Field(..., description="Count of records in current page")
    prices: list[FuturesPricePoint] = Field(..., description="Price observations")


class FuturesVolumePoint(BaseModel):
    """Daily futures volume observation."""

    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    contracts: float = Field(..., description="Total contracts traded")
    turnover_lakhs: float = Field(..., description="Total turnover in ₹ Lakhs")
    volume_change_pct: Optional[float] = Field(None, description="Percentage change in volume vs previous session")


class FuturesVolumeResponse(BaseModel):
    """Time-series of futures trading volume."""

    total_records: int = Field(..., description="Total dates in range")
    series: list[FuturesVolumePoint] = Field(..., description="Daily volume observations")


class FuturesTurnoverPoint(BaseModel):
    """Daily futures turnover observation."""

    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    turnover_lakhs: float = Field(..., description="Turnover in ₹ Lakhs")
    turnover_change_pct: Optional[float] = Field(None, description="Percentage change in turnover vs previous session")


class FuturesTurnoverResponse(BaseModel):
    """Time-series of futures trading turnover."""

    total_records: int = Field(..., description="Total dates in range")
    series: list[FuturesTurnoverPoint] = Field(..., description="Daily turnover observations")


class FuturesOIPoint(BaseModel):
    """Daily futures Open Interest observation."""

    date: str = Field(..., description="Trading date (YYYY-MM-DD)")
    open_interest: float = Field(..., description="Total Open Interest")
    change_in_oi: Optional[float] = Field(None, description="Absolute change in Open Interest")
    oi_change_pct: Optional[float] = Field(None, description="Percentage change in Open Interest")


class FuturesOIResponse(BaseModel):
    """Time-series of futures Open Interest."""

    total_records: int = Field(..., description="Total dates in range")
    series: list[FuturesOIPoint] = Field(..., description="Daily Open Interest observations")
