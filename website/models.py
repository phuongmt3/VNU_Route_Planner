import mysql.connector

db = mysql.connector.connect(
    host='localhost',
    port=3307,
    user='root',
    password='',
    database='vnu_route_planner_db_test'
)

mycursor = db.cursor()
