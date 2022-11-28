from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

db = mysql.connector.connect(
    host=os.getenv("PLANETSCALE_DB_HOST"),
    user=os.getenv("PLANETSCALE_DB_USERNAME"),
    passwd=os.getenv("PLANETSCALE_DB_PASSWORD"),
    db=os.getenv("PLANETSCALE_DB"),
    ssl_verify_identity=True,
    ssl_ca=os.getenv('PLANETSCALE_SSL_CERT_PATH'),
)

'''db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='vnu_route_planner_db_new'
)'''

mycursor = db.cursor()
