'''
Get prompt from website
Get and apply filters to prompt
Search websites
Get data
Store data on sql database


'''
import requests
from bs4 import BeautifulSoup
from pony import orm

db = orm.Database()
#temporarily going to use sqlite to gauruntee functionality 
#going to switch to postgres once website is hosted.
db.bind(provider='sqlite', filename='products.db', create_db=True)
#db.bind(provider='postgres', user='Admin', password='Admin', host='local', port='1127')

#initializing the product class, to be changed once we have an actual database set up
class Product(db.Entity):
    name=orm.Required(str)
    price=orm.Required(float)

db.generate_mapping(create_tables=True)