import mysql.connector

db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='vnu_route_planner_db_test'
)

mycursor = db.cursor()


dbroad = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='vnu_route'
)

mycursorroad = dbroad.cursor()