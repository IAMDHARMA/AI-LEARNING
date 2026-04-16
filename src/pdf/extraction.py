import os

# Add Node.js path manually
os.environ["PATH"] += r";C:\Program Files\nodejs"

from liteparse import LiteParse

pdf_path = r"R:\AI Engineer\liteparse-test\pdfs\20241231173907_1735646947_Kothai Policy (1).pdf"

parser = LiteParse()
result = parser.parse(pdf_path)

print(result.text[:1000])