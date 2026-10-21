// Common Ground | PNC Housing Opportunity & AI Toolkit Matcher
// Enterprise dataset (Zero emojis, clear Target vs. Peer Benchmark hierarchy, decision-useful metrics)

const PNC_TOOLS = [
  {
    id: "pnc-multifamily",
    name: "PNC Multifamily LIHTC & Preservation Debt",
    category: "PNC Existing Tool",
    active: true,
    isCustom: false,
    tags: ["supply-lihtc", "infill-dev"],
    desc: "Construction debt and 4%/9% Low-Income Housing Tax Credit (LIHTC) equity for affordable apartment development and preservation.",
    url: "https://www.pnc.com/en/corporate-and-institutional/financing/lending-options/pnc-real-estate/multifamily-capital.html"
  },
  {
    id: "pnc-cdb",
    name: "PNC CDFI & Nonprofit Pre-Development Credit",
    category: "PNC Existing Tool",
    active: true,
    isCustom: false,
    tags: ["cdfi-predev", "rehab-credit"],
    desc: "Low-cost revolving credit lines and subordinate loans to certified CDFIs and nonprofit builders for site acquisition and rehab.",
    url: "https://www.pnc.com/en/about-pnc/corporate-responsibility/community-dev-banking.html"
  },
  {
    id: "pnc-community-loan",
    name: "PNC Community Loan (3% Down, No PMI)",
    category: "PNC Existing Tool",
    active: true,
    isCustom: false,
    tags: ["low-downpayment", "credit-readiness"],
    desc: "Retail mortgage requiring just 3% down with zero private mortgage insurance (PMI) and flexible reserve rules for LMI buyers.",
    url: "https://www.pnc.com/en/personal-banking/borrowing/home-lending/mortgage-loans/specialized-loan-rates.html"
  },
  {
    id: "pnc-grants",
    name: "PNC Homebuyer Grant ($5,000 Closing/DPA)",
    category: "PNC Existing Tool",
    active: true,
    isCustom: false,
    tags: ["dpa-grant"],
    desc: "Up to $5,000 toward down payment or closing costs in LMI census tracts; stackable with municipal first-time buyer programs.",
    url: "https://www.pnc.com/en/personal-banking/borrowing/home-lending/mortgage-loans/down-payment-assistance.html"
  },
  {
    id: "pnc-hardship",
    name: "PNC Mortgage Hardship & Retention Program",
    category: "PNC Existing Tool",
    active: true,
    isCustom: false,
    tags: ["borrower-retention"],
    desc: "Payment deferral, disaster forbearance, and loan modification to prevent displacement for existing borrowers.",
    url: "https://www.pnc.com/en/customer-service/client-resource.html"
  }
];

const SUGGESTED_CUSTOM_TOOLS = [
  {
    id: "custom-workforce-adu",
    name: "Hospital & Teacher Down-Payment + Backyard ADU Loan",
    category: "Custom Tool",
    active: false,
    isCustom: true,
    tags: ["workforce-adu"],
    desc: "Pairs a $25,000 shared-equity down-payment match for essential workers with a backyard ADU loan to bypass Prop 13 resale freezes."
  },
  {
    id: "custom-roof-bridge",
    name: "Fortified-Roof Grant & Insurance-Relief Bridge Loan",
    category: "Custom Tool",
    active: false,
    isCustom: true,
    tags: ["flood-insurance-dti"],
    desc: "Advances Louisiana's $10,000 Fortified Roof Grant at closing so buyers immediately lock in 30% lower insurance and pass DTI limits."
  },
  {
    id: "custom-small-dollar",
    name: "Small-Dollar Starter & Casita Rehab Mortgage (<$150k)",
    category: "Custom Tool",
    active: false,
    isCustom: true,
    tags: ["small-dollar-rehab"],
    desc: "Low-fee mortgage designed for sub-$150k starter home acquisition-rehab and backyard casita infill."
  }
];

const CASES = [
  {
    id: "sonoma-lake",
    rank: 1,
    target: "Sonoma County, CA",
    reference: "Lake County, IL",
    divergence_axis: "affordability",
    urbanicity: "suburban",
    market_regime: "core",
    category_tag: "Suburban · Affordability Gap",
    peer_baseline: "~$106k Median Income · 70–82% Suburban",
    metric_gap: "7.57x vs. 3.00x Price-to-Income ($779k vs. $327k)",
    qualitative_drivers: "Strict Voter UGBs · 2017 Wildfire Loss · Prop 13 Freeze",
    strip_match: "$102.8k vs. $108.9k Income · Both Affluent Suburban",
    strip_aff: "7.57x vs. 3.00x Home Price · 24.4% vs. 15.8% Rent Burden",
    strip_acc: "0.58 vs. 1.38 Affordable Units/LMI · 9.8% vs. 9.4% Denials",
    summary: "Both counties have near-identical household incomes (~$103k–$109k) and suburban density, but Sonoma median home prices are more than double Lake County ($779k vs. $327k) and low-income unit supply is cut in half (0.58 vs. 1.38 units per LMI household).",
    factors: [
      {
        title: "Strict Urban Growth Boundaries (UGBs) & Permit Delays",
        metrics: "0.58 vs. 1.38 Affordable Units / LMI HH (-58% Supply)",
        why: "Voter-approved UGBs around Santa Rosa, Petaluma & Rohnert Park restrict outward expansion, unlike Lake County's elastic municipal annexation.",
        local_program: "Sonoma Renewal Enterprise District (RED) Infill Fund",
        local_desc: "County JPA gap financing & streamlined approval for transit-oriented infill inside city UGBs.",
        required_tag: "supply-lihtc",
        action: "Pair PNC Multifamily LIHTC & Debt with Sonoma's RED Fund to finance mid-density infill apartments inside existing city boundaries.",
        suggested_custom_id: "custom-workforce-adu"
      },
      {
        title: "2017 Wildfire Supply Loss (5,300+ Homes) & High Rebuild Costs",
        metrics: "$779,000 (7.57x) vs. $326,600 (3.00x) Median Value",
        why: "The 2017 Tubbs/Nuns fires destroyed 5,300+ homes; high California labor and permit fees make low-margin starter replacement unviable without gap credit.",
        local_program: "Sonoma County Affordable Housing Fund (CSAHD)",
        local_desc: "County subordinate pre-development subsidies for nonprofit replacement housing.",
        required_tag: "cdfi-predev",
        action: "Extend PNC CDFI Pre-Development Credit to local nonprofit builders to bridge site holding and entitlement costs.",
        suggested_custom_id: "custom-workforce-adu"
      },
      {
        title: "Prop 13 Inventory Freeze & Essential Workforce Lockout",
        metrics: "24.4% ($2,093/mo) vs. 15.8% ($1,434/mo) Rent Burden",
        why: "Prop 13 freezes property tax assessments, discouraging older owners from downsizing and locking up starter stock. Standard $5k grants cannot bridge a $779k home.",
        local_program: "CalHFA $40,000 ADU Grant & Municipal Workforce Rules",
        local_desc: "State grants up to $40k for homeowners building backyard Accessory Dwelling Units (ADUs).",
        required_tag: "workforce-adu",
        action: "Deploy the Hospital & Teacher Down-Payment + Backyard ADU Loan, stacking with CalHFA ADU grants to add gentle density.",
        suggested_custom_id: "custom-workforce-adu"
      }
    ],
    peers: [
      { name: "Will County, IL", form: "81% Suburban · 10% Urban · 8% Rural", u: 10, s: 81, r: 8, pop: "698,000", inc: "$107,799", value: "$298,000 (2.76x)", aff: 18.5, acc: 35.6, units: 1.42, denial: "10.1%" },
      { name: "Lake County, IL", form: "82% Suburban · 12% Urban · 6% Rural", u: 12, s: 82, r: 6, pop: "712,000", inc: "$108,917", value: "$326,600 (3.00x)", aff: 28.6, acc: 38.7, units: 1.38, denial: "9.4%" },
      { name: "Bucks County, PA", form: "83% Suburban · 12% Rural · 5% Urban", u: 5, s: 83, r: 12, pop: "646,000", inc: "$111,951", value: "$421,700 (3.77x)", aff: 56.9, acc: 62.9, units: 0.97, denial: "9.6%" },
      { name: "Sonoma County, CA", form: "70% Suburban · 17% Rural · 13% Urban", u: 13, s: 70, r: 17, pop: "486,000", inc: "$102,840", value: "$779,000 (7.57x)", aff: 97.5, acc: 75.8, units: 0.58, denial: "9.8%" },
      { name: "Ventura County, CA", form: "79% Suburban · 14% Urban · 7% Rural", u: 14, s: 79, r: 7, pop: "838,000", inc: "$107,327", value: "$768,400 (7.16x)", aff: 97.6, acc: 64.8, units: 0.52, denial: "11.4%" }
    ]
  },
  {
    id: "lafayette-elpaso",
    rank: 2,
    target: "Lafayette Parish, LA",
    reference: "El Paso County, TX",
    divergence_axis: "access",
    urbanicity: "urban",
    market_regime: "core",
    category_tag: "Urban · Access Gap",
    peer_baseline: "~$63k Median Income · Mid-Size Regional Hub",
    metric_gap: "25.8% vs. 15.2% Mortgage Denials (+10.6% Gap)",
    qualitative_drivers: "Flood Insurance DTI Spike · Oil/Gas Volatility · FEMA Exclusions",
    strip_match: "$67.7k vs. $58.9k Income · Comparable Urban-Suburban Split",
    strip_aff: "3.46x vs. 2.84x Home Price ($234k vs. $167k)",
    strip_acc: "25.8% vs. 15.2% Mortgage Denials · 1.12 vs. 1.29 Units/LMI",
    summary: "Despite moderate home prices ($234k, or 3.46x income), more than 1 in 4 mortgage applicants in Lafayette Parish are rejected (25.8% vs. 15.2% in peer El Paso County).",
    factors: [
      {
        title: "25.8% Mortgage Denial Rate & Oil/Gas Income Volatility",
        metrics: "25.8% vs. 15.2% Purchase Denial Rate (+10.6% Gap)",
        why: "El Paso is anchored by stable Fort Bliss federal payrolls, whereas Lafayette's oil/gas workforce faces cyclical income swings that fail standard automated underwriting.",
        local_program: "Lafayette LCG First-Time Homebuyer & HUD Counseling",
        local_desc: "Municipal borrower readiness and down-payment education pipeline.",
        required_tag: "low-downpayment",
        action: "Pair PNC Community Loan (3% down, no PMI) with HUD counseling and alternative income documentation review.",
        suggested_custom_id: "custom-roof-bridge"
      },
      {
        title: "Lagging Preservation Stock & FEMA Flood-Zone Exclusions",
        metrics: "1.12 vs. 1.29 Affordable Units / LMI HH",
        why: "El Paso preserved 1,590+ public units via HUD RAD tax credits; Lafayette's city homeowner rehab rules exclude properties inside FEMA flood zones.",
        local_program: "Lafayette Consolidated Plan HOME / CDBG Rehab",
        local_desc: "City homeowner rehabilitation grants (requires private gap financing for flood-zone properties).",
        required_tag: "cdfi-predev",
        action: "Use PNC CDFI Pre-Development Credit to fund flood-resilient rental preservation in tracts excluded by city rules.",
        suggested_custom_id: "custom-roof-bridge"
      },
      {
        title: "Post-2016 Flood Exposure & Surging Insurance Blowing Up DTI",
        metrics: "$31.8M Uninsured Flood Loss · Insurance Pushes DTI > 45%",
        why: "Soaring Louisiana wind/flood insurance inflates monthly payments beyond what home prices show—causing DTI mortgage denials when buyers lack $10k cash upfront for roof upgrades.",
        local_program: "Louisiana Fortify Homes Program ($10,000 Roof Grant)",
        local_desc: "State grant up to $10,000 for IBHS FORTIFIED roofs, cutting insurance premiums by 25–40%.",
        required_tag: "flood-insurance-dti",
        action: "Deploy the Fortified-Roof Grant Bridge Loan—advancing the $10k state grant at closing so lower insurance immediately clears DTI.",
        suggested_custom_id: "custom-roof-bridge"
      }
    ],
    peers: [
      { name: "Montgomery County, OH", form: "63% Suburban · 29% Urban · 8% Rural", u: 29, s: 63, r: 8, pop: "536,000", inc: "$64,403", value: "$167,400 (2.60x)", aff: 20.9, acc: 29.9, units: 1.55, denial: "10.8%" },
      { name: "El Paso County, TX", form: "64% Suburban · 31% Urban · 5% Rural", u: 31, s: 64, r: 5, pop: "866,000", inc: "$58,859", value: "$167,300 (2.84x)", aff: 38.3, acc: 30.6, units: 1.29, denial: "15.2%" },
      { name: "Oklahoma County, OK", form: "55% Suburban · 39% Urban · 6% Rural", u: 39, s: 55, r: 6, pop: "800,000", inc: "$65,374", value: "$207,800 (3.18x)", aff: 48.7, acc: 41.3, units: 1.33, denial: "11.0%" },
      { name: "Lafayette Parish, LA", form: "52% Suburban · 29% Urban · 20% Rural", u: 29, s: 52, r: 20, pop: "245,000", inc: "$67,660", value: "$234,200 (3.46x)", aff: 54.8, acc: 59.1, units: 1.12, denial: "25.8%" },
      { name: "East Baton Rouge Parish, LA", form: "51% Suburban · 41% Urban · 8% Rural", u: 41, s: 51, r: 8, pop: "453,000", inc: "$63,075", value: "$241,800 (3.83x)", aff: 72.8, acc: 68.7, units: 1.01, denial: "12.8%" }
    ]
  },
  {
    id: "bernalillo-monroe",
    rank: 3,
    target: "Bernalillo County, NM",
    reference: "Monroe County, NY",
    divergence_axis: "affordability",
    urbanicity: "urban",
    market_regime: "core",
    category_tag: "Urban · Affordability Gap",
    peer_baseline: "~$70k Median Income · Mid-Size Metro Core",
    metric_gap: "4.04x vs. 2.65x Price-to-Income · 0.93 vs. 1.52 Units/LMI",
    qualitative_drivers: "In-Migration Surge · Casita Infill Gap · First-Gen Cash Barrier",
    strip_match: "$66.5k vs. $74.4k Income · 674k vs. 754k Population",
    strip_aff: "4.04x vs. 2.65x Home Price ($268k vs. $197k)",
    strip_acc: "0.93 vs. 1.52 Affordable Units/LMI · 13.5% vs. 7.7% Denials",
    summary: "Comparable mid-size metropolitan counties where Albuquerque's post-2020 price surge pushed home values to 4.04x income and reduced affordable supply below 1 unit per LMI household.",
    factors: [
      {
        title: "Post-2020 In-Migration Price Spike & Rental Shortage",
        metrics: "0.93 vs. 1.52 Affordable Units / LMI HH (-39% Supply)",
        why: "Remote-work in-migration and construction bottlenecks reduced Bernalillo's affordable rental stock below 1 unit per LMI household.",
        local_program: "Housing Forward ABQ & Workforce Housing Trust Fund",
        local_desc: "City motel-to-housing conversion grants and local gap subsidies for <=80% AMI apartments.",
        required_tag: "supply-lihtc",
        action: "Combine PNC Multifamily LIHTC & Debt with Albuquerque's Trust Fund to preserve and convert affordable multifamily units.",
        suggested_custom_id: "custom-small-dollar"
      },
      {
        title: "Elevated Mortgage Denials (13.5% vs. 7.7%) & Cash Hurdle",
        metrics: "13.5% vs. 7.7% Purchase Denial Rate (+5.8% Gap)",
        why: "Denials in Bernalillo are nearly double Monroe County due to upfront closing-cost gaps among first-generation buyers.",
        local_program: "NM MFA HomeNow ($7,000–$15,000 Forgivable DPA)",
        local_desc: "State soft-second down-payment assistance for LMI first-time buyers.",
        required_tag: "dpa-grant",
        action: "Stack PNC's $5,000 Homebuyer Grant + 3%-Down Community Loan directly on top of NM MFA HomeNow assistance.",
        suggested_custom_id: "custom-small-dollar"
      },
      {
        title: "Sub-$150k Casita Infill & Older Starter Rehab Financing Gap",
        metrics: "$268,500 (4.04x) vs. $197,100 (2.65x) Median Value",
        why: "Albuquerque legalized backyard casitas and starter rehabs, but conventional lenders avoid sub-$150k loans due to fixed origination costs.",
        local_program: "Housing Forward ABQ Casita Fast-Track Permitting",
        local_desc: "Pre-approved city building plans and expedited permitting for infill casitas.",
        required_tag: "small-dollar-rehab",
        action: "Deploy the Small-Dollar Starter & Casita Rehab Mortgage (<$150k) to finance older starter rehabs and backyard casitas.",
        suggested_custom_id: "custom-small-dollar"
      }
    ],
    peers: [
      { name: "Onondaga County, NY", form: "59% Suburban · 25% Urban · 16% Rural", u: 25, s: 59, r: 16, pop: "472,000", inc: "$74,740", value: "$185,300 (2.48x)", aff: 14.5, acc: 32.6, units: 1.62, denial: "9.8%" },
      { name: "Monroe County, NY", form: "59% Suburban · 31% Urban · 9% Rural", u: 31, s: 59, r: 9, pop: "754,000", inc: "$74,409", value: "$197,100 (2.65x)", aff: 22.5, acc: 30.4, units: 1.52, denial: "7.7%" },
      { name: "Erie County, NY", form: "54% Suburban · 36% Urban · 10% Rural", u: 36, s: 54, r: 10, pop: "950,000", inc: "$71,175", value: "$217,400 (3.05x)", aff: 36.7, acc: 38.0, units: 1.35, denial: "9.9%" },
      { name: "Bernalillo County, NM", form: "49% Suburban · 45% Urban · 7% Rural", u: 45, s: 49, r: 7, pop: "674,000", inc: "$66,514", value: "$268,500 (4.04x)", aff: 72.8, acc: 60.4, units: 0.93, denial: "13.5%" },
      { name: "Providence County, RI", form: "49% Suburban · 43% Urban · 7% Rural", u: 43, s: 49, r: 7, pop: "659,000", inc: "$78,204", value: "$339,100 (4.34x)", aff: 75.5, acc: 58.2, units: 0.92, denial: "11.1%" }
    ]
  },
  {
    id: "bucks-burlington",
    rank: 4,
    target: "Bucks County, PA",
    reference: "Burlington County, NJ",
    divergence_axis: "access",
    urbanicity: "suburban",
    market_regime: "core",
    category_tag: "Suburban · Access Gap",
    peer_baseline: "~$108k Median Income · Philadelphia Metro Suburbs",
    metric_gap: "0.97 vs. 1.28 Affordable Units/LMI · +$95k Entry Price",
    qualitative_drivers: "Large-Lot Suburban Zoning · Starter Stock Deficit · Down-Payment Gap",
    strip_match: "$112.0k vs. $105.3k Income · 83% vs. 76% Suburban",
    strip_aff: "3.77x vs. 3.10x Home Price ($422k vs. $327k)",
    strip_acc: "0.97 vs. 1.28 Units/LMI · Low Denials (9.6% vs. 10.2%)",
    summary: "Adjacent Delaware Valley suburbs with ~$108k median income. Bucks County has low mortgage denials (9.6%), but starter-home scarcity (0.97 units/LMI) and a $95k higher entry price block first-time buyers.",
    factors: [
      {
        title: "$95,000 Entry Price Premium & Upfront Down-Payment Barrier",
        metrics: "$421,700 (3.77x) vs. $326,700 (3.10x) Median Value",
        why: "Bucks has a low 9.6% denial rate; the bottleneck is upfront cash savings needed to compete for scarce entry-level homes.",
        local_program: "Bucks County First-Time Homebuyers Program ($10,000 Loan)",
        local_desc: "County zero-interest deferred mortgage up to $10,000 toward down payment and closing costs.",
        required_tag: "dpa-grant",
        action: "Stack PNC's $5,000 Homebuyer Grant + 3%-Down Community Loan onto Bucks County's $10,000 deferred loan ($15k total relief).",
        suggested_custom_id: "custom-workforce-adu"
      },
      {
        title: "Large-Lot Suburban Zoning Limiting Starter & Rental Stock",
        metrics: "0.97 vs. 1.28 Affordable Units / LMI HH (-24% Stock)",
        why: "Bucks County's 2025–29 Consolidated Plan cites restrictive municipal zoning and multi-year waiting lists for affordable units.",
        local_program: "Bucks County Housing Trust Fund & HOME Partnerships",
        local_desc: "County subordinate funding for nonprofit acquisition and rehabilitation.",
        required_tag: "cdfi-predev",
        action: "Use PNC CDFI Pre-Development Credit to help nonprofit partners acquire and preserve starter townhomes and rentals.",
        suggested_custom_id: "custom-workforce-adu"
      }
    ],
    peers: [
      { name: "Gloucester County, NJ", form: "78% Suburban · 15% Rural · 7% Urban", u: 7, s: 78, r: 15, pop: "305,000", inc: "$102,807", value: "$283,500 (2.76x)", aff: 23.4, acc: 34.9, units: 1.41, denial: "10.2%" },
      { name: "Burlington County, NJ", form: "76% Suburban · 14% Rural · 10% Urban", u: 10, s: 76, r: 14, pop: "464,000", inc: "$105,271", value: "$326,700 (3.10x)", aff: 43.7, acc: 37.0, units: 1.28, denial: "10.2%" },
      { name: "Chesterfield County, VA", form: "82% Suburban · 11% Rural · 6% Urban", u: 6, s: 82, r: 11, pop: "372,000", inc: "$98,910", value: "$336,700 (3.40x)", aff: 54.6, acc: 55.7, units: 1.10, denial: "9.9%" },
      { name: "Bucks County, PA", form: "83% Suburban · 12% Rural · 5% Urban", u: 5, s: 83, r: 12, pop: "646,000", inc: "$111,951", value: "$421,700 (3.77x)", aff: 56.9, acc: 62.9, units: 0.97, denial: "9.6%" },
      { name: "Placer County, CA", form: "74% Suburban · 17% Rural · 9% Urban", u: 9, s: 74, r: 17, pop: "412,000", inc: "$114,678", value: "$658,800 (5.74x)", aff: 89.4, acc: 64.0, units: 0.54, denial: "8.9%" }
    ]
  },
  {
    id: "snohomish-will",
    rank: 5,
    is_backup: true,
    target: "Snohomish County, WA",
    reference: "Will County, IL",
    divergence_axis: "affordability",
    urbanicity: "suburban",
    market_regime: "core",
    category_tag: "Suburban · Affordability Gap",
    peer_baseline: "~$111k Median Income · High-Income Metro Suburbs",
    metric_gap: "5.95x vs. 2.76x Price-to-Income ($685k vs. $298k)",
    qualitative_drivers: "804-Day Multifamily Permit Delay · Entitlement Carrying Costs",
    strip_match: "$115.1k vs. $107.8k Income · 76% vs. 81% Suburban",
    strip_aff: "5.95x vs. 2.76x Home Price ($685k vs. $298k)",
    strip_acc: "0.64 vs. 1.42 Units/LMI · 804-Day Avg. Multifamily Permit",
    summary: "High-income metro suburbs where Snohomish multifamily housing permits averaged 804 calendar days vs. ~110 days in Will County, driving severe price divergence.",
    factors: [
      {
        title: "804-Day Multifamily Permitting Delay Inflating Carrying Costs",
        metrics: "804 Days Permit Review vs. ~110 Days in Will County",
        why: "2024 Snohomish permitting records show 804 calendar days (395 active review days) for multifamily approvals, crippling builder holding costs.",
        local_program: "Washington CHIP Infrastructure Fee Waiver & County Trust Fund",
        local_desc: "State grants waiving municipal utility connection fees for affordable infill.",
        required_tag: "cdfi-predev",
        action: "Provide PNC CDFI Pre-Development bridge loans to absorb multi-year entitlement holding costs alongside WA CHIP waivers.",
        suggested_custom_id: "custom-workforce-adu"
      }
    ],
    peers: [
      { name: "Will County, IL", form: "81% Suburban · 10% Urban · 8% Rural", u: 10, s: 81, r: 8, pop: "698,000", inc: "$107,799", value: "$298,000 (2.76x)", aff: 18.5, acc: 35.6, units: 1.42, denial: "10.1%" },
      { name: "Lake County, IL", form: "82% Suburban · 12% Urban · 6% Rural", u: 12, s: 82, r: 6, pop: "712,000", inc: "$108,917", value: "$326,600 (3.00x)", aff: 28.6, acc: 38.7, units: 1.38, denial: "9.4%" },
      { name: "Snohomish County, WA", form: "76% Suburban · 14% Urban · 10% Rural", u: 14, s: 76, r: 10, pop: "844,000", inc: "$115,100", value: "$685,000 (5.95x)", aff: 88.2, acc: 61.4, units: 0.64, denial: "9.5%" }
    ]
  },
  {
    id: "jefferson-williamson",
    rank: 6,
    is_backup: true,
    target: "Jefferson County, CO",
    reference: "Williamson County, TX",
    divergence_axis: "access",
    urbanicity: "suburban",
    market_regime: "core",
    category_tag: "Suburban · Access Gap",
    peer_baseline: "~$109k Median Income · Fast-Growing Metro Suburbs",
    metric_gap: "0.71 vs. 1.31 Affordable Units/LMI · 5.45x vs. 3.82x Value",
    qualitative_drivers: "1% Annual Growth Cap Legacy · Foothills Topographic & Water Limits",
    strip_match: "$109.7k vs. $108.9k Income · 80% vs. 77% Suburban",
    strip_aff: "5.45x vs. 3.82x Home Price ($598k vs. $416k)",
    strip_acc: "0.71 vs. 1.31 Units/LMI · Severe Starter Inventory Deficit",
    summary: "Affluent Denver and Austin suburbs with matching ~$109k median incomes. Jefferson County's decades-long 1% annual residential permit cap restricted starter townhome supply compared to Williamson County's master-planned buildout.",
    factors: [
      {
        title: "Legacy 1% Residential Growth Cap & Starter Stock Deficit",
        metrics: "0.71 vs. 1.31 Affordable Units / LMI HH (-46% Starter Stock)",
        why: "Golden and Lakewood municipal growth caps limited multi-unit and townhome entitlements for two decades, locking moderate-income buyers out of ownership.",
        local_program: "Colorado Proposition 123 Local Affordable Housing Fund",
        local_desc: "Dedicated state land-banking and concessionary equity grants for jurisdictions committing to 3% annual affordable housing growth.",
        required_tag: "supply-lihtc",
        action: "Pair PNC Multifamily LIHTC & Debt with Colorado Prop 123 land-banking grants to finance transit-oriented workforce apartments.",
        suggested_custom_id: "custom-workforce-adu"
      },
      {
        title: "$182,000 Entry Price Premium Blocking First-Time Buyers",
        metrics: "$598,000 (5.45x) vs. $416,000 (3.82x) Median Value",
        why: "Even with strong household incomes and low credit denial rates, first-time buyers face an upfront down-payment gap on $598k median homes.",
        local_program: "CHFA FirstStep & Jefferson County Down Payment Assistance",
        local_desc: "State and county subordinate second mortgages up to $25,000 for first-time buyers.",
        required_tag: "dpa-grant",
        action: "Layer PNC's $5,000 Homebuyer Grant + 3%-Down Community Loan with CHFA subordinate down-payment assistance.",
        suggested_custom_id: "custom-workforce-adu"
      }
    ],
    peers: [
      { name: "Williamson County, TX", form: "77% Suburban · 13% Urban · 10% Rural", u: 13, s: 77, r: 10, pop: "643,000", inc: "$108,900", value: "$416,000 (3.82x)", aff: 44.2, acc: 36.4, units: 1.31, denial: "9.8%" },
      { name: "Johnson County, KS", form: "82% Suburban · 12% Urban · 6% Rural", u: 12, s: 82, r: 6, pop: "619,000", inc: "$107,400", value: "$362,000 (3.37x)", aff: 31.8, acc: 33.1, units: 1.39, denial: "8.4%" },
      { name: "Jefferson County, CO", form: "80% Suburban · 11% Urban · 9% Rural", u: 11, s: 80, r: 9, pop: "576,000", inc: "$109,700", value: "$598,000 (5.45x)", aff: 82.1, acc: 66.8, units: 0.71, denial: "9.1%" }
    ]
  },
  {
    id: "alachua-champaign",
    rank: 7,
    target: "Alachua County, FL",
    reference: "Champaign County, IL",
    divergence_axis: "affordability",
    urbanicity: "suburban",
    market_regime: "college",
    category_tag: "College Town · Affordability Gap",
    peer_baseline: "~$61k Median Income · Flagship University Counties",
    metric_gap: "4.47x vs. 3.25x Price-to-Income · 18.2% vs. 8.9% Denials",
    qualitative_drivers: "Single-Family Exclusionary Zoning Around Campus vs. Upzoned Corridors",
    strip_match: "$59.7k vs. $63.1k Income · UF Gainesville vs. UIUC Champaign",
    strip_aff: "4.47x vs. 3.25x Home Price ($267k vs. $205k)",
    strip_acc: "0.76 vs. 1.33 Units/LMI · 18.2% vs. 8.9% Mortgage Denials",
    summary: "Flagship university counties grouped into a dedicated town-type peer pool because large off-campus student populations alter baseline income and rental ratios.",
    factors: [
      {
        title: "Single-Family Exclusionary Zoning Around University Core",
        metrics: "0.76 vs. 1.33 Affordable Units / LMI HH · 86.0 vs. 50.8 Burden",
        why: "Champaign upzoned campus-adjacent corridors for high-density apartments, keeping rents and starter prices low compared to Gainesville.",
        local_program: "Gainesville / Alachua SHIP Housing Partnership",
        local_desc: "Florida SHIP funds providing local down-payment and infill rehab assistance.",
        required_tag: "supply-lihtc",
        action: "Pair PNC Multifamily LIHTC & Debt with Florida SHIP funds to build non-student workforce apartments.",
        suggested_custom_id: "custom-workforce-adu"
      }
    ],
    peers: [
      { name: "Champaign County, IL", form: "54% Suburban · 28% Urban · 18% Rural", u: 28, s: 54, r: 18, pop: "206,098", inc: "$63,091", value: "$205,100 (3.25x)", aff: 50.8, acc: 48.6, units: 1.33, denial: "8.9%" },
      { name: "Alachua County, FL", form: "52% Suburban · 26% Urban · 22% Rural", u: 26, s: 52, r: 22, pop: "281,751", inc: "$59,659", value: "$266,800 (4.47x)", aff: 86.0, acc: 68.3, units: 0.76, denial: "18.2%" }
    ]
  },
  {
    id: "graysharbor-fulton",
    rank: 8,
    target: "Grays Harbor County, WA",
    reference: "Fulton County, NY",
    divergence_axis: "affordability",
    urbanicity: "rural",
    market_regime: "vacation",
    category_tag: "Vacation & Resort · Affordability Gap",
    peer_baseline: "~$63k Median Income · Rural Recreational Counties",
    metric_gap: "4.40x vs. 2.49x Price-to-Income · 0.91 vs. 1.62 Units/LMI",
    qualitative_drivers: "Coastal Second-Home & Short-Term Rental Conversion of Local Stock",
    strip_match: "$63.5k vs. $62.6k Income · 43–52% Rural Share",
    strip_aff: "4.40x vs. 2.49x Home Price ($280k vs. $156k)",
    strip_acc: "0.91 vs. 1.62 Units/LMI · Second-Home Inventory Conversion",
    summary: "Rural recreational and coastal counties grouped into a dedicated town-type pool so second-home and vacation demand is benchmarked against true resort peers.",
    factors: [
      {
        title: "Coastal Vacation / Short-Term Rental Conversion of Local Stock",
        metrics: "$279,500 (4.40x) vs. $156,100 (2.49x) · 0.91 vs. 1.62 Units/LMI",
        why: "Second-home and vacation rental demand along the Washington coast prices out year-round hospitality and timber workers.",
        local_program: "WA Dept. of Commerce Rural Home Rehabilitation & Housing Trust",
        local_desc: "State grants for deed-restricted year-round workforce housing in rural coastal counties.",
        required_tag: "cdfi-predev",
        action: "Partner PNC CDFI Pre-Development Credit with rural land trusts to lock in year-round workforce occupancy covenants.",
        suggested_custom_id: "custom-workforce-adu"
      }
    ],
    peers: [
      { name: "Fulton County, NY", form: "52% Rural · 28% Suburban · 20% Urban", u: 20, s: 28, r: 52, pop: "52,787", inc: "$62,615", value: "$156,100 (2.49x)", aff: 14.3, acc: 37.9, units: 1.62, denial: "16.0%" },
      { name: "Grays Harbor County, WA", form: "43% Rural · 37% Suburban · 20% Urban", u: 20, s: 37, r: 43, pop: "76,397", inc: "$63,539", value: "$279,500 (4.40x)", aff: 76.2, acc: 56.2, units: 0.91, denial: "10.4%" }
    ]
  },
  {
    id: "kings-midland",
    rank: 9,
    target: "Kings County, CA",
    reference: "Midland County, TX",
    divergence_axis: "affordability",
    urbanicity: "rural",
    market_regime: "extractive",
    category_tag: "Agricultural & Energy · Affordability Gap",
    peer_baseline: "Ag & Energy Production Counties · 150k–170k Pop",
    metric_gap: "4.45x vs. 3.12x Price-to-Income · 0.88 vs. 1.26 Units/LMI",
    qualitative_drivers: "Farmworker Housing Shortage · Water & Permitting Bottlenecks",
    strip_match: "153k vs. 171k Population · High Ag / Energy Share",
    strip_aff: "4.45x vs. 3.12x Home Price ($306k vs. $293k)",
    strip_acc: "0.88 vs. 1.26 Units/LMI · Water & Permitting Bottlenecks",
    summary: "Agricultural and energy-producing counties benchmarked together to control for commodity industry employment cycles.",
    factors: [
      {
        title: "Agricultural Worker Housing Shortage & Infrastructure Gaps",
        metrics: "0.88 vs. 1.26 Affordable Units / LMI HH · 81.8 vs. 39.7 Burden",
        why: "Central Valley water/sewer infrastructure limits and state permitting costs restrict starter home construction in Kings County.",
        local_program: "California HCD Joe Serna, Jr. Farmworker Housing Grant (FWHG)",
        local_desc: "State grants financing new construction and rehab of owner and rental housing for agricultural workers.",
        required_tag: "supply-lihtc",
        action: "Pair PNC Multifamily LIHTC & Debt with California's Farmworker Housing Grant to build permanent affordable family units.",
        suggested_custom_id: "custom-small-dollar"
      }
    ],
    peers: [
      { name: "Midland County, TX", form: "68% Suburban · 20% Urban · 12% Rural", u: 20, s: 68, r: 12, pop: "171,496", inc: "$93,984", value: "$293,000 (3.12x)", aff: 39.7, acc: 35.9, units: 1.26, denial: "24.2%" },
      { name: "Kings County, CA", form: "62% Suburban · 23% Urban · 15% Rural", u: 23, s: 62, r: 15, pop: "152,830", inc: "$68,750", value: "$305,700 (4.45x)", aff: 81.8, acc: 53.6, units: 0.88, denial: "11.8%" }
    ]
  }
];
