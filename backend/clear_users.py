from utils.mongo import db

def clear_all_users():
    if db is None:
        print("Could not connect to MongoDB.")
        return

    result = db.users.delete_many({})
    print(f"Deleted {result.deleted_count} users from the database.")

if __name__ == "__main__":
    clear_all_users()
