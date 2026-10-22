// METmatch | Housing Opportunity Intelligence
// Preserves original impact-score architecture + explicit factor-to-program matching

const SCORE_RUBRIC_FACTORS = [
  {
    key: "potential",
    name: "Intervention Potential",
    weight: 20,
    rule: "Can the financial institution's actions meaningfully address the identified local barrier?"
  },
  {
    key: "alignment",
    name: "Toolkit & Program Alignment",
    weight: 20,
    rule: "How well does the institution's active program catalog align with the specific barriers that need to be addressed?"
  },
  {
    key: "capacity",
    name: "Operational Manageability",
    weight: 20,
    rule: "Is it manageable for the institution to execute across funding, staffing, and internal risk/compliance approvals?"
  },
  {
    key: "feasibility",
    name: "Implementation & Expansion Feasibility",
    weight: 20,
    rule: "How realistic is it to implement or scale the needed programs given the institution's footprint, size, and business goals?"
  },
  {
    key: "evidence",
    name: "Evidence Strength",
    weight: 20,
    rule: "How strong is the documented primary evidence proving this barrier is present in the community?"
  }
];

const SOURCES = {
  grants: [
    "PNC · Homebuyer Grants",
    "https://www.pnc.com/en/personal-banking/borrowing/home-lending/mortgage-loans/down-payment-assistance.html",
    "Published down-payment and closing-cost grants ($2,500–$5,000) in qualifying LMI census tracts."
  ],
  community: [
    "PNC · Community Loan",
    "https://www.pnc.com/en/personal-banking/borrowing/home-lending/mortgage-loans/specialized-loan-rates.html",
    "As little as 3% down, no PMI, and flexible reserve requirements for qualifying LMI borrowers."
  ],
  hardship: [
    "PNC · Lending Hardship Assistance",
    "https://www.pnc.com/en/customer-service/client-resource.html",
    "Repayment, forbearance, payment deferral, or loan modification for existing mortgage borrowers."
  ],
  capital: [
    "PNC · Multifamily Capital",
    "https://www.pnc.com/en/corporate-and-institutional/financing/lending-options/pnc-real-estate/multifamily-capital.html",
    "Construction debt, preservation financing, and 4%/9% Low-Income Housing Tax Credit (LIHTC) equity."
  ],
  cdb: [
    "PNC · Community Development Banking",
    "https://www.pnc.com/en/about-pnc/corporate-responsibility/community-dev-banking.html",
    "Affordable housing development, rehabilitation lines, nonprofit pre-development credit, and CDFI partnerships."
  ],
  sonoma: [
    "Sonoma County · Housing Strategy Staff Report",
    "https://sonoma-county.legistar.com/LegislationDetail.aspx?GUID=70051F65-04A5-480D-9E10-C50EBBD0297A&ID=5745185&Options=&Search=",
    "Documents development cost constraints, urban growth boundaries, and infill housing priorities."
  ],
  fire: [
    "Sonoma County · 2018 Recovery Framework",
    "https://sonomacounty.gov/Main%20County%20Site/Administrative%20Support%20%26%20Fiscal%20Services/Emergency%20Management/Documents/Archive/Documents/12-11-2018%20CAO%20Recovery%20Framework%20Adoption_AttA_English_Fully%20Remediated.pdf",
    "Documents approximately 5,143 homes destroyed countywide in the 2017 Tubbs/Nuns wildfires."
  ],
  abq: [
    "City of Albuquerque · Housing Forward ABQ Strategy",
    "https://www.cabq.gov/mayor/news/albuquerque-charts-course-to-confront-housing-crisis",
    "Documents starter supply deficits, motel conversions, and casita/ADU zoning reforms."
  ],
  bucks: [
    "Bucks County · Draft 2025–29 Consolidated Plan",
    "https://www.buckscounty.gov/DocumentCenter/View/21304/Bucks-County-2025-2029-Consolidated-Plan-and-2025-Action-Plan-Draft-for-Public-Review",
    "Printed pp. 71, 83, 97–98: documents restrictive zoning, high land costs, and down-payment savings barriers."
  ],
  lafayette: [
    "Lafayette Consolidated Government · 2023–27 Consolidated Plan",
    "https://www.lafayettela.gov/media/sp0h1j3j/lcg-2023-2027-consolidated-plan-and-2023-annual-action-plan.pdf",
    "Printed p. 78 identifies inadequate rehabilitation and development funding as the primary local barrier."
  ],
  flood: [
    "Lafayette Parish · Hazard Mitigation Plan",
    "https://www.lafayettela.gov/media/ojkbmarb/lafayette-parish-hm-plan.pdf",
    "Documents flood exposure, property insurance pressures, and post-2016 flood recovery conditions."
  ]
};

// Unified Institution Programs list (starts with baseline programs; newly added programs join the exact same list)
const INITIAL_PROGRAMS = [
  {
    id: "prog-multifamily",
    name: "Affordable Housing & LIHTC Multifamily Finance",
    active: true,
    tags: ["supply-lihtc", "infill-dev"],
    desc: "Construction debt, permanent loans, and 4%/9% Low-Income Housing Tax Credit (LIHTC) equity for affordable rental development and preservation.",
    sourceKey: "capital"
  },
  {
    id: "prog-cdb",
    name: "Community Development & CDFI Pre-Development Credit",
    active: true,
    tags: ["cdfi-predev", "rehab-credit"],
    desc: "Revolving credit lines and subordinate financing for certified CDFIs and nonprofit developers to acquire and rehabilitate starter housing.",
    sourceKey: "cdb"
  },
  {
    id: "prog-grants",
    name: "Homebuyer Down-Payment & Closing Grant ($5,000)",
    active: true,
    tags: ["dpa-grant"],
    desc: "Up to $5,000 in stackable down-payment and closing-cost assistance for qualifying buyers in LMI census tracts.",
    sourceKey: "grants"
  },
  {
    id: "prog-community",
    name: "Community Loan (3% Down, Zero PMI)",
    active: true,
    tags: ["low-downpayment", "credit-readiness"],
    desc: "Portfolio mortgage with 3% down, no private mortgage insurance (PMI), and flexible reserve rules for LMI homebuyers.",
    sourceKey: "community"
  },
  {
    id: "prog-hardship",
    name: "Mortgage Hardship & Borrower Retention Program",
    active: true,
    tags: ["borrower-retention"],
    desc: "Forbearance, payment deferral, and loan modification options to keep existing homeowners housed during tax or insurance shocks.",
    sourceKey: "hardship"
  }
];

// Templates used when demoing AI document upload or quick-add
const AI_UPLOAD_TEMPLATES = {
  workforce_adu: {
    name: "Workforce Down-Payment & Backyard ADU Construction Loan",
    tag: "workforce-adu",
    fileName: "Workforce_ADU_Program_Spec_2026.pdf",
    desc: "Extracted from spec sheet: Combines a $25,000 shared-equity down-payment match for healthcare/school employees with a single-close ADU construction loan."
  },
  roof_bridge: {
    name: "Fortified-Roof Grant & Insurance-Relief Bridge Loan",
    tag: "flood-insurance-dti",
    fileName: "Louisiana_Fortified_Roof_Bridge_TermSheet.pdf",
    desc: "Extracted from term sheet: Advances state $10,000 Fortified Roof grants at closing so lower hazard insurance premiums immediately reduce borrower DTI ratios."
  },
  small_dollar: {
    name: "Small-Dollar Casita & Starter Rehab Mortgage (<$150k)",
    tag: "small-dollar-rehab",
    fileName: "Small_Dollar_Rehab_Underwriting_Guide.pdf",
    desc: "Extracted from guide: Streamlined flat-fee mortgage for sub-$150k starter home acquisition-rehab and accessory casita infill."
  }
};

const CASES = [
  {
    id: "sonoma-lake",
    target: "Sonoma County, CA",
    reference: "Lake County, IL",
    divergence_axis: "affordability",
    urbanicity: "suburban",
    market_regime: "standard",
    category_tag: "Suburban · Affordability Gap",
    aff_score: 97.5,
    acc_score: 75.8,
    peer_aff_score: 28.6,
    peer_acc_score: 38.7,
    factor_preview: "0.58 vs. 1.38 units/LMI · Wildfire stock shock, urban growth boundaries & Prop 13 turnover lock-in",
    summary: "Matched high-income suburban peers (~$103k–$109k median income). Sonoma homes cost 7.57x income ($779k) vs. 3.00x ($327k) in Lake County due to severe starter-supply constraints and post-wildfire insurance pressures.",
    base_ratings: {
      potential: 4.5,
      capacity: 3.4,
      feasibility: 3.8,
      evidence: 4.4
    },
    rubric_notes: {
      potential: "Project finance and ADU/rehab lending directly address Sonoma's starter-unit deficit (0.58 vs. 1.38 units/LMI), though bank capital cannot independently alter urban growth boundaries.",
      alignment: "Reflects how many of Sonoma's 3 local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Multifamily LIHTC deals require larger capital envelopes and multi-year underwriting timelines; partner CDFI channels help manage staffing load.",
      feasibility: "Strong alignment with national multifamily and West Coast community development goals; adding a specialized Workforce/ADU product requires standard credit committee sign-off.",
      evidence: "Backed by Sonoma County Housing Strategy staff reports and the 2018 Recovery Framework (5,143 homes lost in the 2017 fires)."
    },
    sources: ["sonoma", "fire", "capital", "cdb", "hardship"],
    factors: [
      {
        title: "Constrained Affordable Supply & Urban Growth Boundaries",
        metrics: "0.58 vs. 1.38 Affordable Units / LMI HH (-58% Supply)",
        why: "Strict municipal urban growth boundaries and $85k+ per-unit impact fees limit multi-unit construction compared to Lake County.",
        local_program: "Sonoma Renewal Enterprise District (RED) Housing Fund",
        local_desc: "County joint-powers fund pooling public land and subordinate loans for transit-oriented infill housing.",
        required_tag: "supply-lihtc",
        action: "Pair Affordable Housing & LIHTC Multifamily Finance with Sonoma's RED Housing Fund to finance entitled infill projects.",
        suggested_template: "workforce_adu"
      },
      {
        title: "2017 Wildfire Housing Loss & Insurance Cost Spike",
        metrics: "5,143 Homes Destroyed · $2,093/mo Median Rent (24.4% Income)",
        why: "The 2017 Tubbs/Nuns fires permanently tightened starter inventory while wildfire insurance premiums strain borrower retention.",
        local_program: "Sonoma County Community Development Commission Rehab Loans",
        local_desc: "County low-interest loans for fire-hardening, roof retrofits, and rental preservation.",
        required_tag: "cdfi-predev",
        action: "Deploy CDFI Pre-Development Credit alongside Mortgage Hardship assistance to preserve existing lower-cost rentals.",
        suggested_template: "workforce_adu"
      },
      {
        title: "Prop 13 Resale Lock-In & Essential Workforce Priced Out",
        metrics: "7.57x vs. 3.00x Home Value-to-Income ($779k vs. $327k)",
        why: "Long-term owners face steep property-tax resets if they sell, freezing starter turnover for nurses, teachers, and service workers.",
        local_program: "Sonoma County Junior ADU & Fee-Waiver Program",
        local_desc: "County pre-approved ADU plans and impact-fee waivers for homeowners adding backyard rental units.",
        required_tag: "workforce-adu",
        action: "Combine a Workforce Down-Payment + Backyard ADU Loan with Sonoma's fee-waived ADU plans to unlock gentle-density supply.",
        suggested_template: "workforce_adu"
      }
    ],
    peers: [
      { name: "Will County, IL", form: "81% Suburban · 10% Urban · 8% Rural", pop: "698k ($107,799)", aff: 18.5, acc: 35.6, value: "$298,000 (2.76x)", denial: 10.1, units: 1.42 },
      { name: "Lake County, IL", form: "82% Suburban · 12% Urban · 6% Rural", pop: "712k ($108,917)", aff: 28.6, acc: 38.7, value: "$326,600 (3.00x)", denial: 9.4, units: 1.38 },
      { name: "Bucks County, PA", form: "83% Suburban · 5% Urban · 12% Rural", pop: "646k ($111,951)", aff: 56.9, acc: 62.9, value: "$421,700 (3.77x)", denial: 9.6, units: 0.97 },
      { name: "Sonoma County, CA", form: "70% Suburban · 13% Urban · 17% Rural", pop: "486k ($102,840)", aff: 97.5, acc: 75.8, value: "$779,000 (7.57x)", denial: 9.8, units: 0.58 },
      { name: "Ventura County, CA", form: "79% Suburban · 14% Urban · 7% Rural", pop: "838k ($107,327)", aff: 97.6, acc: 64.8, value: "$768,400 (7.16x)", denial: 11.4, units: 0.52 }
    ]
  },
  {
    id: "bernalillo-monroe",
    target: "Bernalillo County, NM",
    reference: "Monroe County, NY",
    divergence_axis: "affordability",
    urbanicity: "urban",
    market_regime: "standard",
    category_tag: "Urban · Affordability Gap",
    aff_score: 72.8,
    acc_score: 60.4,
    peer_aff_score: 22.5,
    peer_acc_score: 30.4,
    factor_preview: "4.04x vs. 2.65x home price-to-income · 0.93 vs. 1.52 units/LMI · Missing small-dollar rehab credit",
    summary: "Mid-sized urban peers (~$67k–$74k median income). Albuquerque's rapid price appreciation pushed home values to 4.04x income ($268.5k) vs. 2.65x ($197.1k) in Rochester/Monroe County, NY.",
    base_ratings: {
      potential: 4.3,
      capacity: 3.9,
      feasibility: 4.0,
      evidence: 4.1
    },
    rubric_notes: {
      potential: "Financing motel conversions, workforce rentals, and sub-$150k casita/starter rehab directly targets Albuquerque's 39% starter-stock deficit.",
      alignment: "Reflects how many of Bernalillo's 2 local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Manageable through established Albuquerque CDFI and nonprofit developer intermediaries without heavy new branch staffing.",
      feasibility: "Fits Southwest commercial/retail footprint and CRA goals; small-dollar rehab loans require streamlined flat-fee underwriting rules.",
      evidence: "Supported by the City of Albuquerque's Housing Forward ABQ strategy and ACS/HMDA peer comparisons."
    },
    sources: ["abq", "capital", "cdb", "hardship"],
    factors: [
      {
        title: "Starter Rental & Workforce Supply Deficit",
        metrics: "0.93 vs. 1.52 Affordable Units / LMI HH (-39% Stock)",
        why: "Post-2020 investor demand and construction bottlenecks eroded Bernalillo's historically affordable rental and starter stock.",
        local_program: "Housing Forward ABQ Workforce Housing Trust Fund",
        local_desc: "City of Albuquerque gap financing for adaptive reuse, motel conversions, and workforce rental development.",
        required_tag: "supply-lihtc",
        action: "Pair Affordable Housing & LIHTC Multifamily Finance with Albuquerque's Workforce Housing Trust Fund.",
        suggested_template: "small_dollar"
      },
      {
        title: "Aging Adobe/Starter Stock & Sub-$150k Financing Gap",
        metrics: "13.5% vs. 7.7% Purchase Denials · 4.04x vs. 2.65x Price Ratio",
        why: "Older urban starter homes and backyard casitas require combined purchase-and-rehab loans under $150k that standard lenders under-serve.",
        local_program: "Albuquerque Casita Zoning & Home Rehab Assistance",
        local_desc: "Citywide permissive ADU/casita zoning and homeowner rehabilitation grants for LMI neighborhoods.",
        required_tag: "small-dollar-rehab",
        action: "Originate Small-Dollar Casita & Starter Rehab Mortgages (<$150k) layered with city rehab grants.",
        suggested_template: "small_dollar"
      }
    ],
    peers: [
      { name: "Onondaga County, NY", form: "59% Suburban · 25% Urban · 16% Rural", pop: "472k ($74,740)", aff: 14.5, acc: 32.6, value: "$185,300 (2.48x)", denial: 9.8, units: 1.62 },
      { name: "Monroe County, NY", form: "59% Suburban · 31% Urban · 9% Rural", pop: "754k ($74,409)", aff: 22.5, acc: 30.4, value: "$197,100 (2.65x)", denial: 7.7, units: 1.52 },
      { name: "Erie County, NY", form: "54% Suburban · 36% Urban · 10% Rural", pop: "950k ($71,175)", aff: 36.7, acc: 38.0, value: "$217,400 (3.05x)", denial: 9.9, units: 1.35 },
      { name: "Bernalillo County, NM", form: "49% Suburban · 45% Urban · 7% Rural", pop: "674k ($66,514)", aff: 72.8, acc: 60.4, value: "$268,500 (4.04x)", denial: 13.5, units: 0.93 },
      { name: "Providence County, RI", form: "49% Suburban · 43% Urban · 7% Rural", pop: "659k ($78,204)", aff: 75.5, acc: 58.2, value: "$339,100 (4.34x)", denial: 11.1, units: 0.92 }
    ]
  },
  {
    id: "bucks-burlington",
    target: "Bucks County, PA",
    reference: "Burlington County, NJ",
    divergence_axis: "access",
    urbanicity: "suburban",
    market_regime: "standard",
    category_tag: "Suburban · Access Gap",
    aff_score: 56.9,
    acc_score: 62.9,
    peer_aff_score: 43.7,
    peer_acc_score: 37.0,
    factor_preview: "0.97 vs. 1.28 units/LMI · +$95k entry price premium & large-lot zoning (low 9.6% denials)",
    summary: "Adjacent Philadelphia metro suburbs (~$105k–$112k median income). Bucks County has a low 9.6% denial rate, proving credit isn't the issue—scarce starter stock (0.97 units/LMI) and a $95k entry price premium block first-time buyers.",
    base_ratings: {
      potential: 4.0,
      capacity: 4.5,
      feasibility: 4.6,
      evidence: 4.3
    },
    rubric_notes: {
      potential: "Stacking down-payment grants with nonprofit starter-home preservation directly lowers the $95k upfront entry barrier in Bucks County.",
      alignment: "Reflects how many of Bucks County's 2 local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Highly manageable: leverages existing retail mortgage officers, HUD counselors, and standard DPA grant workflows.",
      feasibility: "Core Mid-Atlantic footprint market with full branch presence and immediate alignment with homeownership access goals.",
      evidence: "Directly documented in the Bucks County 2025–2029 Draft Consolidated Plan (pp. 71, 83, 97–98)."
    },
    sources: ["bucks", "grants", "community", "cdb", "hardship"],
    factors: [
      {
        title: "$95,000 Entry Price Premium & Upfront Down-Payment Barrier",
        metrics: "$421,700 (3.77x) vs. $326,700 (3.10x) Median Value",
        why: "Bucks has a lower mortgage denial rate (9.6%) than Burlington (10.2%); the primary barrier is upfront cash savings for down payments.",
        local_program: "Bucks County First-Time Homebuyers Program ($10,000 Loan)",
        local_desc: "County zero-interest deferred second mortgage up to $10,000 for down payment and closing costs.",
        required_tag: "dpa-grant",
        action: "Stack the $5,000 Homebuyer Grant and 3%-Down Community Loan onto Bucks County's $10,000 deferred loan ($15k total buyer relief).",
        suggested_template: "workforce_adu"
      },
      {
        title: "Large-Lot Suburban Zoning Limiting Starter & Rental Stock",
        metrics: "0.97 vs. 1.28 Affordable Units / LMI HH (-24% Stock)",
        why: "Bucks County's 2025–29 Consolidated Plan cites restrictive municipal lot-size zoning and multi-year affordable housing waitlists.",
        local_program: "Bucks County Housing Trust Fund & HOME Partnerships",
        local_desc: "County subordinate funding for nonprofit acquisition and rehabilitation of starter townhomes and rentals.",
        required_tag: "cdfi-predev",
        action: "Provide CDFI Pre-Development Credit to local nonprofit housing partners to acquire and preserve existing starter units.",
        suggested_template: "workforce_adu"
      }
    ],
    peers: [
      { name: "Gloucester County, NJ", form: "78% Suburban · 7% Urban · 15% Rural", pop: "305k ($102,807)", aff: 23.4, acc: 34.9, value: "$283,500 (2.76x)", denial: 10.2, units: 1.41 },
      { name: "Burlington County, NJ", form: "76% Suburban · 10% Urban · 14% Rural", pop: "464k ($105,271)", aff: 43.7, acc: 37.0, value: "$326,700 (3.10x)", denial: 10.2, units: 1.28 },
      { name: "Chesterfield County, VA", form: "82% Suburban · 6% Urban · 11% Rural", pop: "372k ($98,910)", aff: 54.6, acc: 55.7, value: "$336,700 (3.40x)", denial: 9.9, units: 1.10 },
      { name: "Bucks County, PA", form: "83% Suburban · 5% Urban · 12% Rural", pop: "646k ($111,951)", aff: 56.9, acc: 62.9, value: "$421,700 (3.77x)", denial: 9.6, units: 0.97 },
      { name: "Placer County, CA", form: "74% Suburban · 9% Urban · 17% Rural", pop: "412k ($114,678)", aff: 89.4, acc: 64.0, value: "$658,800 (5.74x)", denial: 8.9, units: 0.54 }
    ]
  },
  {
    id: "lafayette-elpaso",
    target: "Lafayette Parish, LA",
    reference: "El Paso County, TX",
    divergence_axis: "access",
    urbanicity: "urban",
    market_regime: "standard",
    category_tag: "Urban · Access Gap",
    aff_score: 54.8,
    acc_score: 59.1,
    peer_aff_score: 38.3,
    peer_acc_score: 30.6,
    factor_preview: "25.8% vs. 15.2% mortgage denials · Flood/wind insurance DTI shocks & un-retrofitted starter stock",
    summary: "Southern mid-sized peers (~$59k–$68k median income). Home prices are moderate (3.46x income), but Lafayette's purchase mortgage denial rate is 25.8% vs. 15.2% in El Paso due to flood/wind insurance DTI spikes and rehab funding gaps.",
    base_ratings: {
      potential: 4.4,
      capacity: 4.1,
      feasibility: 3.7,
      evidence: 3.6
    },
    rubric_notes: {
      potential: "Bridging state Fortified Roof grants at closing and funding starter rehab directly addresses insurance-driven DTI denials (25.8% vs. 15.2% in El Paso).",
      alignment: "Reflects how many of Lafayette's 2 local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Bounded diagnostic, counseling, and rehab credit partnerships require modest capital and staffing compared to ground-up construction.",
      feasibility: "CDFI rehab credit is ready today; a Fortified-Roof bridge loan requires compliance and secondary-market underwriting review.",
      evidence: "Grounded in Lafayette's 2023–27 Consolidated Plan (p. 78) and Parish Hazard Mitigation Plan."
    },
    sources: ["lafayette", "flood", "cdb", "community", "hardship", "grants"],
    factors: [
      {
        title: "25.8% Mortgage Denial Rate & Flood/Wind Insurance DTI Shock",
        metrics: "25.8% vs. 15.2% Purchase Denials (+10.6 pts)",
        why: "Surging flood and windstorm insurance premiums push moderate-income buyers over standard back-end Debt-to-Income (DTI) underwriting caps.",
        local_program: "Louisiana Fortified Homes Program ($10,000 Roof Grant)",
        local_desc: "State grant up to $10,000 to upgrade roofs to IBHS Fortified standards, cutting wind/homeowners insurance premiums by 25–35%.",
        required_tag: "flood-insurance-dti",
        action: "Deploy a Fortified-Roof Grant & Insurance-Relief Bridge Loan to advance the $10k grant at closing and qualify borrowers on the lower insurance rate.",
        suggested_template: "roof_bridge"
      },
      {
        title: "Older Flood-Exposed Starter Stock & Rehab Capital Deficit",
        metrics: "1.12 vs. 1.29 Affordable Units / LMI HH",
        why: "Lafayette's 2023–27 Consolidated Plan (p. 78) identifies inadequate funding for home rehabilitation as the parish's #1 housing barrier.",
        local_program: "Lafayette LCG HOME & CDBG Owner-Occupied Rehab",
        local_desc: "Parish grants and deferred loans for low-income roof, elevation, and code-compliance rehabilitation.",
        required_tag: "cdfi-predev",
        action: "Pair CDFI Pre-Development & Rehab Credit with LCG HOME rehab funds and HUD-certified readiness counseling.",
        suggested_template: "roof_bridge"
      }
    ],
    peers: [
      { name: "Montgomery County, OH", form: "63% Suburban · 29% Urban · 8% Rural", pop: "536k ($64,403)", aff: 20.9, acc: 29.9, value: "$167,400 (2.60x)", denial: 10.8, units: 1.55 },
      { name: "El Paso County, TX", form: "64% Suburban · 31% Urban · 5% Rural", pop: "866k ($58,859)", aff: 38.3, acc: 30.6, value: "$167,300 (2.84x)", denial: 15.2, units: 1.29 },
      { name: "Oklahoma County, OK", form: "55% Suburban · 39% Urban · 6% Rural", pop: "800k ($65,374)", aff: 48.7, acc: 41.3, value: "$207,800 (3.18x)", denial: 11.0, units: 1.33 },
      { name: "Lafayette Parish, LA", form: "52% Suburban · 29% Urban · 20% Rural", pop: "245k ($67,660)", aff: 54.8, acc: 59.1, value: "$234,200 (3.46x)", denial: 25.8, units: 1.12 },
      { name: "East Baton Rouge Parish, LA", form: "51% Suburban · 41% Urban · 8% Rural", pop: "453k ($63,075)", aff: 72.8, acc: 68.7, value: "$241,800 (3.83x)", denial: 12.8, units: 1.01 }
    ]
  },
  {
    id: "snohomish-will",
    target: "Snohomish County, WA",
    reference: "Will County, IL",
    divergence_axis: "affordability",
    urbanicity: "suburban",
    market_regime: "standard",
    category_tag: "Suburban · Affordability Gap",
    aff_score: 88.2,
    acc_score: 61.4,
    peer_aff_score: 18.5,
    peer_acc_score: 35.6,
    factor_preview: "5.95x vs. 2.76x price-to-income ($685k vs. $298k) · 804-day multifamily permit delay",
    summary: "High-income metro suburbs (~$108k–$115k median income) where Snohomish multifamily housing permits averaged 804 calendar days vs. ~110 days in Will County, driving severe price divergence.",
    base_ratings: {
      potential: 4.3,
      capacity: 3.5,
      feasibility: 3.6,
      evidence: 4.2
    },
    rubric_notes: {
      potential: "Pre-development bridge credit and LIHTC debt help offset carrying costs from Snohomish's 804-day multifamily permitting cycle.",
      alignment: "Reflects how many of Snohomish's 2 local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Requires longer credit horizon (24+ months) to accommodate municipal entitlement review timelines.",
      feasibility: "Strong fit for national Multifamily Capital along Puget Sound transit corridors.",
      evidence: "Documented in 2024 Snohomish County PDS permitting audits (804 calendar days / 395 active review days)."
    },
    sources: ["capital", "cdb", "grants"],
    factors: [
      {
        title: "804-Day Multifamily Permitting Delay Inflating Carrying Costs",
        metrics: "804 Days Permit Review vs. ~110 Days in Will County",
        why: "2024 Snohomish permitting records show 804 calendar days for multifamily approvals, driving up developer holding costs and rents.",
        local_program: "Washington CHIP Infrastructure Fee Waiver & County Trust Fund",
        local_desc: "State grants waiving municipal utility connection fees for affordable infill projects.",
        required_tag: "cdfi-predev",
        action: "Provide CDFI Pre-Development bridge loans to absorb multi-year entitlement holding costs alongside WA CHIP waivers.",
        suggested_template: "workforce_adu"
      },
      {
        title: "Starter Home Price Escalation Near Puget Sound Employment Centers",
        metrics: "5.95x vs. 2.76x Home Value-to-Income ($685k vs. $298k)",
        why: "Seattle/Everett tech and aerospace spillover priced moderate-income households out of detached starter homes.",
        local_program: "Washington Covenant Homeownership & Arch Housing Trust",
        local_desc: "State down-payment assistance and regional suburban infill trust fund.",
        required_tag: "supply-lihtc",
        action: "Deploy Affordable Housing & LIHTC Multifamily Finance to build transit-oriented workforce apartments along the Lynnwood Link corridor.",
        suggested_template: "workforce_adu"
      }
    ],
    peers: [
      { name: "Will County, IL", form: "81% Suburban · 10% Urban · 8% Rural", pop: "698k ($107,799)", aff: 18.5, acc: 35.6, value: "$298,000 (2.76x)", denial: 10.1, units: 1.42 },
      { name: "Lake County, IL", form: "82% Suburban · 12% Urban · 6% Rural", pop: "712k ($108,917)", aff: 28.6, acc: 38.7, value: "$326,600 (3.00x)", denial: 9.4, units: 1.38 },
      { name: "Snohomish County, WA", form: "76% Suburban · 14% Urban · 10% Rural", pop: "844k ($115,100)", aff: 88.2, acc: 61.4, value: "$685,000 (5.95x)", denial: 9.5, units: 0.64 }
    ]
  },
  {
    id: "jefferson-williamson",
    target: "Jefferson County, CO",
    reference: "Williamson County, TX",
    divergence_axis: "access",
    urbanicity: "suburban",
    market_regime: "standard",
    category_tag: "Suburban · Access Gap",
    aff_score: 82.1,
    acc_score: 66.8,
    peer_aff_score: 44.2,
    peer_acc_score: 36.4,
    factor_preview: "0.71 vs. 1.31 units/LMI · Legacy 1% annual residential permit growth cap & $182k price gap",
    summary: "Affluent Denver and Austin suburbs (~$109k median income). Jefferson County's decades-long 1% annual residential permit cap restricted starter townhome supply compared to Williamson County's rapid buildout.",
    base_ratings: {
      potential: 4.2,
      capacity: 4.0,
      feasibility: 4.1,
      evidence: 3.9
    },
    rubric_notes: {
      potential: "LIHTC debt and retail down-payment grants directly expand starter options in a suburb constrained by legacy 1% annual permit caps.",
      alignment: "Reflects how many of Jefferson County's 2 local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Manageable through existing Colorado retail mortgage and multifamily origination teams.",
      feasibility: "Strong Denver metro commercial and retail banking presence supports immediate deployment.",
      evidence: "Documented in Colorado Prop 123 municipal baseline filings and county housing needs assessments."
    },
    sources: ["capital", "grants", "community"],
    factors: [
      {
        title: "Legacy 1% Residential Growth Cap & Starter Stock Deficit",
        metrics: "0.71 vs. 1.31 Affordable Units / LMI HH (-46% Starter Stock)",
        why: "Golden and Lakewood municipal growth caps limited multi-unit and townhome entitlements for two decades.",
        local_program: "Colorado Proposition 123 Local Affordable Housing Fund",
        local_desc: "State land-banking and concessionary equity grants for jurisdictions committing to 3% annual affordable growth.",
        required_tag: "supply-lihtc",
        action: "Pair Affordable Housing & LIHTC Multifamily Finance with Colorado Prop 123 land-banking grants.",
        suggested_template: "workforce_adu"
      },
      {
        title: "$182,000 Entry Price Premium Blocking First-Time Buyers",
        metrics: "$598,000 (5.45x) vs. $416,000 (3.82x) Median Value",
        why: "Even with low credit denial rates (9.1%), first-time buyers face an upfront down-payment hurdle on $598k median homes.",
        local_program: "CHFA FirstStep & Jefferson County Down Payment Assistance",
        local_desc: "State and county subordinate second mortgages up to $25,000 for first-time homebuyers.",
        required_tag: "dpa-grant",
        action: "Layer the $5,000 Homebuyer Grant and 3%-Down Community Loan with CHFA subordinate down-payment assistance.",
        suggested_template: "workforce_adu"
      }
    ],
    peers: [
      { name: "Johnson County, KS", form: "82% Suburban · 12% Urban · 6% Rural", pop: "619k ($107,400)", aff: 31.8, acc: 33.1, value: "$362,000 (3.37x)", denial: 8.4, units: 1.39 },
      { name: "Williamson County, TX", form: "77% Suburban · 13% Urban · 10% Rural", pop: "643k ($108,900)", aff: 44.2, acc: 36.4, value: "$416,000 (3.82x)", denial: 9.8, units: 1.31 },
      { name: "Jefferson County, CO", form: "80% Suburban · 11% Urban · 9% Rural", pop: "576k ($109,700)", aff: 82.1, acc: 66.8, value: "$598,000 (5.45x)", denial: 9.1, units: 0.71 }
    ]
  },
  {
    id: "alachua-champaign",
    target: "Alachua County, FL",
    reference: "Champaign County, IL",
    divergence_axis: "affordability",
    urbanicity: "suburban",
    market_regime: "college",
    category_tag: "College Town · Affordability Gap",
    aff_score: 86.0,
    acc_score: 68.3,
    peer_aff_score: 50.8,
    peer_acc_score: 48.6,
    factor_preview: "4.47x vs. 3.25x price-to-income · Single-family zoning around UF campus vs. UIUC upzoned corridors",
    summary: "Flagship university counties (UF Gainesville vs. UIUC Champaign, ~$60k–$63k median income) grouped into a dedicated College Town pool so off-campus student rental demand is compared against true academic peers.",
    base_ratings: {
      potential: 4.0,
      capacity: 3.8,
      feasibility: 3.7,
      evidence: 3.8
    },
    rubric_notes: {
      potential: "Financing non-student workforce apartments helps relieve pressure around Gainesville's single-family-zoned university core.",
      alignment: "Reflects how many of Alachua's local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Standard LIHTC + Florida SHIP structure is straightforward for multifamily teams to underwrite.",
      feasibility: "Strong healthcare and university anchor employers support stable workforce rental demand.",
      evidence: "Supported by Gainesville/Alachua consolidated housing plans and university corridor zoning comparisons."
    },
    sources: ["capital", "cdb", "grants"],
    factors: [
      {
        title: "Single-Family Exclusionary Zoning Around University Core",
        metrics: "0.76 vs. 1.33 Affordable Units / LMI HH · 86.0 vs. 50.8 Burden",
        why: "Champaign upzoned campus-adjacent corridors for high-density apartments, keeping rents and starter prices low compared to Gainesville.",
        local_program: "Gainesville / Alachua SHIP Housing Partnership",
        local_desc: "Florida SHIP funds providing local down-payment and infill rental rehabilitation assistance.",
        required_tag: "supply-lihtc",
        action: "Pair Affordable Housing & LIHTC Multifamily Finance with Florida SHIP funds to build non-student workforce apartments.",
        suggested_template: "workforce_adu"
      }
    ],
    peers: [
      { name: "Champaign County, IL", form: "54% Suburban · 28% Urban · 18% Rural", pop: "206k ($63,091)", aff: 50.8, acc: 48.6, value: "$205,100 (3.25x)", denial: 8.9, units: 1.33 },
      { name: "Alachua County, FL", form: "52% Suburban · 26% Urban · 22% Rural", pop: "282k ($59,659)", aff: 86.0, acc: 68.3, value: "$266,800 (4.47x)", denial: 18.2, units: 0.76 }
    ]
  },
  {
    id: "graysharbor-fulton",
    target: "Grays Harbor County, WA",
    reference: "Fulton County, NY",
    divergence_axis: "affordability",
    urbanicity: "rural",
    market_regime: "vacation",
    category_tag: "Rural · Vacation & Resort",
    aff_score: 76.2,
    acc_score: 56.2,
    peer_aff_score: 14.3,
    peer_acc_score: 37.9,
    factor_preview: "4.40x vs. 2.49x price-to-income · Coastal second-home & short-term rental conversion of local stock",
    summary: "Rural recreational and coastal counties (~$63k median income) benchmarked within the Vacation & Resort town pool to isolate second-home and short-term rental price pressure.",
    base_ratings: {
      potential: 3.9,
      capacity: 3.4,
      feasibility: 3.2,
      evidence: 3.7
    },
    rubric_notes: {
      potential: "CDFI credit for community land trusts preserves year-round workforce stock against coastal vacation-rental conversion.",
      alignment: "Reflects how many of Grays Harbor's local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Requires partnering with a regional CDFI intermediary because local rural developer capacity is thin.",
      feasibility: "Limited direct rural branch footprint means execution relies on wholesale CDFI credit lines.",
      evidence: "Supported by WA Commerce rural housing audits and ACS seasonal vacancy records."
    },
    sources: ["cdb", "capital"],
    factors: [
      {
        title: "Coastal Vacation & Short-Term Rental Conversion of Local Stock",
        metrics: "$279,500 (4.40x) vs. $156,100 (2.49x) · 0.91 vs. 1.62 Units/LMI",
        why: "Second-home and vacation rental demand along the Washington coast prices out year-round hospitality and timber workers.",
        local_program: "WA Dept. of Commerce Rural Home Rehabilitation & Housing Trust",
        local_desc: "State grants for deed-restricted year-round workforce housing in rural coastal counties.",
        required_tag: "cdfi-predev",
        action: "Partner CDFI Pre-Development Credit with rural community land trusts to lock in year-round workforce occupancy covenants.",
        suggested_template: "workforce_adu"
      }
    ],
    peers: [
      { name: "Fulton County, NY", form: "52% Rural · 28% Suburban · 20% Urban", pop: "53k ($62,615)", aff: 14.3, acc: 37.9, value: "$156,100 (2.49x)", denial: 16.0, units: 1.62 },
      { name: "Grays Harbor County, WA", form: "43% Rural · 37% Suburban · 20% Urban", pop: "76k ($63,539)", aff: 76.2, acc: 56.2, value: "$279,500 (4.40x)", denial: 10.4, units: 0.91 }
    ]
  },
  {
    id: "kings-midland",
    target: "Kings County, CA",
    reference: "Midland County, TX",
    divergence_axis: "affordability",
    urbanicity: "rural",
    market_regime: "extractive",
    category_tag: "Rural · Ag & Energy",
    aff_score: 81.8,
    acc_score: 53.6,
    peer_aff_score: 39.7,
    peer_acc_score: 35.9,
    factor_preview: "4.45x vs. 3.12x price-to-income · Agricultural worker housing shortage & water/permitting limits",
    summary: "Agricultural and energy-producing counties (~153k–171k population) benchmarked together to control for commodity employment cycles.",
    base_ratings: {
      potential: 4.1,
      capacity: 3.6,
      feasibility: 3.5,
      evidence: 3.9
    },
    rubric_notes: {
      potential: "Pairing LIHTC debt with California's Farmworker Housing Grant directly builds permanent affordable family units.",
      alignment: "Reflects how many of Kings County's local divergence barriers are directly matched by active programs in your catalog.",
      capacity: "Manageable through experienced Central Valley nonprofit housing sponsors.",
      feasibility: "High CRA impact in California's Central Valley, subject to local water/infrastructure approvals.",
      evidence: "Backed by California HCD regional housing needs determinations and ACS/HMDA records."
    },
    sources: ["capital", "cdb"],
    factors: [
      {
        title: "Agricultural Worker Housing Shortage & Infrastructure Gaps",
        metrics: "0.88 vs. 1.26 Affordable Units / LMI HH · 81.8 vs. 39.7 Burden",
        why: "Central Valley water/sewer infrastructure limits and state permitting costs restrict starter home construction in Kings County.",
        local_program: "California HCD Joe Serna, Jr. Farmworker Housing Grant (FWHG)",
        local_desc: "State grants financing new construction and rehabilitation of owner and rental housing for agricultural workers.",
        required_tag: "supply-lihtc",
        action: "Pair Affordable Housing & LIHTC Multifamily Finance with California's Farmworker Housing Grant to build permanent affordable family units.",
        suggested_template: "small_dollar"
      }
    ],
    peers: [
      { name: "Midland County, TX", form: "68% Suburban · 20% Urban · 12% Rural", pop: "171k ($93,984)", aff: 39.7, acc: 35.9, value: "$293,000 (3.12x)", denial: 24.2, units: 1.26 },
      { name: "Kings County, CA", form: "62% Suburban · 23% Urban · 15% Rural", pop: "153k ($68,750)", aff: 81.8, acc: 53.6, value: "$305,700 (4.45x)", denial: 11.8, units: 0.88 }
    ]
  }
];
