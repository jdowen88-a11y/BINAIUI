"""AirX design-study arithmetic; not a calibrated exchanger model."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AirXStudy:
    total_duty_kw: float = 20.0
    cassettes: int = 8
    liquid_flow_lpm: float = 19.14
    air_flow_m3_s: float = 3.52
    assumed_fan_input_w: float = 881.0

    def summary(self) -> dict[str, float | int | str | bool]:
        if (
            self.total_duty_kw <= 0
            or self.cassettes < 1
            or self.liquid_flow_lpm <= 0
            or self.air_flow_m3_s <= 0
        ):
            raise ValueError("Design-study inputs must be positive")
        if self.assumed_fan_input_w < 0:
            raise ValueError("Fan input must not be negative")
        return {
            "status": "CONCEPT_STUDY_ONLY",
            "verified": False,
            "total_duty_kw": self.total_duty_kw,
            "cassettes": self.cassettes,
            "nominal_duty_per_cassette_kw": self.total_duty_kw / self.cassettes,
            "liquid_flow_lpm": self.liquid_flow_lpm,
            "air_flow_m3_s": self.air_flow_m3_s,
            "assumed_fan_input_w": self.assumed_fan_input_w,
        }
