# Amazon Pay India: Customer Retention and Cashback Effectiveness

**Team DataZoids** · Analytics Case Study 5.0, IIM Kashipur (KOED)
Prepared by **Dipmalya Chakraborty**

**Live dashboard:** https://amazon-pay-cashback-compass.vercel.app/

Amazon Pay India gives customers cashback and Prime benefits, yet about 1 in 5 customers still leaves and rewards cost a lot. Using 5,000 customer records, this project answers five business questions and recommends how to spend rewards more wisely.

## Headline findings

| # | Question | What we found | What we recommend |
|---|----------|---------------|-------------------|
| 1 | Why do customers leave? | No customer detail we have predicts who leaves. Gaps between groups are within chance. | Test offers directly. Record reasons for leaving. |
| 2 | Does Prime change behaviour? | No. Prime members behave like others but cost about 38% more in cashback. | Test a smaller premium or spending targets. |
| 3 | Who is worth the most? | What customers do matters more than who they are. Frequent big spenders are worth about 2.2 times the average. | Protect them. Re-engage unhappy and inactive groups. |
| 4 | Is cashback real engagement? | Mostly not. Heavy cashback use does not reduce leaving. | Reward activity, not only redemption. |
| 5 | What offers keep customers? | A 25% cashback cut for heavy users saves 13% to 19% of cashback cost. | Run a 3-group test. Roll out if break-even holds. |

Basic facts: 5,000 customers, 19% churned, 46% Prime members, 2,533 heavy cashback users.

## Repository layout

```
data/          Case dataset (CSV) and the case brief (PDF)
notebooks/     DataZoids_Notebook.ipynb  full analysis: EDA, statistical tests, models, segmentation, A/B design
dashboard/     Interactive dashboard (single HTML file) and the source it is built from
deck/          Final presentation (.pptx)
outputs/       Tables the notebook writes for the dashboard
```

## How to reproduce

```bash
pip install -r requirements.txt
cd notebooks
jupyter notebook DataZoids_Notebook.ipynb   # Run All
```

The notebook reads `../data/Amazon Pay India Analytics Case Dataset.csv` and writes its summary tables to `../outputs/dashboard_data/`. It has been run top to bottom from this layout.

## Dashboard

`dashboard/index.html` is fully self-contained (data, fonts, charts and logic are all inside one file), so it opens by double-click and needs no server.

To rebuild it from source:

```bash
cd dashboard
python mkdata.py   # customer CSV -> data.json
python build.py    # src/ + fonts + data.json -> index.html
```

To deploy on Vercel, set the project's **Root Directory** to `dashboard`. No build command is needed.

## Methods used

Descriptive statistics and distribution checks, chi-square and Mann-Whitney / Kruskal-Wallis / KS tests, Spearman correlation, mutual information, cross-validated logistic regression and gradient boosting (to test whether churn is predictable), K-means customer segmentation with stability checks, break-even modelling for cashback offers, and power calculations for the proposed A/B test.

## Author

Dipmalya Chakraborty, PGDBA (IIM Calcutta, IIT Kharagpur, ISI Kolkata)
