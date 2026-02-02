from pymongo import MongoClient

# Jayesh Dhamal connection URI
MONGO_URI = "mongodb+srv://jayeshdhamal03:jayeshdhamal003@cluster01.k7got.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01"

# Create a client 
client = MongoClient(MONGO_URI)

# Create (or access) a database called "health_app"   / database for the client

db = client["health_app"]

# create (or access ) a database called "chat history "



# Access (or create) a collection for users
users_collection = db["users"]


