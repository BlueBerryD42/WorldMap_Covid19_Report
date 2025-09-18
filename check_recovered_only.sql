-- SQL Script to check ONLY recovered data
USE [PRN3_COVID]
GO

-- Check total records with recovered data > 0
SELECT COUNT(*) as RecordsWithRecoveredData 
FROM DailyMetrics 
WHERE Recovered > 0
GO

-- Get top 100 records with highest recovered values
SELECT TOP 100
    dm.MetricID,
    l.Country_Region,
    l.Province_State,
    dm.Date,
    dm.Recovered
FROM DailyMetrics dm
INNER JOIN Locations l ON dm.LocationID = l.LocationID
WHERE dm.Recovered > 0
ORDER BY dm.Recovered DESC
GO

-- If no recovered data found, show sample of all recovered values (including zeros)
IF NOT EXISTS (SELECT 1 FROM DailyMetrics WHERE Recovered > 0)
BEGIN
    PRINT 'No recovered data > 0 found. Showing sample of all recovered values:'
    
    SELECT TOP 100
        dm.MetricID,
        l.Country_Region,
        l.Province_State,
        dm.Date,
        dm.Recovered
    FROM DailyMetrics dm
    INNER JOIN Locations l ON dm.LocationID = l.LocationID
    ORDER BY dm.Date DESC
END
GO

-- Check Afghanistan recovered data specifically
SELECT TOP 50
    dm.MetricID,
    l.Country_Region,
    l.Province_State,
    dm.Date,
    dm.Recovered
FROM DailyMetrics dm
INNER JOIN Locations l ON dm.LocationID = l.LocationID
WHERE l.Country_Region = 'Afghanistan'
ORDER BY dm.Date DESC
GO

-- Summary of recovered data by country
SELECT 
    l.Country_Region,
    COUNT(*) as TotalRecords,
    MAX(dm.Recovered) as MaxRecovered,
    COUNT(CASE WHEN dm.Recovered > 0 THEN 1 END) as RecordsWithRecovered
FROM DailyMetrics dm
INNER JOIN Locations l ON dm.LocationID = l.LocationID
GROUP BY l.Country_Region
HAVING MAX(dm.Recovered) > 0
ORDER BY MaxRecovered DESC
GO
