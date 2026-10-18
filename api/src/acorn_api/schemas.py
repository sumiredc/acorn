from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from acorn_api.pricing import MissionKind, MissionUnit, RewardMode


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class JudgementOut(CamelModel):
    choice: str
    probabilities: dict[str, float]
    confidence: float


class MissionIn(CamelModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1, max_length=200)
    kind: MissionKind
    unit: MissionUnit = "none"
    target: int = Field(default=1, ge=1, le=10000)


class JudgeMissionsIn(CamelModel):
    budget_usd: float = Field(gt=0)
    missions: list[MissionIn] = Field(min_length=1, max_length=4)


class MissionOut(CamelModel):
    id: str
    pt: int
    judgement: JudgementOut


class JudgeMissionsOut(CamelModel):
    missions: list[MissionOut]


class JudgeRewardIn(CamelModel):
    budget_usd: float = Field(gt=0)
    name: str = Field(min_length=1, max_length=200)


class JudgeRewardOut(CamelModel):
    pt: int
    mode: RewardMode
    judgement: JudgementOut
