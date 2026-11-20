"""API endpoints for NIFTY 50 Futures data and time-series analytics."""

from datetime import date
from typing import Optional
from fastapi import APIRouter, Query
import numpy as np
import pandas as pd
from backend.app.core.errors import AppException
from backend.app.schemas.base import ApiResponse
from backend.app.schemas.futures import (
    FuturesOIPoint,
    FuturesOIResponse,
    FuturesPricePoint,
    FuturesPricesResponse,
    FuturesSummary,
    FuturesTurnoverPoint,
    FuturesTurnoverResponse,
    FuturesVolumePoint,
    FuturesVolumeResponse,
)
from backend.app.services.data_service import data_service

router = APIRouter(prefix="/futures", tags=["Futures"])


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
    response_model=ApiResponse[FuturesSummary],
    summary="Futures Aggregate Summary",
    description="Returns aggregate trading statistics, turnover, volume, and Open Interest for NIFTY 50 Futures.",
)
async def get_futures_summary() -> ApiResponse[FuturesSummary]:
    daily = data_service.get_daily_futures()
    raw = data_service.get_futures_data()

    latest_close = daily["Close"].dropna().iloc[-1] if not daily["Close"].dropna().empty else None

    summary = FuturesSummary(
        total_records=len(raw),
        unique_trading_dates=len(daily),
        date_range_start=str(daily["Date"].min().date()),
        date_range_end=str(daily["Date"].max().date()),
        total_contracts_traded=float(daily["Contracts"].sum()),
        total_turnover_lakhs=float(daily["Turnover_Lakhs"].sum()),
        avg_daily_contracts=round(float(daily["Contracts"].mean()), 2),
        avg_daily_turnover_lakhs=round(float(daily["Turnover_Lakhs"].mean()), 2),
        avg_open_interest=round(float(daily["Open_Interest"].mean()), 2),
        max_open_interest=float(daily["Open_Interest"].max()),
        latest_close=round(float(latest_close), 2) if latest_close is not None else None,
    )
    return ApiResponse(data=summary, message="Futures summary retrieved successfully")


@router.get(
    "/prices",
    response_model=ApiResponse[FuturesPricesResponse],
    summary="Futures Price History",
    description="Historical OHLC, settle prices, and underlying values with date range filtering and pagination.",
)
async def get_futures_prices(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, ge=1, le=1500, description="Page size limit"),
    offset: int = Query(0, ge=0, description="Offset index"),
) -> ApiResponse[FuturesPricesResponse]:
    validate_dates(start_date, end_date)
    daily = data_service.get_daily_futures()

    filtered = daily.copy()
    if start_date:
        filtered = filtered[filtered["Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Date"] <= pd.to_datetime(end_date)]

    total_count = len(filtered)
    paged = filtered.iloc[offset : offset + limit]

    prices = []
    for _, row in paged.iterrows():
        prices.append(
            FuturesPricePoint(
                date=str(row["Date"].date()),
                expiry=None,
                open=float(row["Open"]) if pd.notna(row["Open"]) else None,
                high=float(row["High"]) if pd.notna(row["High"]) else None,
                low=float(row["Low"]) if pd.notna(row["Low"]) else None,
                close=float(row["Close"]) if pd.notna(row["Close"]) else None,
                settle_price=float(row["Settle_Price"]) if pd.notna(row["Settle_Price"]) else None,
                underlying_value=float(row["Underlying_Value"]) if pd.notna(row["Underlying_Value"]) else None,
            )
        )

    return ApiResponse(
        data=FuturesPricesResponse(
            total_records=total_count,
            returned_records=len(prices),
            prices=prices,
        ),
        message="Futures prices retrieved successfully",
    )


@router.get(
    "/volume",
    response_model=ApiResponse[FuturesVolumeResponse],
    summary="Futures Volume Series",
    description="Daily contracts traded and percentage volume changes over time.",
)
async def get_futures_volume(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(500, ge=1, le=1500, description="Maximum data points"),
) -> ApiResponse[FuturesVolumeResponse]:
    validate_dates(start_date, end_date)
    daily = data_service.get_daily_futures()

    filtered = daily.copy()
    if start_date:
        filtered = filtered[filtered["Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Date"] <= pd.to_datetime(end_date)]

    filtered = filtered.head(limit)
    series = [
        FuturesVolumePoint(
            date=str(row["Date"].date()),
            contracts=float(row["Contracts"]),
            turnover_lakhs=float(row["Turnover_Lakhs"]),
            volume_change_pct=round(float(row["Volume_Change_Pct"]), 2)
            if pd.notna(row["Volume_Change_Pct"])
            else None,
        )
        for _, row in filtered.iterrows()
    ]
    return ApiResponse(
        data=FuturesVolumeResponse(total_records=len(series), series=series),
        message="Futures volume series retrieved successfully",
    )


@router.get(
    "/turnover",
    response_model=ApiResponse[FuturesTurnoverResponse],
    summary="Futures Turnover Series",
    description="Daily trading turnover in ₹ Lakhs with percentage changes.",
)
async def get_futures_turnover(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(500, ge=1, le=1500, description="Maximum data points"),
) -> ApiResponse[FuturesTurnoverResponse]:
    validate_dates(start_date, end_date)
    daily = data_service.get_daily_futures()

    filtered = daily.copy()
    if start_date:
        filtered = filtered[filtered["Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Date"] <= pd.to_datetime(end_date)]

    filtered = filtered.head(limit)
    series = [
        FuturesTurnoverPoint(
            date=str(row["Date"].date()),
            turnover_lakhs=float(row["Turnover_Lakhs"]),
            turnover_change_pct=round(float(row["Turnover_Change_Pct"]), 2)
            if pd.notna(row["Turnover_Change_Pct"])
            else None,
        )
        for _, row in filtered.iterrows()
    ]
    return ApiResponse(
        data=FuturesTurnoverResponse(total_records=len(series), series=series),
        message="Futures turnover series retrieved successfully",
    )


@router.get(
    "/open-interest",
    response_model=ApiResponse[FuturesOIResponse],
    summary="Futures Open Interest Series",
    description="Daily aggregate Open Interest and absolute/percentage OI changes.",
)
async def get_futures_open_interest(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(500, ge=1, le=1500, description="Maximum data points"),
) -> ApiResponse[FuturesOIResponse]:
    validate_dates(start_date, end_date)
    daily = data_service.get_daily_futures()

    filtered = daily.copy()
    if start_date:
        filtered = filtered[filtered["Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Date"] <= pd.to_datetime(end_date)]

    filtered = filtered.head(limit)
    series = [
        FuturesOIPoint(
            date=str(row["Date"].date()),
            open_interest=float(row["Open_Interest"]),
            change_in_oi=float(row["Change_in_OI"]) if pd.notna(row["Change_in_OI"]) else None,
            oi_change_pct=round(float(row["OI_Change_Pct"]), 2) if pd.notna(row["OI_Change_Pct"]) else None,
        )
        for _, row in filtered.iterrows()
    ]
    return ApiResponse(
        data=FuturesOIResponse(total_records=len(series), series=series),
        message="Futures Open Interest series retrieved successfully",
    )
