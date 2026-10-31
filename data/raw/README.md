# NIFTY 50 Futures and Options - Raw Dataset

## Project

**Exploratory Data Analysis of NIFTY 50 Futures and Options Market**

## Dataset Description

This directory contains the original historical market datasets used for the Exploratory Data Analysis (EDA) of the NIFTY 50 derivatives market.

The dataset consists of three categories of NIFTY 50 derivative instruments:

1. **NIFTY Index Futures**
2. **NIFTY Index Call Options (CE)**
3. **NIFTY Index Put Options (PE)**

The data was collected from the National Stock Exchange of India (NSE) through its historical contract-wise price-volume data section.

## Study Period

**January 2021 – September 2026**

The 2026 dataset covers the period available up to the date of data collection and does not represent a complete calendar year.

## Data Source

**National Stock Exchange of India (NSE)**

Source: https://www.nseindia.com/report-detail/fo_eq_security

The datasets were downloaded using the historical contract-wise price-volume data section of the NSE website.

## Dataset Contents

This directory contains the following three compressed archives:

| File | Description |
|---|---|
| `Futures.zip` | Historical NIFTY Index Futures data |
| `Options_CE.zip` | Historical NIFTY Call Options data |
| `Options_PE.zip` | Historical NIFTY Put Options data |

Each archive contains quarterly CSV files organized into year-wise directories.

### 1. Futures

The Futures dataset contains historical NIFTY Index Futures data.

Important variables include:

- Symbol
- Trading Date
- Expiry Date
- Open Price
- High Price
- Low Price
- Close Price
- LTP
- Settlement Price
- Number of Contracts
- Turnover
- Open Interest
- Change in Open Interest
- Underlying Value

### 2. Call Options (CE)

The Call Options dataset contains historical NIFTY Call Option data.

Important variables include:

- Symbol
- Trading Date
- Expiry Date
- Option Type
- Strike Price
- Open Price
- High Price
- Low Price
- Close Price
- LTP
- Settlement Price
- Number of Contracts
- Turnover
- Premium Turnover
- Open Interest
- Change in Open Interest
- Underlying Value

### 3. Put Options (PE)

The Put Options dataset contains historical NIFTY Put Option data.

The variables are the same as those available in the Call Options dataset, including strike price, expiry, prices, trading activity, open interest, premium turnover, and underlying value.

## Folder Structure

The raw datasets are stored as compressed ZIP archives in this directory. Each archive contains quarterly CSV files organized by year.

```text
data/
└── raw/
    ├── README.md
    ├── Futures.zip
    ├── Options_CE.zip
    └── Options_PE.zip
```

After extraction, the internal structure of each archive is organized by instrument and year, containing quarterly CSV files.

## Data Integrity and Usage

- The original downloaded datasets are preserved in their raw format.
- No cleaning, transformation, or modification has been applied to these files.
- All preprocessing, missing-value handling, duplicate removal, and feature engineering will be performed separately during the EDA process.
- The raw datasets serve as the source data for all subsequent analysis.

**Note:** These datasets are intended for academic and research purposes. The National Stock Exchange of India (NSE) is the original data source.
