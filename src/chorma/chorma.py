import chromadb

chormadb_client = chromadb.Client()

collection = chormadb_client.create_collection(name="my_collection")


collection.add(
    ids= ["id1"],
    documents=[
       r"C:\Users\Dharm\OneDrive\Desktop\BOOKS\grokking-algorithms-illustrated-programmers-curious.pdf"
    ]
)
result = collection.query(
    query_texts=["who am i?"],
    n_results=2
)
print(result)

print(collection.count())
# print(collection.peek())
# print(collection.get(ids=["id1"]))