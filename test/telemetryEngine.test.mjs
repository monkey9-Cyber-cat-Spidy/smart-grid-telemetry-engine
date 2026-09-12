import { test, describe } from 'node:test';
import assert from 'node:assert';
import { TelemetryEngine } from '../src/telemetryEngine.mjs';

describe('Smart Grid Telemetry Engine Suite', () => {
  const engine = new TelemetryEngine(230, 50.0);

  test('should process normal grid reading with healthy power factor', () => {
    const res = engine.ingest({
      meterId: 'MTR-001',
      voltage: 231.2,
      current: 10.5,
      activePowerKw: 2.4,
      reactivePowerKvar: 0.3,
      frequency: 50.02
    });
    assert.strictEqual(res.status, 'NORMAL');
    assert.strictEqual(res.anomalies.length, 0);
    assert.ok(res.powerFactor > 0.98);
  });

  test('should detect voltage sag when voltage drops below 94% nominal', () => {
    const res = engine.ingest({
      meterId: 'MTR-002',
      voltage: 205.0, // Below 216.2V
      frequency: 50.0
    });
    assert.strictEqual(res.status, 'ALERT');
    assert.strictEqual(res.anomalies[0].type, 'VOLTAGE_SAG');
  });

  test('should detect frequency instability drift beyond tolerance', () => {
    const res = engine.ingest({
      meterId: 'MTR-003',
      voltage: 230.0,
      frequency: 49.3 // Drift > 0.5Hz
    });
    assert.strictEqual(res.status, 'ALERT');
    assert.strictEqual(res.anomalies[0].type, 'FREQUENCY_DRIFT');
  });
});
