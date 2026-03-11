Design a modern responsive web application UI for a personal stock trading journal.

This is NOT a brokerage platform and NOT a complex trading system.
It is a simple personal tool used by a trader to quickly log stock trades and review them later.

Primary goal:
Allow the user to log a trade in under 10 seconds.

Target user:
An active trader who trades stocks and wants to quickly record trades, attach chart screenshots, and review mistakes.

Platform:
Responsive web app (desktop + mobile web).

Design style:
Minimal modern SaaS interface similar to Notion, Linear, and modern dashboards.

Style guidelines:
- clean and calm UI
- neutral color palette
- subtle accent colors
- rounded cards
- lots of whitespace
- simple typography
- no clutter
- prioritize usability over decoration

Core UX principles:
- extremely fast trade logging
- minimal required fields
- optimized for daily use
- easy chart screenshot paste or upload
- quick mistake tagging
- simple trade review

Main screens:

1. Dashboard / Home

Purpose:
Quick overview and fast access to add trades.

Elements:
- large "Add Trade" button
- weekly summary cards:
  - total trades
  - win rate
  - total P/L
- recent trades list (last 5)
- most common mistake tags
- "Rule of the day" card showing a trading rule from the user profile

Layout:
clean card-based dashboard layout.

2. Add Trade (MOST IMPORTANT SCREEN)

Purpose:
Log a trade quickly.

Fields:
- stock ticker / symbol
- entry price
- exit price
- optional quantity
- short memo (optional)

Mistake tags (button style):
- FOMO
- late stop loss
- chasing
- emotional trade
- overconfidence

Chart screenshot section:
Large drop zone supporting:
- drag and drop image
- upload image
- paste from clipboard

Label:
"Paste or upload chart screenshot"

Buttons:
- Save Trade
- Save & Add Another

UX rules:
- minimal input
- large fields
- fast interaction
- optimized for mobile typing

3. Trade History

Purpose:
Browse past trades.

Elements:
- list of trades
- each item shows:
  - ticker
  - date
  - profit / loss
  - mistake tags
- filters:
  - date range
  - tags
- search by ticker

Design:
simple list or card layout.

4. Trade Detail

Purpose:
View full information of a trade.

Elements:
- ticker
- entry and exit price
- calculated profit/loss
- memo
- mistake tags
- chart screenshot image
- edit button

Layout:
vertical card layout.

5. Review / Insights

Purpose:
Help user review trading behavior.

Elements:
- total trades
- win rate
- total P/L
- most common mistake tags
- simple P/L over time chart
- list of recent trade notes

Design:
minimal analytics with simple charts.

6. Trading Profile

Purpose:
A personal page for the trader to store rules, mindset reminders, and goals.

This is NOT a traditional account settings page.

Sections:

Trading Principles:
Editable multiline text area.
Placeholder examples:
- Always respect stop loss
- Never chase momentum
- Protect capital first

Common Mistakes:
Selectable mistake tags.

Trading Goals:
Fields such as:
- daily max loss
- monthly target return
- risk per trade

Mindset Quotes / Reminders:
Text area for motivational trading quotes.

Example placeholders:
"The market punishes ego."
"Respect risk."

Navigation:

Desktop:
Top navigation bar with:
Dashboard
Add Trade
History
Review
Profile

Mobile:
Bottom navigation with icons:
Dashboard
Add Trade
History
Review
Profile

Additional UX considerations:

The user frequently views charts on TradingView and then logs trades here.

The chart upload area must support:
- paste from clipboard
- drag and drop
- upload file

Logging a trade should feel extremely fast and frictionless.

Goal of the product:
Create a tool a trader would happily use every day to record trades and reflect on mistakes.