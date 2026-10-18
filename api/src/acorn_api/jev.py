"""The only module that talks to Jev. Everything else depends on the Judge protocol."""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Protocol

from typesafe_sdk import AsyncTypeSafeClient, Choice, Score, TypeSafeError

from acorn_api.pricing import LEVEL_KEYS, Judgement, MissionKind, MissionUnit, most_likely

MODEL = "jev-1.13.0"

LEVEL_CRITERIA = [
    "Very easy: almost no effort",
    "Easy: a little effort",
    "Normal: takes real but ordinary effort",
    "Hard: takes strong willpower or a lot of time",
    "Very hard: exhausting or rarely achieved",
]

PRICE_CRITERIA: dict[str, str | None] = {
    "usd_10": "Around $10 or less",
    "usd_30": "Around $30",
    "usd_100": "Around $100",
    "usd_300": "Around $300",
    "usd_1000": "Around $1,000",
    "usd_3000": "Around $3,000",
    "usd_10000": "Around $10,000",
    "usd_30000": "Around $30,000",
    "usd_100000": "Around $100,000 or more",
    "no_price": "Hard to put a market price on, such as an experience, a privilege, or a concept",
}

PERIOD_CRITERIA: dict[str, str | None] = {
    "d1": "About 1 day of effort",
    "d3": "About 3 days of effort",
    "w1": "About 1 week of effort",
    "w2": "About 2 weeks of effort",
    "m1": "About 1 month of effort",
    "m3": "About 3 months of effort",
    "m6": "About 6 months of effort",
    "y1": "About 1 year of effort",
}

FREQUENCY = {"daily": "every day", "weekly": "within a week"}


class JudgeError(Exception):
    pass


@dataclass(frozen=True)
class MissionInput:
    id: str
    name: str
    kind: MissionKind
    unit: MissionUnit = "percent"
    target: int = 1


def goal_text(unit: MissionUnit, target: int) -> str:
    if unit == "count":
        return f"{target} times"
    if unit == "minutes":
        return f"{target} minutes in total"
    return "complete it fully"


@dataclass(frozen=True)
class RewardJudgement:
    price: Judgement
    period: Judgement


class Judge(Protocol):
    async def judge_missions(self, missions: Sequence[MissionInput]) -> Mapping[str, Judgement]: ...

    async def judge_reward(self, name: str) -> RewardJudgement: ...


class JevJudge:
    def __init__(self, client: AsyncTypeSafeClient) -> None:
        self._client = client

    async def judge_missions(self, missions: Sequence[MissionInput]) -> Mapping[str, Judgement]:
        # One request, one Score question per mission, so a week is judged together.
        state = {
            m.id: {
                "mission": m.name,
                "goal": goal_text(m.unit, m.target),
                "frequency": FREQUENCY[m.kind],
            }
            for m in missions
        }
        questions = {
            m.id: Score(
                instructions=f"How hard is it for an ordinary adult to reach the goal of "
                f"mission {m.id} {FREQUENCY[m.kind]}?",
                criteria=LEVEL_CRITERIA,
            )
            for m in missions
        }
        try:
            response = await self._client.system_one(state, questions, model=MODEL)
        except TypeSafeError as error:
            raise JudgeError(str(error)) from error

        result: dict[str, Judgement] = {}
        for m in missions:
            answer = response.scores[m.id]
            probabilities = {LEVEL_KEYS[level]: p for level, p in answer.probabilities.items()}
            result[m.id] = Judgement(
                choice=most_likely(probabilities),
                probabilities=probabilities,
                confidence=answer.confidence,
            )
        return result

    async def judge_reward(self, name: str) -> RewardJudgement:
        questions = {
            "price": Choice(
                instructions="Roughly how much money does this reward typically cost?",
                criteria=PRICE_CRITERIA,
            ),
            "period": Choice(
                instructions="If this reward could not be bought with money, how long should "
                "someone keep up their daily efforts to deserve it?",
                criteria=PERIOD_CRITERIA,
            ),
        }
        try:
            response = await self._client.system_one({"reward": name}, questions, model=MODEL)
        except TypeSafeError as error:
            raise JudgeError(str(error)) from error

        def to_judgement(key: str) -> Judgement:
            answer = response.choices[key]
            return Judgement(
                choice=answer.choice,
                probabilities=dict(answer.probabilities),
                confidence=answer.confidence,
            )

        return RewardJudgement(price=to_judgement("price"), period=to_judgement("period"))
