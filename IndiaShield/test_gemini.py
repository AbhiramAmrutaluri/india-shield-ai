"""Quick test for Gemini search grounding disaster fetch."""
from google import genai
from google.genai import types as genai_types
import json
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set. Add it to .env before running this script.")

today = datetime.now(tz=timezone.utc).strftime("%B %d, %Y")

prompt = (
    f"Today is {today}. Search and list 5 current India disaster events as a JSON array only "
    "(no markdown fences, no code blocks) with fields: title, type (one of: earthquake/flood/fire/"
    "cyclone/landslide/accident/heatwave/drought/dust_storm/tsunami/cold_wave/industrial), location, "
    "lat (float), lng (float), severity (critical/severe/moderate/low), description, source, affectedPeople (integer)."
)

client = genai.Client(api_key=GEMINI_API_KEY)
resp = client.models.generate_content(
    model="models/gemini-2.5-flash",
    contents=prompt,
    config=genai_types.GenerateContentConfig(
        tools=[genai_types.Tool(google_search=genai_types.GoogleSearch())],
        temperature=0.1,
    ),
)
text = resp.text.strip()
print("RAW RESPONSE:\n", text[:500])

# strip code fences if present
if text.startswith("```"):
    parts = text.split("```")
    text = parts[1] if len(parts) > 1 else text
    if text.startswith("json"):
        text = text[4:]

start = text.find("[")
end = text.rfind("]") + 1
if start == -1 or end <= 0:
    print("No JSON array found")
else:
    events = json.loads(text[start:end])
    print(f"\nParsed {len(events)} events:")
    for e in events:
        print(f"  [{e.get('type')}] {e.get('severity')} - {e.get('title', '')[:70]}")
