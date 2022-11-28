from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

db = mysql.connector.connect(
    host=os.getenv("HOST"),
    user=os.getenv("USERNAME"),
    passwd=os.getenv("PASSWORD"),
    db=os.getenv("DATABASE"),
    ssl_verify_identity=True,
    ssl_ca='/etc/pki/tls/certs/ca-bundle.crt'
)

'''db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='vnu_route_planner_db_new'
)'''

mycursor = db.cursor()
