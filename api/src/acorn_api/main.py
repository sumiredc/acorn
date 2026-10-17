import os
from dataclasses import asdict
from functools import cache
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typesafe_sdk import AsyncTypeSafeClient, TypeSafeError

from acorn_api import pricing
from acorn_api.jev import JevJudge, Judge, JudgeError, MissionInput
from acorn_api.schemas import (
    JudgementOut,
    JudgeMissionsIn,
    JudgeMissionsOut,
    JudgeRewardIn,
    JudgeRewardOut,
    MissionOut,
)

app = FastAPI(title="Acorn API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ACORN_CORS_ORIGINS", "http://localhost:8081").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

JEV_FAILED = "jev_failed"


@cache
def get_judge() -> Judge:
    # Created lazily so tests that override this dependency never need an API key.
    try:
        return JevJudge(AsyncTypeSafeClient())
    except TypeSafeError as error:
        raise HTTPException(status_code=502, detail=JEV_FAILED) from error


JudgeDep = Annotated[Judge, Depends(get_judge)]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/judge/missions")
async def judge_missions(body: JudgeMissionsIn, judge: JudgeDep) -> JudgeMissionsOut:
    missions = [MissionInput(id=m.id, name=m.name, kind=m.kind) for m in body.missions]
    try:
        judgements = await judge.judge_missions(missions)
    except JudgeError as error:
        raise HTTPException(status_code=502, detail=JEV_FAILED) from error

    return JudgeMissionsOut(
        missions=[
            MissionOut(
                id=m.id,
                pt=pricing.mission_pt(body.budget_usd, m.kind, judgements[m.id].choice),
                judgement=JudgementOut(**asdict(judgements[m.id])),
            )
            for m in missions
        ]
    )


@app.post("/judge/reward")
async def judge_reward(body: JudgeRewardIn, judge: JudgeDep) -> JudgeRewardOut:
    try:
        result = await judge.judge_reward(body.name)
    except JudgeError as error:
        raise HTTPException(status_code=502, detail=JEV_FAILED) from error

    price = pricing.most_likely(result.price.probabilities)
    period = pricing.most_likely(result.period.probabilities)
    pt, mode = pricing.reward_pt(body.budget_usd, price, period)
    shown = result.price if mode == "price" else result.period
    return JudgeRewardOut(pt=pt, mode=mode, judgement=JudgementOut(**asdict(shown)))
