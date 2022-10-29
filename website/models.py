import mysql.connector

db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='vnu_route_planner_db_test'
)

mycursor = db.cursor()
