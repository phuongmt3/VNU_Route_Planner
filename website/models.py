import mysql.connector

db = mysql.connector.connect(
    host='localhost',
    port=3306,
    user='root',
    password='',
    database='vnu_route_planner_db_test'
)

mycursor = db.cursor()
