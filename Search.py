
'''
Get prompt from website
Get and apply filters to prompt
Search websites
Get data
Store data on sql database


'''
from bs4 import BeautifulSoup

with open("SeniorExpo.html", "r") as f:
    doc = BeautifulSoup(f, "html.parser")

print(doc)