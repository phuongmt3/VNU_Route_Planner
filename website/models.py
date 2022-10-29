import mysql.connector

db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='root',
    database='vnu_route'
)

mycursor = db.cursor()
