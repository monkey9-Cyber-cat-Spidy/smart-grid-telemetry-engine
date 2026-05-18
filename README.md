# Smart Grid Telemetry Engine

High-throughput time-series meter telemetry ingestion and anomaly detection engine for electrical power distribution grids, supporting frequency drift detection, voltage surge warnings, and power factor analysis.

## Key Capabilities
- **Time-Series Ingestion**: High-throughput validation of interval meter readings (voltage, active/reactive power, frequency).
- **Z-Score Anomaly Detection**: Statistical detection of instantaneous surges, voltage sags, and reverse power flow.
- **Power Factor Metrics**: Calculation of real-time power factor ratios and phase alignment monitoring.

## Running Tests
```bash
npm test
```
