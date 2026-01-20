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

stores = {'Amazon':'https://www.amazon.com/', 'Bestbuy':'https://www.bestbuy.com/', 'Newegg':'https://www.newegg.com/'}
estorePriceSelector = {'Amazon':'a-price-whole'}
estoreNameSelector = {'Amazon':'a-size-large product-title-word-break'}
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

def SearchWeb(estore, session):
    url = 'https://www.amazon.com/ASUS-SFF-Ready-Graphics-2-5-Slot-Axial-tech/dp/B0DS6V1YSY?ref=dlx_14777_dg_dcl_B0DS6V1YSY_dt_mese7_5e_pi&pf_rd_r=T4393RHJ5H8NVR965MK8&pf_rd_p=d518a36f-4cd8-436b-b9dd-e041ebaa255e&th=1'
    resp = session.get(url)
    soup = BeautifulSoup(resp.text, "html.parser")
    data = (
        f"{estore}", float(soup.select_one("a-section a-spacing-none aok-align-center aok-relative a-price-whole").text)
#        f"{estore}", float(soup.select_one(estorePriceSelector[estore]).text)

    )
    return data

def main():
    session = requests.Session()
    session.headers.update({
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
    })
    print(SearchWeb('Amazon', session))

if __name__ == '__main__':
    main()