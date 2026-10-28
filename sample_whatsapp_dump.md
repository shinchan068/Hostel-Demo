# Sample Hostel WhatsApp Complaints Dump

This file contains raw, realistic WhatsApp chat dumps from a college hostel group. It includes informal chat, Hinglish, emojis, slang, missing room numbers, and varying priority tags (P0, urgent, normal maintenance).

---

```text
[24/10/26, 21:14:02] Aryan Verma: @Hostel Warden sir urgent geyser in room B-304 is sparking and making weird noise. P0 please send someone immediately electricity trip ho rahi hai!
[24/10/26, 21:18:45] Tanmay K: guys anyone has extra maggi?
[24/10/26, 21:22:10] Rohan Gupta: @Hostel Warden water purifier on 2nd floor wing A is leaking badly, water is flooding the corridor.
[24/10/26, 21:30:15] Shaurya S: Warden sir my fan regulator is broken stuck at full speed cant sleep properly.
[24/10/26, 21:45:00] Rahul N: Wi-Fi router on 4th floor is dead since 6 PM. Midsems from Monday we have submissions tonight please restart router ASAP!! P1
[24/10/26, 22:05:32] Devansh: @Hostel Warden mess dinner had uncooked paneer today half the wing is complaining of stomach issues. Please audit mess vendor.
[24/10/26, 22:15:10] Siddharth: Someone please tell laundry guy to return clothes from Tuesday
[24/10/26, 22:30:40] Aditya M: Room C-112 bathroom door latch broken from outside, got locked in for 20 mins today. Need carpentry fix urgently.
[24/10/26, 23:02:18] Sameer: Tap in washroom 3rd floor west wing is dripping constantly wasting water.
```

---

### What the AI Triage Engine Should Extract from This:
1. **Aryan Verma** -> `P0 - Emergency` | Category: `Electrical` | Location: `B-304` | Issue: Geyser sparking & electrical trip | Alert: Immediate hazard
2. **Tanmay K** -> *Ignored / Noise* (Non-hostel complaint)
3. **Rohan Gupta** -> `P1 - High` | Category: `Plumbing` | Location: `2nd Floor, Wing A` | Issue: Water purifier leaking & corridor flooding
4. **Shaurya S** -> `P2 - Medium` | Category: `Electrical` | Location: `⚠️ Missing Room #` | Issue: Fan regulator stuck at full speed | Flag: Requires room number follow-up
5. **Rahul N** -> `P1 - High` | Category: `Wi-Fi / Network` | Location: `4th Floor` | Issue: Wi-Fi router dead before mid-term submissions
6. **Devansh** -> `P1 - High` | Category: `Mess / Food` | Location: `Hostel Mess` | Issue: Food quality grievance (uncooked food)
7. **Siddharth** -> `P3 - Low / Noise` | Category: `Logistics / Laundry` | Location: `Hostel` | Issue: Delayed laundry return
8. **Aditya M** -> `P1 - High` | Category: `Carpentry` | Location: `C-112` | Issue: Bathroom door latch broken / lockout hazard
9. **Sameer** -> `P2 - Medium` | Category: `Plumbing` | Location: `3rd Floor, West Wing` | Issue: Dripping tap / water conservation
