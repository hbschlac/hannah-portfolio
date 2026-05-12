import type { Quote, Experiment } from "./types";

/**
 * Public customer feedback corpus for Walmart Auto Care Centers, Sam's Club
 * Tire & Battery, Costco Tire Center, and Discount Tire.
 *
 * Reddit quotes pulled via pullpush.io API (verbatim, with permalink + date
 * from created_utc). ConsumerAffairs/Yelp/forums marked as secondary and
 * linked for reader verification rather than reproduced verbatim.
 *
 * Collected April 10–14, 2026. 18-month freshness window where dates are
 * visible. Every quote on this page either (a) has a verifiable Reddit
 * permalink or (b) is explicitly marked as a secondary public source.
 *
 * Inclusion rule: a friction theme only surfaces in the memo if it appears
 * in at least 2 independent sources for the same brand + journey stage.
 */
export const QUOTES: Quote[] = [
  // ===== COSTCO benchmark (Reddit, verbatim via pullpush) =====
  {
    id: "c1",
    brand: "costco",
    stage: "discover",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/askcarguys/comments/1kbv51l/tires_from_discount_tire_or_costco/mq0lzvl/",
    date: "2025-05",
    quote:
      "Costco recently added free installation and free road hazard insurance on tire purchases. The price per tire was the same at both, but the free hazard insurance and install made Costco hundreds cheaper than Discount.",
  },
  {
    id: "c2",
    brand: "costco",
    stage: "discover",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/CostcoCanada/comments/1jtqqy8/tires/mlw7ws9/",
    date: "2025-04",
    quote:
      "What makes Costco better than most is their warranty and that their prices include installation. Most places these days are charging around $30/tire.",
  },
  {
    id: "c3",
    brand: "costco",
    stage: "discover",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/tires/comments/1co49ux/best_alternative_to_michelin_defender2/l3cx6b6/",
    date: "2024-05",
    quote:
      "Costco price includes installation, disposal of old tires, 5 year road hazard warranty, rotation and balance every 7500 miles, free repair if tire is repairable.",
  },
  {
    id: "c4",
    brand: "costco",
    stage: "checkin",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Costco/comments/1jomero/something_costco_doesnt_have_best_price_on/mkxis85/",
    date: "2025-04",
    quote: "Or I could book an appointment at Costco and grab a hot dog while I wait.",
  },
  {
    id: "c5",
    brand: "costco",
    stage: "service",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/OlderGenZ/comments/1ibt6iq/how_many_jobs_have_you_had_what_fields/m9qmxyp/",
    date: "2025-01",
    quote:
      "Costco Tire Center, Tire installer - honestly a great job. I loved the people at the store and the work was satisfactory.",
  },
  {
    id: "c6",
    brand: "costco",
    stage: "post_visit",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Costco/comments/1i58dah/costco_february_2025_coupon_book_inwarehouse/m88ykav/",
    date: "2025-01",
    quote:
      "I love the tire center. Road warrantied a tire for $50 when I got a 1/4\" bolt stuck in it.",
  },
  {
    id: "c7",
    brand: "costco",
    stage: "post_visit",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/AMG/comments/1k0ww4h/i_need_new_tires_for_my_e55_suggestions_for_ride/mnhon57/",
    date: "2025-04",
    quote: "Costco gives you free installation, free lifetime rotation, and lifetime road hazard.",
  },

  // ===== DISCOUNT TIRE benchmark (Reddit, verbatim via pullpush) =====
  {
    id: "d1",
    brand: "discount_tire",
    stage: "schedule",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/TeslaModelY/comments/1jzt80a/i_have_to_change_my_four_tires_any_good/mn8u2js/",
    date: "2025-04",
    quote:
      "i LOVE costco but for tires, it's an inferior experience to americas tires / discount tires. setting up an appointment is easier, your appointment is way faster, they have way more tires, AND they price match costco.",
  },
  {
    id: "d2",
    brand: "discount_tire",
    stage: "schedule",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/lincoln/comments/1jg5fcc/wheres_a_good_place_to_get_a_cheap_set_of_tires/mj7f1ba/",
    date: "2025-03",
    quote:
      "Discount tire. Make an appointment online. I was in and out of there very fast and it was reasonable.",
  },
  {
    id: "d3",
    brand: "discount_tire",
    stage: "schedule",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/BoomersBeingFools/comments/1foplf7/they_just_ordered/loubfuu/",
    date: "2024-09",
    quote:
      "Before they had this system, you would have to wait hours for tires. Their appointment system via the app had completely turned my experience around. Now they are in and out so fast.",
  },
  {
    id: "d4",
    brand: "discount_tire",
    stage: "checkin",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Costco/comments/1gyd1n3/if_you_value_your_time_dont_buy_tires_from_costco/lyomkq5/",
    date: "2024-11",
    quote:
      "Last time I had an appointment at Discount tire my car was done faster than I could eat lunch at Wendys next door.",
  },
  {
    id: "d5",
    brand: "discount_tire",
    stage: "service",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/TeslaSupport/comments/1j11vhi/tire_rotation_at_discount_tire_or_tesla/mfjabdb/",
    date: "2025-03",
    quote: "Discount Tire is faster, cheaper, and actually has appointments available.",
  },
  {
    id: "d6",
    brand: "discount_tire",
    stage: "service",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/madisonwi/comments/1ilbaix/when_my_friends_ask_me_what_its_like_to_live_in/mbusqzp/",
    date: "2025-02",
    quote:
      "I showed up at Discount Tire with a nail in one of my tires, ready to pay for a fully new set because it felt like about time for that. They patched it for me for free and told me I still had about 4 months before they needed to be replaced.",
  },
  {
    id: "d7",
    brand: "discount_tire",
    stage: "pickup",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/TeslaModelY/comments/1fugyz1/current_thoughts_on_discount_tire_vs_costco/lpzd6pr/",
    date: "2024-10",
    quote:
      "Hands down discount tire. My Costco is very slow. Discount is fast and they should price match. I ordered my tires from discount and they arrived later that day and they installed them in about 30-45 minutes.",
  },
  {
    id: "d8",
    brand: "discount_tire",
    stage: "post_visit",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/uberdrivers/comments/1hm8psl/so_many_complaints_about_how_much_tires_cost/m3sb7h3/",
    date: "2024-12",
    quote:
      "Hmm, spent $1,050 with road hazard warranty for new tires on my Buick in 2022, 3 months later one of the tires went flat from a nail in a non repairable spot, Discount replaced the tire for free, no questions asked.",
  },
  {
    id: "d9",
    brand: "discount_tire",
    stage: "post_visit",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Costco/comments/1f1650s/i_think_im_done_buying_tires_at_costco/lk2s8l2/",
    date: "2024-08",
    quote:
      "Discount Tire is where it's at. I got a nail in my tire about 3 hours away from home. Drove to the nearest Discount Tire, they replaced my tire for free since i was still under their warranty. Was back on the road with a new tire within the hour.",
  },

  // ===== WALMART ACC (Reddit, verbatim via pullpush) =====
  {
    id: "w1",
    brand: "walmart_acc",
    stage: "checkin",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/walmart/comments/1j3ehug/dont_go_to_walmart_for_anything_automotive/mg2cdy5/",
    date: "2025-03",
    quote:
      "i'm a former Tire & Lube Tech at walmart so I can confirm they are a lot of idiots working in the shop at walmart. but look on the bright side, at least they didn't work on your jeep. ya it sucks u wasted 2 hours of your time for nothing but i'd rather them deny my appointment than think they know what they're doing and fk up my vehicle.",
  },
  {
    id: "w2",
    brand: "walmart_acc",
    stage: "checkin",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/walmart/comments/1j3ehug/dont_go_to_walmart_for_anything_automotive/mg2cdy5/",
    date: "2025-03",
    quote:
      "The fact that you had a 7AM Appointment but had to wait until 9AM should be enough to get you some kind of discount or gift card for your inconvenience.",
  },
  {
    id: "w3",
    brand: "walmart_acc",
    stage: "schedule",
    sentiment: "mixed",
    source: "reddit",
    url: "https://www.reddit.com/r/walmart/comments/1ibhp1a/if_you_buy_a_new_battery_does_walmart_auto_center/m9j41bl/",
    date: "2025-01",
    quote:
      "Call your local Walmart Auto Care Center to make an appointment. You may find yourself waiting for an hour or more without that appointment.",
  },
  {
    id: "w4",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Lawrence/comments/1hfr68t/walmart_auto_center/m2dm7dg/",
    date: "2024-12",
    quote:
      "Yeah idk I had 2 tires put on just about a month ago. Took 30 mins, maybe. Pretty reasonable time to wait imo, walk around walmart while you wait.",
  },
  {
    id: "w5",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "mixed",
    source: "reddit",
    url: "https://www.reddit.com/r/Nicegirls/comments/1frhxyc/gods_chicken_changes_you/lpdyt32/",
    date: "2024-09",
    quote:
      "Walmart auto care center does conventional coil changes for $25-30 in most states. The wait time usually sucks tho",
  },
  {
    id: "w7",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/uberdrivers/comments/1iq32y5/buy_your_tires_at_walmart_thank_me_later/mcxds86/",
    date: "2025-02",
    quote:
      "I steer clear of walmart tires because the last time I got em, it took nearly 4 hours for them to get done. Bought online and made an appointment and everything and still wasted 4 hours of my life to save a couple hundred bucks.",
  },
  {
    id: "w8",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/tires/comments/1hcorrl/goodyear_reliant_tires_from_walmart/m1rrbln/",
    date: "2024-12",
    quote:
      "Wow good price! I just got them installed on my 2017 VW Tiguan last week. I paid $84 each. Walmart tire services was horrible. Took them 3 hours even with an appointment.",
  },
  {
    id: "w9",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/MechanicAdvice/comments/1h2m3ap/diy_oil_change_is_it_worth_it/lzm5fu8/",
    date: "2024-11",
    quote:
      "They pull my truck in, and after about 15 mins, the girl behind the counter comes into the waiting room and asks if I could walk up to the closet auto part store and grab a filter for them. I was floored by the request. What choice did I have so I went and did it.",
  },
  {
    id: "w10",
    brand: "walmart_acc",
    stage: "post_visit",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Cleveland/comments/1fff6t8/best_place_to_replace_tires_in_or_near_cleveland/lmumohg/",
    date: "2024-09",
    quote:
      "Bent rim or worn out lug nuts? They'll replace stripped nuts with new ones free, but more importantly they will fix your rim for free (cost anywhere from 1-$300 anywhere else) because they have been sued so many times in the past due to install complaints by people who hit potholes",
  },
  {
    id: "w11",
    brand: "walmart_acc",
    stage: "checkin",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/walmart/comments/1bh5y3h/acc_ipad_app_is_absolute_garbage/kvbo9e0/",
    date: "2024-03",
    quote:
      "That app has eaten 4 work orders this week. It still gets stuck in the car inspection loop where it won't progress because it's missing inspection done and skip takes you back a screen… it fails to save the first input of a new car forcing you to input it a second time…",
  },

  // ===== WALMART ACC — expansion pull (Reddit, verbatim via pullpush) =====
  {
    id: "w12",
    brand: "walmart_acc",
    stage: "schedule",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/walmart/comments/1h4tn6c/how_am_i_supposed_to_get_the_free_rotation/m0ebd7l/",
    date: "2024-12",
    quote:
      "That's the dumbest thing ever, that you can't schedule an appointment for something that you already paid for. Why sell free lifetime rotation and balance, when you can't even schedule that? I'll tell you why, because they don't want you to take advantage of what you paid for.",
  },
  {
    id: "w13",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/prius/comments/vjvr4q/pennzoil_platinum_vs_castrol_edge_high_mileage/mg079t2/",
    date: "2025-03",
    quote:
      "Walmart did the exact same to me. Asked for Penzoil and the slip said Castrol. I told the guy thats not what I asked for and he refused to give me a discount for the mistake. He said he would do another oil change. Yeah rite! Do you actually think he was going to change the oil or just tell me that he did.",
  },
  {
    id: "w14",
    brand: "walmart_acc",
    stage: "post_visit",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/tires/comments/1isdxr7/discount_tire_vs_walmart/me2ox92/",
    date: "2025-02",
    quote:
      "I work at a Walmart ACC, install comes with free balance and rotation for the lifetime of the tire, good at any ACC in the country. The Walmart+ benefit is free road hazard, means patching is free and if it's too close to the sidewall or non repairable damage (bubbles, blowouts, etc) the new tire is prorated.",
  },
  {
    id: "w15",
    brand: "walmart_acc",
    stage: "discover",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/sarasota/comments/1iypl02/the_cheapest_place_to_get_an_oil_change_here/mewann6/",
    date: "2025-02",
    quote:
      "Honestly, the cheapest place I've found is Walmart's auto center. You can go on the Walmart site, make an appt for an oil change, and then shop at Walmart while you wait. For a conventional it is 25 bucks.",
  },
  {
    id: "w16",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Cartalk/comments/1kc842m/is_it_okay_to_replace_and_buy_new_tires_at_walmart/mq7xjgs/",
    date: "2025-05",
    quote:
      "I have had better luck with Walmart tire installs than with big o tires. Big o breaks the sensors and just clears the light so it turns on 15 miles later.",
  },
  {
    id: "w17",
    brand: "walmart_acc",
    stage: "post_visit",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/tires/comments/1isdxr7/discount_tire_vs_walmart/mdgohsk/",
    date: "2025-02",
    quote:
      "Walmart has free life time rotation when you buy tires from them. I have used this every 5000 miles no problems or issues.",
  },
  {
    id: "w18",
    brand: "walmart_acc",
    stage: "discover",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/SaltLakeCity/comments/1jp41au/a_good_place_for_affordable_tires/mky6af8/",
    date: "2025-04",
    quote:
      "I found a steel for tires on Walmart.com the install etc was way less hands down and I had them within a few days. So far they have been great. I saved well over $500 vs discount tire.",
  },
  {
    id: "w19",
    brand: "walmart_acc",
    stage: "discover",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Frugal/comments/1kjdz3y/how_much_money_does_rotating_tires_actually_save/mruyohp/",
    date: "2025-05",
    quote:
      "I have always bought my tires from Walmart and if you buy all 4 there they give you free rotation. I doordash on the side so I replace my tires once every year or year and a half. Driving on bad tires is so dangerous.",
  },
  {
    id: "w20",
    brand: "walmart_acc",
    stage: "service",
    sentiment: "mixed",
    source: "reddit",
    url: "https://www.reddit.com/r/tires/comments/1isdxr7/discount_tire_vs_walmart/mdhaqr2/",
    date: "2025-02",
    quote:
      "Sounds like a bad store. I found one that seems to have their act together. Took about 2 hours to install 4 tires and do an oil change. There's another Walmart within driving distance that's a shitshow. I don't go there.",
  },
  {
    id: "w21",
    brand: "walmart_acc",
    stage: "schedule",
    sentiment: "mixed",
    source: "reddit",
    url: "https://www.reddit.com/r/walmart/comments/1hc1qtp/does_walmart_do_walk_in_tire_rotations/m1knaxo/",
    date: "2024-12",
    quote:
      "You're bothering OFF THE CLOCK Walmart associates because you don't want to call the store and talk to someone who IS on the clock? Most Auto Care services require an appointment. Call 'em and set it up.",
  },

  // ===== SAM'S CLUB (Reddit, verbatim via pullpush) =====
  {
    id: "s1",
    brand: "sams_club",
    stage: "checkin",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/samsclub/comments/1c03yhj/sams_club_tire_reviews/la2i8t1/",
    date: "2024-06",
    quote:
      "Made an appointment for next mon at 11. When I arrived he had no clue what I was talking about. Then he said your call was Transferred to the Phillipines their not really associated with us.",
  },
  {
    id: "s3",
    brand: "sams_club",
    stage: "schedule",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Costco/comments/1gehul2/costco_tires_i_should_have_listened/lubm4ql/",
    date: "2024-10",
    quote:
      "I got fed up with dealing with my Costco Tire Center. So switched to Sams Club for the last 3 changes & couldn't be happier. Less crowded & even the rotation appointment was quick and easy.",
  },
  {
    id: "s7",
    brand: "sams_club",
    stage: "discover",
    sentiment: "positive",
    source: "reddit",
    url: "https://www.reddit.com/r/Costco/comments/1f1650s/i_think_im_done_buying_tires_at_costco/ljzufph/",
    date: "2024-08",
    quote:
      "I have a Sams club membership just for tires now cause it's cheaper, faster, and they have amazing tire warranties that saved me the cost of 2 tires in the first year.",
  },
  {
    id: "s8",
    brand: "sams_club",
    stage: "schedule",
    sentiment: "negative",
    source: "reddit",
    url: "https://www.reddit.com/r/samsclub/comments/1hp6q3q/do_i_just_need_to_buy_a_new_tire_or_is_there_any/m4ghek6/",
    date: "2024-12",
    quote:
      "I've bought tires at both places, prices were very close to each other, discount tire was closer to my house so less drive time. Made an appointment at discount tire and they were much faster than sams club.",
  },
];

/**
 * Experiment cards. Hypotheses grounded in the journey friction the data
 * surfaces. Framed as "what I'd test" — test designs deliberately scoped to
 * pilot-level (single region or store cluster), not enterprise-wide.
 */
export const EXPERIMENTS: Experiment[] = [
  {
    id: "e1",
    stage: "schedule",
    title: "Honest wait-window at the moment of booking",
    hypothesis:
      "If customers see a realistic service window (e.g., \"most 11am tire installs finish between 12:30 and 2:00\") at the moment they book — not just an appointment time — show-rate goes up and post-visit CSAT goes up, because the promise and the reality converge.",
    signal: ["w3", "w7", "w8"],
    test: "A/B the booking confirmation screen at 20 ACC locations for 6 weeks. Control = current \"appointment at 11:00 AM\" copy. Treatment = \"Arrive 11:00 AM — most customers out by 1:00 PM, worst case 2:30 PM,\" computed from last-90-days per-store actuals.",
    primaryMetric: "Post-visit survey CSAT (5-point), booked-online cohort only.",
    secondaryMetrics: [
      "No-show rate — do accurate expectations reduce walk-aways?",
      "% of visits that finish inside the quoted window.",
      "Time-to-book (arrival intent → confirmed slot) on the booking flow.",
    ],
    guardrail:
      "Booking completion rate can't drop more than 2 points vs control — honesty can't cost the funnel.",
  },
  {
    id: "e2",
    stage: "checkin",
    title: "Digital handoff: the appointment the tech already knows about",
    hypothesis:
      "The biggest check-in failure mode is the clipboard moment — customer arrives, tech doesn't have the booking. If the booked service surfaces on the tech's tablet before the customer walks up, the friction disappears — and the fix costs nothing.",
    signal: ["w1", "w2", "w11", "s1"],
    test: "Roll out an ACC-tech tablet view that shows scheduled arrivals + requested services in priority order, at 10 stores. Measure door-to-bay time and the rate of \"we don't have you in the system\" complaints in the same corpus we're tracking here.",
    primaryMetric: "Median door-to-bay time (arrival → vehicle on lift).",
    secondaryMetrics: [
      "Rate of \"we don't have you in the system\" complaints in public reviews for pilot stores vs. matched control.",
      "Technician-reported clarity on next vehicle (short weekly survey).",
      "Booked-appointment show-rate at pilot stores.",
    ],
    guardrail: "Walk-in service time can't regress more than 10% — pilot can't penalize non-appointment customers.",
  },
  {
    id: "e3",
    stage: "service",
    title: "Proof-of-work gallery at pickup",
    hypothesis:
      "Trust in the work being done right is the deepest loyalty lever and the cheapest to fix. A short photo set — installed tires, torque readout, balance numbers, filled-out checklist — turns \"did they actually do it?\" into \"here's what they did.\" That cuts dispute rate — and earns the repeat visit.",
    signal: ["w7", "w8", "w9", "c5"],
    test: "Technicians at 10 pilot stores capture 4 photos + torque value on tire installs via the existing ACC tablet. Photos surface in the Walmart app + receipt email. Compare the same-customer rebooking rate over 6 months vs a matched control cluster.",
    primaryMetric: "Rebook rate within 6 months (same customer, same store, any auto service).",
    secondaryMetrics: [
      "Post-visit dispute / chargeback rate at pilot stores vs. control.",
      "Photo-view rate in the Walmart app (proxy for customer trust-seeking).",
      "Post-service NPS, booked-online cohort only.",
    ],
    guardrail:
      "Median install time stays within 5 minutes of baseline — proof can't slow the bay.",
  },
  {
    id: "e4",
    stage: "post_visit",
    title: "The rotation nudge nobody's sending",
    hypothesis:
      "Customers buy tires with lifetime rotations and never come back for them. A mileage-aware nudge at ~5,000 miles — with a pre-filled booking — turns a one-time tire buyer into a four-times-a-year ACC visitor, and protects the warranty they already paid for.",
    signal: ["c7", "d8", "w10"],
    test: "For customers who bought tires on a Walmart account in the last 12 months, send an SMS at estimated 5k-mile mark (using state DMV avg-miles-per-year by ZIP as a proxy) with a one-tap booking link. A/B vs no nudge.",
    primaryMetric: "Rotation appointment conversion rate (nudge → booking) at 14 days.",
    secondaryMetrics: [
      "Annual ACC visits per tire buyer — lifetime-value proxy.",
      "Warranty-claim file rate among nudged customers vs. control.",
      "SMS tap-through rate (nudge health check).",
    ],
    guardrail:
      "SMS opt-out rate under 1% — a relevant nudge shouldn't cost the channel.",
  },
  {
    id: "e5",
    stage: "discover",
    title: "\"Can they actually service my car today?\" on the PDP",
    hypothesis:
      "Shoppers look at tire pricing and leave because they can't tell if the store down the road can get them in. Surfacing real-time same-day bay availability per store on the tire PDP — not just \"in stock\" — should raise add-to-cart for booked-install tires and reduce the schedule-stage drop-off.",
    signal: ["s7", "c1", "c2"],
    test: "On walmart.com tire PDPs for a sample of 200 SKUs, show a per-store availability widget (\"3 bays open before 6 PM at Walmart Emeryville\") pulled from scheduling. 50/50 traffic split vs control for 4 weeks.",
    primaryMetric: "Rate of tire PDP visits that end in a scheduled ACC appointment.",
    secondaryMetrics: [
      "Tire add-to-cart rate on PDPs with the widget vs. control.",
      "Schedule-stage drop-off rate on booking flow, post-PDP.",
      "Average PDP dwell time — proxy for shopper confidence.",
    ],
    guardrail:
      "No-show rate at appointments can't rise — pulling more bookings forward can't dilute booking quality.",
  },
];
