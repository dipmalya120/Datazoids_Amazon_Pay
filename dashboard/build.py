import pathlib
s=pathlib.Path("src")
data=open("data.json").read()
html=f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amazon Pay India · Customer Retention & Cashback Dashboard</title>
<style>{open('fonts.css').read()}{(s/'style.css').read_text()}</style></head><body>
<header><div class="wm"><div><div class="nm">Amazon Pay India</div><svg width="150" height="16" viewBox="0 0 300 40" aria-hidden="true"><path d="M8 8 Q150 44 262 10" fill="none" stroke="#FF9900" stroke-width="7" stroke-linecap="round"/><path d="M244 2 L270 9 L254 26" fill="none" stroke="#FF9900" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><div class="sub"><div class="kick">Analytics Case Study 5.0 · IIM Kashipur</div><div class="sg" style="font-size:16px;font-weight:700">Customer Retention and Cashback Effectiveness: Live Dashboard</div></div><div class="team"><div class="kick" style="color:#FEBD69">Prepared by</div><b class="sg" style="font-size:16px;color:#fff">Dipmalya Chakraborty</b></div><a class="ghb" href="https://github.com/dipmalya120/Datazoids_Amazon_Pay" target="_blank" rel="noopener" title="Open the code repository"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14"/></svg><span><b>View the code on GitHub</b><small>Notebook and full analysis</small></span><i>↗</i></a></header>
<nav></nav><div class="fbar"></div><main></main>
<script>window.__ROWS__={data};</script>
<script>{(s/'core.js').read_text()}
{(s/'app1.js').read_text()}
{(s/'app0.js').read_text()}
{(s/'app2.js').read_text()}
{(s/'app3.js').read_text()}</script></body></html>"""
pathlib.Path("index.html").write_text(html)
print(len(html))
