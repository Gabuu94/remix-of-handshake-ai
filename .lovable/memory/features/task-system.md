---
name: Task system
description: Only Text Annotation is free (interactive 6-question quiz). All other surveys require subscription upgrade.
type: feature
---
- Only the "Text Annotation" survey (Data Annotation category) is free (`requires_subscription = false`)
- All other 27 surveys require an active subscription
- Text Annotation has 6 complex built-in questions (sentiment, NER, intent classification, etc.)
- Quiz analyzes answers, requires 50%+ to pass and credit balance
- Dashboard and Tasks pages check `task.requires_subscription` field to show lock/unlock per task
- Rewards stored in cents, displayed via formatMoney()
