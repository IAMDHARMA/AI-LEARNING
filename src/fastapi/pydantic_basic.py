from pydantic import BaseModel

class person(BaseModel):
    name:str
    age:int

valdition=person(name="dharma",age="12")

print(valdition)