import mysql.connector

db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='Binh.191519',
    database='vnu_route_planner_db_test'
)

mycursor = db.cursor()
