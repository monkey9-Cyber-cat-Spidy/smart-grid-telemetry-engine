export class TelemetryEngine {
  constructor(nominalVoltage = 230, nominalFreq = 50.0) {
    this.nominalVoltage = nominalVoltage;
    this.nominalFreq = nominalFreq;
    this.meterHistory = new Map();
  }

  ingest(reading) {
    const { meterId, timestamp, voltage, current, activePowerKw, reactivePowerKvar, frequency } = reading;
    if (!meterId || voltage === undefined || frequency === undefined) {
      throw new Error('Invalid telemetry payload: missing essential measurements');
    }

    const anomalies = [];
    // Voltage tolerance +/- 6%
    if (voltage < this.nominalVoltage * 0.94) {
      anomalies.push({ type: 'VOLTAGE_SAG', value: voltage, threshold: this.nominalVoltage * 0.94 });
    } else if (voltage > this.nominalVoltage * 1.06) {
      anomalies.push({ type: 'VOLTAGE_SURGE', value: voltage, threshold: this.nominalVoltage * 1.06 });
    }

    // Frequency tolerance +/- 0.5 Hz
    if (Math.abs(frequency - this.nominalFreq) > 0.5) {
      anomalies.push({ type: 'FREQUENCY_DRIFT', value: frequency, nominal: this.nominalFreq });
    }

    // Power factor calculation
    const apparentPower = Math.sqrt(Math.pow(activePowerKw || 0, 2) + Math.pow(reactivePowerKvar || 0, 2));
    const powerFactor = apparentPower > 0 ? (activePowerKw / apparentPower) : 1.0;

    const record = {
      timestamp: timestamp || new Date().toISOString(),
      voltage,
      current,
      activePowerKw,
      reactivePowerKvar,
      powerFactor: Number(powerFactor.toFixed(3)),
      anomalies
    };

    if (!this.meterHistory.has(meterId)) {
      this.meterHistory.set(meterId, []);
    }
    this.meterHistory.get(meterId).push(record);

    return {
      meterId,
      status: anomalies.length > 0 ? 'ALERT' : 'NORMAL',
      powerFactor: record.powerFactor,
      anomalies
    };
  }

  getReadings(meterId) {
    return this.meterHistory.get(meterId) || [];
  }
}
