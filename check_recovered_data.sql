-- SQL Script to check recovered data in COVID database
-- Run this script in SQL Server Management Studio or any SQL client

USE [PRN3_COVID]
GO

-- Check the structure of DailyMetrics table
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'DailyMetrics'
ORDER BY ORDINAL_POSITION
GO

-- Check total records in DailyMetrics
SELECT COUNT(*) as TotalRecords FROM DailyMetrics
GO

-- Check records with non-zero recovered values
SELECT COUNT(*) as RecordsWithRecoveredData 
FROM DailyMetrics 
WHERE Recovered > 0
GO

-- Get sample of 100 records with recovered data (if any)
SELECT TOP 100
    dm.MetricID,
    l.Country_Region,
    l.Province_State,
    dm.Date,
    dm.Confirmed,
    dm.Deaths,
    dm.Recovered,
    dm.Active
FROM DailyMetrics dm
INNER JOIN Locations l ON dm.LocationID = l.LocationID
WHERE dm.Recovered > 0
ORDER BY dm.Recovered DESC
GO

-- If no recovered data found, get sample of all data
IF NOT EXISTS (SELECT 1 FROM DailyMetrics WHERE Recovered > 0)
BEGIN
    PRINT 'No recovered data found. Showing sample of all data:'
    
    SELECT TOP 100
        dm.MetricID,
        l.Country_Region,
        l.Province_State,
        dm.Date,
        dm.Confirmed,
        dm.Deaths,
        dm.Recovered,
        dm.Active
    FROM DailyMetrics dm
    INNER JOIN Locations l ON dm.LocationID = l.LocationID
    ORDER BY dm.Date DESC, dm.Confirmed DESC
END
GO

-- Check Afghanistan specifically
SELECT TOP 50
    dm.MetricID,
    l.Country_Region,
    l.Province_State,
    dm.Date,
    dm.Confirmed,
    dm.Deaths,
    dm.Recovered,
    dm.Active
FROM DailyMetrics dm
INNER JOIN Locations l ON dm.LocationID = l.LocationID
WHERE l.Country_Region = 'Afghanistan'
ORDER BY dm.Date DESC
GO

-- Check US data specifically
SELECT TOP 50
    dm.MetricID,
    l.Country_Region,
    l.Province_State,
    dm.Date,
    dm.Confirmed,
    dm.Deaths,
    dm.Recovered,
    dm.Active
FROM DailyMetrics dm
INNER JOIN Locations l ON dm.LocationID = l.LocationID
WHERE l.Country_Region = 'US'
ORDER BY dm.Date DESC
GO

-- Summary statistics by country
SELECT 
    l.Country_Region,
    COUNT(*) as TotalRecords,
    MAX(dm.Confirmed) as MaxConfirmed,
    MAX(dm.Deaths) as MaxDeaths,
    MAX(dm.Recovered) as MaxRecovered,
    MAX(dm.Active) as MaxActive,
    COUNT(CASE WHEN dm.Recovered > 0 THEN 1 END) as RecordsWithRecovered
FROM DailyMetrics dm
INNER JOIN Locations l ON dm.LocationID = l.LocationID
GROUP BY l.Country_Region
ORDER BY MaxRecovered DESC
GO

-- Check if there are any NULL values in recovered column
SELECT 
    COUNT(*) as TotalRecords,
    COUNT(Recovered) as NonNullRecovered,
    COUNT(*) - COUNT(Recovered) as NullRecovered
FROM DailyMetrics
GO

-- Check the latest date in the database
SELECT MAX(Date) as LatestDate FROM DailyMetrics
GO

-- Check if data exists for recent dates
SELECT TOP 10
    Date,
    COUNT(*) as RecordCount,
    SUM(Confirmed) as TotalConfirmed,
    SUM(Deaths) as TotalDeaths,
    SUM(Recovered) as TotalRecovered,
    SUM(Active) as TotalActive
FROM DailyMetrics
GROUP BY Date
ORDER BY Date DESC
GO
