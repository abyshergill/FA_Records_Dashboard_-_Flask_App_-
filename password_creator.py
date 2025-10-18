from werkzeug.security import generate_password_hash, check_password_hash
from utility.user import User
from handler import db, app

def password_creator():
    user_name = input("Enter your name   : ")
    password = input("Enter your password : ")
    
    try:
        hashed_password = generate_password_hash(password)
    except NameError:
        print("Error: 'generate_password_hash' function is not defined. Make sure to import it (e.g., from werkzeug.security).")
        return

    with app.app_context():
        if User.query.filter_by(username=user_name).first():
            print(f"User '{user_name}' already exists. Creation aborted.")
            return

        new_user = User(username=user_name, password_hash=hashed_password)
        
        print(f"\nAttempting to create user...")
        print(f"User name   : {user_name}")
        print(f"Hashed Pass : {hashed_password[:30]}...") 
        
        db.session.add(new_user)
        db.session.commit()
        
        print(f"\n✅ User '{user_name}' successfully created and added to the database.")

if __name__ == '__main__':
    password_creator()

