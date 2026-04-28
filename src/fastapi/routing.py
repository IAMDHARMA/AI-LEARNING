from fastapi import FastAPI
from pydantic import BaseModel
from typing import List



app = FastAPI()


class user(BaseModel):
    name:str
    age: int
    interest: str

class Response(user):
    name:str
    category : str
    recomdation : List[str]
   
def get_recommendation(age: int, interest: str):
    # Category
    if age <= 18:
        category = "boy"
    elif age < 30:
        category = "adult"
    else:
        category = "senior"

    # Recommendation
    interest = interest.lower()
    if interest == "music":
        recommendation = ["western music", "indian music"]
    elif interest == "gym":
        recommendation = ["hulk gym", "iron man gym"]
    elif interest == "books":
        recommendation = ["story book", "comic book"]
    else:
        recommendation = ["gift cards", "credits"]

    return category, recommendation



@app.get("/")
def get_user(age:int,interest:str):
    value = get_recommendation(age,interest)
    return value

@app.post("/recomed",response_model=Response)
def put_user(age:int,interest:str):
    Value = get_recommendation(user.age,user.interest)
    return Value


@app.post("/alpha")
def alpsh(a:int,b:int):
    return {
        "answer":a+b
    }


@app.get("/health")
def check():
    return "i am fine"

@app.post("/heh")
def check():
    return "i am fine"

class Numbers(BaseModel):
    a: int
    b: int

@app.post("/al")
def alh(data: Numbers):
    return {
        "answer": data.a + data.b
    }

@app.get("/alla")
def alla(data: Numbers):
    return {
        "answer": data.a + data.b
    }