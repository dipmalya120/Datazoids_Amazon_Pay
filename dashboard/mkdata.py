import pandas as pd, json
d=pd.read_csv("../data/Amazon Pay India Analytics Case Dataset.csv")
d.columns=d.columns.str.strip().str.lower().str.replace(" ","_")
g={"Male":0,"Female":1,"Other":2}
rows=[]
for r in d.itertuples(index=False):
    rows.append([int(r.age),g[r.gender],int(r.city_tier.split()[1]),int(r.monthly_income_inr),int(r.tenure_months),int(r.amazon_prime_member),int(r.avg_monthly_transactions),int(r.avg_transaction_value_inr),int(r.cashback_used_pct),int(r.app_engagement_score),int(r.customer_support_contacts),int(r.net_promoter_score),int(r.churned)])
open("data.json","w").write(json.dumps(rows,separators=(",",":")))
print(len(rows),len(open("data.json").read()))
