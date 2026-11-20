"""Reusable data loader and caching service for NIFTY 50 derivatives datasets."""

import os
import re
import zipfile
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional
import numpy as np
import pandas as pd
from backend.app.core.config import settings
from backend.app.core.errors import ModelArtifactError, NotFoundError


class DataService:
    """Service handling dataset loading, pre-aggregation, and in-memory caching."""

    def __init__(self) -> None:
        self.raw_dir = settings.RAW_DATA_DIR
        self.processed_dir = settings.PROCESSED_DATA_DIR
        self.ml_dir = settings.DATA_ML_DIR
        self.eval_dir = settings.EVALUATION_DIR
        self.models_dir = settings.SAVED_MODELS_DIR

        # In-memory cached DataFrames
        self._futures_df: Optional[pd.DataFrame] = None
        self._calls_df: Optional[pd.DataFrame] = None
        self._puts_df: Optional[pd.DataFrame] = None
        self._daily_futures_df: Optional[pd.DataFrame] = None
        self._daily_options_df: Optional[pd.DataFrame] = None

    # ------------------------------------------------------------------
    # Reusable Raw Cleaning Utilities (matching Notebook 02 logic)
    # ------------------------------------------------------------------
    @staticmethod
    def _standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df.columns = [re.sub(r"\s+", " ", str(col)).strip() for col in df.columns]
        return df

    @staticmethod
    def _clean_numeric_and_date(df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        numeric_candidates = [
            "Open",
            "High",
            "Low",
            "Close",
            "LTP",
            "Settle Price",
            "Settlement Price",
            "No. of contracts",
            "No. of Contracts",
            "Turnover * in ₹ Lakhs",
            "Turnover ** in ₹ Lakhs",
            "Open Int",
            "Open Interest",
            "Change in OI",
            "Change in Open Interest",
            "Underlying",
            "Underlying Value",
            "Strike Price",
            "Premium Turnover ** in ₹ Lakhs",
        ]
        for col in df.columns:
            if col in numeric_candidates:
                cleaned = (
                    df[col]
                    .astype(str)
                    .str.strip()
                    .str.replace(",", "", regex=False)
                    .replace({"-": np.nan, "": np.nan, "NA": np.nan, "N/A": np.nan})
                )
                df[col] = pd.to_numeric(cleaned, errors="coerce")
            elif col in ["Date", "Trading Date", "Expiry", "Expiry Date"]:
                df[col] = pd.to_datetime(
                    df[col].astype(str).str.strip(),
                    format="mixed",
                    dayfirst=True,
                    errors="coerce",
                )
        return df

    def _extract_and_clean_zip(self, zip_filename: str) -> pd.DataFrame:
        zip_path = self.raw_dir / zip_filename
        if not zip_path.is_file():
            raise NotFoundError(
                message=f"Raw dataset archive {zip_filename} not found",
                details={"path": str(zip_path)},
            )
        dataframes = []
        with zipfile.ZipFile(zip_path, "r") as archive:
            csv_files = sorted([n for n in archive.namelist() if n.lower().endswith(".csv")])
            for filename in csv_files:
                with archive.open(filename) as f:
                    df = pd.read_csv(f, dtype=str, keep_default_na=False, low_memory=False)
                    df = self._standardize_columns(df)
                    dataframes.append(df)
        combined = pd.concat(dataframes, ignore_index=True)
        combined = self._clean_numeric_and_date(combined)
        combined = combined.drop_duplicates(keep="first").reset_index(drop=True)
        return combined

    # ------------------------------------------------------------------
    # Futures Loading & Aggregation
    # ------------------------------------------------------------------
    def get_futures_data(self) -> pd.DataFrame:
        """Load cleaned futures contract observations."""
        if self._futures_df is not None:
            return self._futures_df

        parquet_path = self.processed_dir / "futures_clean.parquet"
        if parquet_path.is_file():
            df = pd.read_parquet(parquet_path)
        else:
            df = self._extract_and_clean_zip("Futures.zip")
            self.processed_dir.mkdir(parents=True, exist_ok=True)
            df.to_parquet(parquet_path, index=False)

        self._futures_df = df
        return df

    def get_daily_futures(self) -> pd.DataFrame:
        """Compute and cache daily aggregated futures statistics."""
        if self._daily_futures_df is not None:
            return self._daily_futures_df

        df = self.get_futures_data().copy()
        valid = df.dropna(subset=["Date"]).copy()

        # Sort by Date and Expiry to identify near-month contract for prices
        valid = valid.sort_values(["Date", "Expiry"])

        daily = (
            valid.groupby("Date")
            .agg(
                Open=("Open", "first"),
                High=("High", "max"),
                Low=("Low", "min"),
                Close=("Close", "first"),
                Settle_Price=("Settle Price", "first"),
                Underlying_Value=("Underlying Value", "median"),
                Contracts=("No. of contracts", "sum"),
                Turnover_Lakhs=("Turnover * in ₹ Lakhs", "sum"),
                Open_Interest=("Open Int", "sum"),
                Change_in_OI=("Change in OI", "sum"),
                Contract_Count=("Date", "size"),
            )
            .reset_index()
            .sort_values("Date")
            .reset_index(drop=True)
        )

        # Calculate percentage changes
        daily["Volume_Change_Pct"] = daily["Contracts"].pct_change() * 100.0
        daily["Turnover_Change_Pct"] = daily["Turnover_Lakhs"].pct_change() * 100.0
        daily["OI_Change_Pct"] = daily["Open_Interest"].pct_change() * 100.0
        daily["Return"] = daily["Close"].pct_change() * 100.0

        self._daily_futures_df = daily
        return daily

    # ------------------------------------------------------------------
    # Options Loading & Daily Comparison
    # ------------------------------------------------------------------
    def get_calls_data(self, columns: Optional[list[str]] = None) -> pd.DataFrame:
        """Load cleaned Call Options dataset with optional column projection."""
        parquet_path = self.processed_dir / "calls_clean.parquet"
        if parquet_path.is_file():
            return pd.read_parquet(parquet_path, columns=columns)
        if self._calls_df is not None:
            return self._calls_df[columns] if columns else self._calls_df

        df = self._extract_and_clean_zip("Options_CE.zip")
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        df.to_parquet(parquet_path, index=False)
        self._calls_df = df
        return df[columns] if columns else df

    def get_puts_data(self, columns: Optional[list[str]] = None) -> pd.DataFrame:
        """Load cleaned Put Options dataset with optional column projection."""
        parquet_path = self.processed_dir / "puts_clean.parquet"
        if parquet_path.is_file():
            return pd.read_parquet(parquet_path, columns=columns)
        if self._puts_df is not None:
            return self._puts_df[columns] if columns else self._puts_df

        df = self._extract_and_clean_zip("Options_PE.zip")
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        df.to_parquet(parquet_path, index=False)
        self._puts_df = df
        return df[columns] if columns else df

    def get_daily_options_comparison(self) -> pd.DataFrame:
        """Compute and cache daily side-by-side CE vs PE aggregates and PCR."""
        if self._daily_options_df is not None:
            return self._daily_options_df

        cols = [
            "Date",
            "No. of contracts",
            "Turnover * in ₹ Lakhs",
            "Premium Turnover ** in ₹ Lakhs",
            "Open Int",
            "Change in OI",
        ]
        calls = self.get_calls_data(columns=cols)
        puts = self.get_puts_data(columns=cols)

        ce_daily = (
            calls.dropna(subset=["Date"])
            .groupby("Date")
            .agg(
                CE_Contracts=("No. of contracts", "sum"),
                CE_Turnover=("Turnover * in ₹ Lakhs", "sum"),
                CE_Premium_Turnover=("Premium Turnover ** in ₹ Lakhs", "sum"),
                CE_OI=("Open Int", "sum"),
                CE_Change_in_OI=("Change in OI", "sum"),
                CE_Record_Count=("Date", "size"),
            )
            .reset_index()
        )

        pe_daily = (
            puts.dropna(subset=["Date"])
            .groupby("Date")
            .agg(
                PE_Contracts=("No. of contracts", "sum"),
                PE_Turnover=("Turnover * in ₹ Lakhs", "sum"),
                PE_Premium_Turnover=("Premium Turnover ** in ₹ Lakhs", "sum"),
                PE_OI=("Open Int", "sum"),
                PE_Change_in_OI=("Change in OI", "sum"),
                PE_Record_Count=("Date", "size"),
            )
            .reset_index()
        )

        merged = pd.merge(ce_daily, pe_daily, on="Date", how="outer").sort_values("Date").reset_index(drop=True)
        merged["Total_Contracts"] = merged["CE_Contracts"] + merged["PE_Contracts"]
        merged["Total_OI"] = merged["CE_OI"] + merged["PE_OI"]
        merged["PCR_OI"] = merged["PE_OI"] / merged["CE_OI"]
        merged["PCR_Volume"] = merged["PE_Contracts"] / merged["CE_Contracts"]

        self._daily_options_df = merged
        return merged

    # ------------------------------------------------------------------
    # Strike & Expiry Analysis
    # ------------------------------------------------------------------
    def get_strike_analysis(
        self,
        target_date: Optional[str] = None,
        top_n: int = 40,
    ) -> pd.DataFrame:
        """Aggregate CE and PE activity by Strike Price for a date or full history."""
        cols = ["Date", "Strike Price", "Open Int", "No. of contracts"]
        calls = self.get_calls_data(columns=cols)
        puts = self.get_puts_data(columns=cols)

        if target_date:
            parsed_date = pd.to_datetime(target_date)
            calls = calls[calls["Date"] == parsed_date]
            puts = puts[puts["Date"] == parsed_date]
            if calls.empty and puts.empty:
                raise NotFoundError(
                    message=f"No options activity found for date {target_date}",
                    details={"date": target_date},
                )

        ce_agg = (
            calls.groupby("Strike Price")
            .agg(
                CE_OI=("Open Int", "sum"),
                CE_Contracts=("No. of contracts", "sum"),
            )
            .reset_index()
        )

        pe_agg = (
            puts.groupby("Strike Price")
            .agg(
                PE_OI=("Open Int", "sum"),
                PE_Contracts=("No. of contracts", "sum"),
            )
            .reset_index()
        )

        merged = pd.merge(ce_agg, pe_agg, on="Strike Price", how="outer").fillna(0.0)
        merged["Total_OI"] = merged["CE_OI"] + merged["PE_OI"]
        merged["PCR_OI"] = np.where(merged["CE_OI"] > 0, merged["PE_OI"] / merged["CE_OI"], np.nan)

        # Sort by total OI and pick top N, then sort by strike price
        top = merged.sort_values("Total_OI", ascending=False).head(top_n)
        return top.sort_values("Strike Price").reset_index(drop=True)

    def get_expiry_analysis(self) -> pd.DataFrame:
        """Aggregate options volume and open interest across expiration dates."""
        cols = ["Expiry", "Open Int", "No. of contracts", "Strike Price"]
        calls = self.get_calls_data(columns=cols)
        puts = self.get_puts_data(columns=cols)

        ce_agg = (
            calls.dropna(subset=["Expiry"])
            .groupby("Expiry")
            .agg(
                CE_Contracts=("No. of contracts", "sum"),
                CE_OI=("Open Int", "sum"),
                CE_Strikes=("Strike Price", "nunique"),
            )
            .reset_index()
        )

        pe_agg = (
            puts.dropna(subset=["Expiry"])
            .groupby("Expiry")
            .agg(
                PE_Contracts=("No. of contracts", "sum"),
                PE_OI=("Open Int", "sum"),
                PE_Strikes=("Strike Price", "nunique"),
            )
            .reset_index()
        )

        merged = pd.merge(ce_agg, pe_agg, on="Expiry", how="outer").fillna(0.0)
        merged["Total_Contracts"] = merged["CE_Contracts"] + merged["PE_Contracts"]
        merged["Total_OI"] = merged["CE_OI"] + merged["PE_OI"]
        merged["Unique_Strikes"] = merged[["CE_Strikes", "PE_Strikes"]].max(axis=1).astype(int)

        return merged.sort_values("Expiry").reset_index(drop=True)

    # ------------------------------------------------------------------
    # ML & Metadata Datasets
    # ------------------------------------------------------------------
    def get_ml_dataset(self, split: str = "full") -> pd.DataFrame:
        """Load ML partition (full, train, validation, or test)."""
        filename_map = {
            "full": "full_ml_dataset.parquet",
            "train": "train_dataset.parquet",
            "validation": "validation_dataset.parquet",
            "test": "test_dataset.parquet",
            "target_audit": "target_audit.parquet",
        }
        if split not in filename_map:
            raise NotFoundError(
                message=f"Unknown ML dataset split '{split}'",
                details={"valid_splits": list(filename_map.keys())},
            )
        path = self.ml_dir / filename_map[split]
        if not path.is_file():
            raise ModelArtifactError(
                message=f"ML dataset partition '{split}' not found",
                details={"path": str(path)},
            )
        return pd.read_parquet(path)

    def get_ml_metadata(self) -> dict[str, Any]:
        """Load ML project and split metadata JSON."""
        path = self.ml_dir / "ml_metadata.json"
        if not path.is_file():
            raise ModelArtifactError("ML metadata file not found", details={"path": str(path)})
        import json

        with open(path) as f:
            return json.load(f)

    def get_feature_columns_metadata(self) -> dict[str, Any]:
        """Load feature selection schema and missingness report."""
        path = self.ml_dir / "feature_columns.json"
        if not path.is_file():
            raise ModelArtifactError("Feature columns metadata not found", details={"path": str(path)})
        import json

        with open(path) as f:
            return json.load(f)


data_service = DataService()
