'''
Get prompt from website
Get and apply filters to prompt
Search websites
Get data
Store data on sql database


'''

from bs4 import BeautifulSoup
import requests

url = "https://www.newegg.com/gigabyte-windforce-gv-n5070wf3oc-12gd-geforce-rtx-5070-12gb-graphics-card-triple-fans/p/N82E16814932777"
result = requests.get(url)
doc = BeautifulSoup(result.text, "html.parser")

prices = doc.find_all(text="$")
parent = prices[0].parent
strong = parent.find("strong")
print(strong.string)