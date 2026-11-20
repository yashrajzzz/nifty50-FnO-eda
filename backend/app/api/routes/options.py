"""API endpoints for NIFTY 50 Options comparison, PCR, strike, and expiry analysis."""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Query
import numpy as np
import pandas as pd
from backend.app.core.errors import AppException
from backend.app.schemas.base import ApiResponse
from backend.app.schemas.options import (
    DailyOptionsComparisonPoint,
    ExpiryAnalysisPoint,
    ExpiryAnalysisResponse,
    OptionsComparisonResponse,
    OptionsPremiumTurnoverPoint,
    OptionsPremiumTurnoverResponse,
    OptionsSummary,
    OptionsVolumePoint,
    OptionsVolumeResponse,
    StrikeAnalysisPoint,
    StrikeAnalysisResponse,
)
from backend.app.services.data_service import data_service

router = APIRouter(prefix="/options", tags=["Options"])


def validate_dates(start_date: Optional[date], end_date: Optional[date]) -> None:
    if start_date and end_date and start_date > end_date:
        raise AppException(
            message="start_date cannot be later than end_date",
            status_code=400,
            code="INVALID_DATE_RANGE",
            details={"start_date": str(start_date), "end_date": str(end_date)},
        )


@router.get(
    "/summary",
    response_model=ApiResponse[OptionsSummary],
    summary="Options Market Summary",
    description="Overall statistics for Call and Put options, total turnover, contracts, and aggregate PCR.",
)
async def get_options_summary() -> ApiResponse[OptionsSummary]:
    daily = data_service.get_daily_options_comparison()
    calls = data_service.get_calls_data(columns=["Date"])
    puts = data_service.get_puts_data(columns=["Date"])

    pcr_oi = daily["PCR_OI"].dropna()
    pcr_vol = daily["PCR_Volume"].dropna()

    summary = OptionsSummary(
        total_ce_records=len(calls),
        total_pe_records=len(puts),
        unique_trading_dates=len(daily),
        date_range_start=str(daily["Date"].min().date()),
        date_range_end=str(daily["Date"].max().date()),
        total_ce_contracts=float(daily["CE_Contracts"].sum()),
        total_pe_contracts=float(daily["PE_Contracts"].sum()),
        total_ce_turnover_lakhs=float(daily["CE_Turnover"].sum()),
        total_pe_turnover_lakhs=float(daily["PE_Turnover"].sum()),
        total_ce_premium_turnover_lakhs=float(daily["CE_Premium_Turnover"].sum()),
        total_pe_premium_turnover_lakhs=float(daily["PE_Premium_Turnover"].sum()),
        avg_pcr_oi=round(float(pcr_oi.mean()), 4),
        median_pcr_oi=round(float(pcr_oi.median()), 4),
        avg_pcr_volume=round(float(pcr_vol.mean()), 4),
    )
    return ApiResponse(data=summary, message="Options summary retrieved successfully")


@router.get(
    "/comparison",
    response_model=ApiResponse[OptionsComparisonResponse],
    summary="Daily CE vs PE Comparison & PCR",
    description="Daily side-by-side comparison of Call and Put options contracts, Open Interest, PCR, and turnover.",
)
async def get_options_comparison(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(500, ge=1, le=1500, description="Maximum data points"),
) -> ApiResponse[OptionsComparisonResponse]:
    validate_dates(start_date, end_date)
    daily = data_service.get_daily_options_comparison()

    filtered = daily.copy()
    if start_date:
        filtered = filtered[filtered["Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Date"] <= pd.to_datetime(end_date)]

    filtered = filtered.head(limit)
    series = []
    for _, row in filtered.iterrows():
        series.append(
            DailyOptionsComparisonPoint(
                date=str(row["Date"].date()),
                ce_contracts=float(row["CE_Contracts"]),
                pe_contracts=float(row["PE_Contracts"]),
                total_contracts=float(row["Total_Contracts"]),
                ce_oi=float(row["CE_OI"]),
                pe_oi=float(row["PE_OI"]),
                total_oi=float(row["Total_OI"]),
                pcr_oi=round(float(row["PCR_OI"]), 4) if pd.notna(row["PCR_OI"]) else None,
                pcr_volume=round(float(row["PCR_Volume"]), 4) if pd.notna(row["PCR_Volume"]) else None,
                ce_turnover_lakhs=float(row["CE_Turnover"]),
                pe_turnover_lakhs=float(row["PE_Turnover"]),
                ce_premium_turnover_lakhs=float(row["CE_Premium_Turnover"])
                if pd.notna(row["CE_Premium_Turnover"])
                else None,
                pe_premium_turnover_lakhs=float(row["PE_Premium_Turnover"])
                if pd.notna(row["PE_Premium_Turnover"])
                else None,
            )
        )

    return ApiResponse(
        data=OptionsComparisonResponse(total_records=len(series), series=series),
        message="Options comparison retrieved successfully",
    )


@router.get(
    "/volume",
    response_model=ApiResponse[OptionsVolumeResponse],
    summary="Options Volume Time-Series",
    description="Daily Call vs Put contract volume breakdown and CE/PE volume ratio.",
)
async def get_options_volume(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(500, ge=1, le=1500, description="Maximum data points"),
) -> ApiResponse[OptionsVolumeResponse]:
    validate_dates(start_date, end_date)
    daily = data_service.get_daily_options_comparison()

    filtered = daily.copy()
    if start_date:
        filtered = filtered[filtered["Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Date"] <= pd.to_datetime(end_date)]

    filtered = filtered.head(limit)
    series = []
    for _, row in filtered.iterrows():
        ratio = (
            float(row["CE_Contracts"]) / float(row["PE_Contracts"])
            if row["PE_Contracts"] and row["PE_Contracts"] > 0
            else None
        )
        series.append(
            OptionsVolumePoint(
                date=str(row["Date"].date()),
                ce_contracts=float(row["CE_Contracts"]),
                pe_contracts=float(row["PE_Contracts"]),
                total_contracts=float(row["Total_Contracts"]),
                ce_pe_volume_ratio=round(ratio, 4) if ratio is not None else None,
            )
        )

    return ApiResponse(
        data=OptionsVolumeResponse(total_records=len(series), series=series),
        message="Options volume series retrieved successfully",
    )


@router.get(
    "/premium-turnover",
    response_model=ApiResponse[OptionsPremiumTurnoverResponse],
    summary="Options Premium Turnover Series",
    description="Daily Call vs Put premium turnover in ₹ Lakhs.",
)
async def get_options_premium_turnover(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(500, ge=1, le=1500, description="Maximum data points"),
) -> ApiResponse[OptionsPremiumTurnoverResponse]:
    validate_dates(start_date, end_date)
    daily = data_service.get_daily_options_comparison()

    filtered = daily.copy()
    if start_date:
        filtered = filtered[filtered["Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Date"] <= pd.to_datetime(end_date)]

    filtered = filtered.head(limit)
    series = [
        OptionsPremiumTurnoverPoint(
            date=str(row["Date"].date()),
            ce_premium_turnover_lakhs=float(row["CE_Premium_Turnover"])
            if pd.notna(row["CE_Premium_Turnover"])
            else None,
            pe_premium_turnover_lakhs=float(row["PE_Premium_Turnover"])
            if pd.notna(row["PE_Premium_Turnover"])
            else None,
            total_premium_turnover_lakhs=float(row["CE_Premium_Turnover"] + row["PE_Premium_Turnover"])
            if pd.notna(row["CE_Premium_Turnover"]) and pd.notna(row["PE_Premium_Turnover"])
            else None,
        )
        for _, row in filtered.iterrows()
    ]

    return ApiResponse(
        data=OptionsPremiumTurnoverResponse(total_records=len(series), series=series),
        message="Options premium turnover series retrieved successfully",
    )


@router.get(
    "/strike-analysis",
    response_model=ApiResponse[StrikeAnalysisResponse],
    summary="Options Strike-wise Distribution",
    description="Aggregate Open Interest and volume by strike price. Can filter by a specific snapshot date.",
)
async def get_options_strike_analysis(
    target_date: Optional[str] = Query(None, description="Optional snapshot trading date (YYYY-MM-DD)"),
    top_n: int = Query(40, ge=10, le=150, description="Number of top strikes to return"),
) -> ApiResponse[StrikeAnalysisResponse]:
    df = data_service.get_strike_analysis(target_date=target_date, top_n=top_n)

    strikes = [
        StrikeAnalysisPoint(
            strike_price=float(row["Strike Price"]),
            ce_open_interest=float(row["CE_OI"]),
            pe_open_interest=float(row["PE_OI"]),
            ce_contracts=float(row["CE_Contracts"]),
            pe_contracts=float(row["PE_Contracts"]),
            pcr_oi=round(float(row["PCR_OI"]), 4) if pd.notna(row["PCR_OI"]) else None,
        )
        for _, row in df.iterrows()
    ]

    return ApiResponse(
        data=StrikeAnalysisResponse(
            total_strikes=len(strikes),
            snapshot_date=target_date,
            strikes=strikes,
        ),
        message="Strike analysis retrieved successfully",
    )


@router.get(
    "/expiry-analysis",
    response_model=ApiResponse[ExpiryAnalysisResponse],
    summary="Options Expiration-wise Breakdown",
    description="Aggregated contract volumes, open interest, and unique strike counts by contract expiry date.",
)
async def get_options_expiry_analysis() -> ApiResponse[ExpiryAnalysisResponse]:
    df = data_service.get_expiry_analysis()

    expiries = [
        ExpiryAnalysisPoint(
            expiry=str(row["Expiry"].date()) if pd.notna(row["Expiry"]) else "Unknown",
            total_contracts=float(row["Total_Contracts"]),
            total_open_interest=float(row["Total_OI"]),
            ce_contracts=float(row["CE_Contracts"]),
            pe_contracts=float(row["PE_Contracts"]),
            unique_strikes=int(row["Unique_Strikes"]),
        )
        for _, row in df.iterrows()
    ]

    return ApiResponse(
        data=ExpiryAnalysisResponse(total_expiries=len(expiries), expiries=expiries),
        message="Expiry analysis retrieved successfully",
    )
