/* POFRI MCM: exact user-provided disease-specific levels. Level 4 is a review trigger, never an automatic fitness decision. */
window.POFRI_MEDICAL_LIBRARY = [
  {
    "category": "Respiratory",
    "label": "أمراض الجهاز التنفسي",
    "diseases": [
      {
        "name": "Asthma",
        "levels": [
          "None",
          "Controlled",
          "Frequent Exacerbations",
          "Severe Uncontrolled"
        ]
      },
      {
        "name": "COPD",
        "levels": [
          "None",
          "Mild",
          "Moderate/Severe",
          "Acute Exacerbation"
        ]
      },
      {
        "name": "OSA",
        "levels": [
          "None",
          "Controlled",
          "Persistent Symptoms",
          "Severe Uncontrolled"
        ]
      },
      {
        "name": "Restrictive Lung Disease",
        "levels": [
          "None",
          "Mild",
          "Significant",
          "Severe Hypoxemia"
        ]
      },
      {
        "name": "Pulmonary Hypertension",
        "levels": [
          "None",
          "Mild/stable",
          "Significant",
          "Decompensated"
        ]
      },
      {
        "name": "Previous TB",
        "levels": [
          "None",
          "Cured",
          "Residual Impairment",
          "Active/Severe"
        ]
      }
    ]
  },
  {
    "category": "Neurological",
    "label": "الأمراض العصبية",
    "diseases": [
      {
        "name": "Migraine",
        "levels": [
          "None",
          "Controlled",
          "Frequent/Disabling",
          "Severe Acute"
        ]
      },
      {
        "name": "Epilepsy",
        "levels": [
          "None",
          "Long-Term Controlled",
          "Recent Activity",
          "Uncontrolled/Recent Seizure"
        ]
      },
      {
        "name": "Syncope",
        "levels": [
          "None",
          "Explained Remote",
          "Recurrent",
          "Unexplained Recent"
        ]
      },
      {
        "name": "MS",
        "levels": [
          "None",
          "Stable",
          "Functional Impairment",
          "Acute Relapse"
        ]
      },
      {
        "name": "Parkinson's",
        "levels": [
          "None",
          "Very Mild",
          "Functional Impact",
          "Significant Impairment"
        ]
      },
      {
        "name": "Neuropathy",
        "levels": [
          "None",
          "Mild",
          "Balance/Sensation Affected",
          "Unsafe Mobility"
        ]
      },
      {
        "name": "Vertigo",
        "levels": [
          "None",
          "Rare",
          "Recurrent",
          "Severe/Unpredictable"
        ]
      },
      {
        "name": "TIA/stroke",
        "levels": [
          "None",
          "Fully Recovered",
          "Residual Deficit",
          "Recent/Unstable"
        ]
      }
    ]
  },
  {
    "category": "Cardiovascular",
    "label": "أمراض القلب والأوعية الدموية",
    "diseases": [
      {
        "name": "Hypertension",
        "levels": [
          "None",
          "Controlled",
          "Uncontrolled",
          "Severe + Complications"
        ]
      },
      {
        "name": "CAD",
        "levels": [
          "None",
          "Asymptomatic",
          "Symptomatic+ Stable",
          "ACS/Unstable Angina"
        ]
      },
      {
        "name": "Previous MI",
        "levels": [
          "None",
          "Remote + Stable",
          "Recent & Stable",
          "Recent Unstable"
        ]
      },
      {
        "name": "Heart Failure",
        "levels": [
          "None",
          "Mild/Stable",
          "Moderate",
          "Decompensated"
        ]
      },
      {
        "name": "Arrhythmia",
        "levels": [
          "None",
          "Stable/ Benign",
          "Significant but controlled",
          "Symptomatic/Unstable"
        ]
      },
      {
        "name": "Valvular Disease",
        "levels": [
          "None",
          "Mild",
          "Moderate/Severe Stable",
          "Severe Symptomatic"
        ]
      },
      {
        "name": "Cardiomyopathy",
        "levels": [
          "None",
          "Mild/Stable",
          "Significant",
          "Unstable"
        ]
      },
      {
        "name": "Peripheral Vascular Disease",
        "levels": [
          "None",
          "Mild",
          "Significant Limitation",
          "Acute Ischemia"
        ]
      }
    ]
  },
  {
    "category": "Diabetes",
    "label": "السكري ومضاعفاته",
    "diseases": [
      {
        "name": "Type 1 Diabetes Mellitus",
        "levels": [
          "None",
          "Stable on insulin; good glycemic control",
          "Poor Control; Recurrent Hypoglycemia or Complications",
          "Severe hypoglycemia, DKA, or Hyperglycemic Emergency"
        ]
      },
      {
        "name": "Type 2 Diabetes Mellitus",
        "levels": [
          "None",
          "Controlled with Lifestyle/Oral Medication",
          "Poor control; insulin requirement with complications or significant symptoms",
          "Hyperglycemic crisis, HHS, or severe hypoglycemia"
        ]
      },
      {
        "name": "Hypoglycemia",
        "levels": [
          "None",
          "Occasional / Mild episodes",
          "Recurrent episodes or impaired awareness",
          "Severe episode requiring third-party assistance"
        ]
      },
      {
        "name": "Diabetic Neuropathy",
        "levels": [
          "None",
          "Mild sensory neuropathy",
          "Painful neuropathy, impaired sensation / balance",
          "Severe sensory/motor impairment affecting safe mobility"
        ]
      },
      {
        "name": "Diabetic Retinopathy",
        "levels": [
          "None",
          "Mild non-proliferative, stable",
          "Moderate/severe or proliferative disease, visual impairment",
          "Acute vision-threatening complication"
        ]
      },
      {
        "name": "Diabetic Nephropathy",
        "levels": [
          "None",
          "Early microalbuminuria, stable renal function",
          "Significant albuminuria or declining renal function",
          "Advanced renal failure or acute renal complication"
        ]
      },
      {
        "name": "Diabetic Foot Disease",
        "levels": [
          "None",
          "No active ulcer; stable peripheral neuropathy",
          "Active ulcer or significant peripheral vascular disease",
          "Severe infection, gangrene, or acute limb-threatening condition"
        ]
      },
      {
        "name": "Diabetic Ketoacidosis (DKA)",
        "levels": [
          "None",
          "Remote episode, fully recovered",
          "Recurrent episodes or high-risk unstable control",
          "Active DKA"
        ]
      }
    ]
  },
  {
    "category": "Renal",
    "label": "أمراض الكلى",
    "diseases": [
      {
        "name": "Chronic Kidney Disease (CKD)",
        "levels": [
          "None",
          "CKD G1–G2, stable",
          "CKD G3–G4 or progressive renal impairment",
          "CKD G5 with severe complications or unstable status"
        ]
      },
      {
        "name": "Acute Kidney Injury (AKI)",
        "levels": [
          "None",
          "Previous AKI, fully recovered",
          "Persistent or partially recovered renal impairment",
          "Active severe AKI or rapidly deteriorating renal function"
        ]
      },
      {
        "name": "Chronic Glomerulonephritis",
        "levels": [
          "None",
          "Stable, preserved renal function",
          "Persistent proteinuria, hypertension, or declining function",
          "Acute nephritic syndrome or rapidly progressive disease"
        ]
      },
      {
        "name": "Nephrotic Syndrome",
        "levels": [
          "None",
          "Remission, stable",
          "Persistent proteinuria or edema",
          "Severe active disease with thrombosis, infection, or acute complications"
        ]
      },
      {
        "name": "Renal Calculi",
        "levels": [
          "None",
          "Asymptomatic or successfully treated",
          "Recurrent symptomatic stones or obstruction",
          "Acute obstructed infected kidney or severe renal colic"
        ]
      },
      {
        "name": "Recurrent UTI",
        "levels": [
          "None",
          "Occasional, successfully treated",
          "Recurrent infections or persistent symptoms",
          "Acute pyelonephritis or urosepsis"
        ]
      },
      {
        "name": "Chronic Pyelonephritis",
        "levels": [
          "None",
          "Stable without significant impairment",
          "Recurrent infection or renal scarring with impairment",
          "Acute severe infection or sepsis"
        ]
      },
      {
        "name": "Polycystic Kidney Disease",
        "levels": [
          "None",
          "Asymptomatic, preserved function",
          "Progressive CKD, hypertension, or recurrent complications",
          "Advanced renal failure or acute major complication"
        ]
      },
      {
        "name": "Renal Replacement Therapy",
        "levels": [
          "None",
          "Stable dialysis or transplant recipient with satisfactory function",
          "Complications affecting functional capacity or treatment tolerance",
          "Dialysis-related instability, transplant rejection, or acute complications"
        ]
      }
    ]
  },
  {
    "category": "Liver",
    "label": "أمراض الكبد",
    "diseases": [
      {
        "name": "Fatty Liver Disease",
        "levels": [
          "None",
          "Simple steatosis, Stable Liver Function",
          "Steatohepatitis or significant fibrosis",
          "Decompensated advanced liver disease"
        ]
      },
      {
        "name": "Chronic Hepatitis B",
        "levels": [
          "None",
          "Inactive infection, preserved liver function",
          "Active hepatitis or significant fibrosis",
          "Severe acute exacerbation or hepatic failure"
        ]
      },
      {
        "name": "Chronic Hepatitis C",
        "levels": [
          "None",
          "Successfully treated or stable without significant impairment",
          "Active infection with significant fibrosis",
          "Severe hepatic complication or acute liver failure"
        ]
      },
      {
        "name": "Chronic Hepatitis (Other Causes)",
        "levels": [
          "None",
          "Stable, minimal biochemical abnormalities",
          "Persistent active inflammation or fibrosis",
          "Severe acute hepatitis or hepatic failure"
        ]
      },
      {
        "name": "Liver Cirrhosis",
        "levels": [
          "None",
          "Compensated cirrhosis without significant functional impairment",
          "Compensated disease with portal hypertension or significant complications",
          "Decompensated cirrhosis, encephalopathy, or variceal bleeding"
        ]
      },
      {
        "name": "Portal Hypertension",
        "levels": [
          "None",
          "Mild, stable without significant complications",
          "Significant splenomegaly, thrombocytopenia, or varices",
          "Acute variceal bleeding or severe complications"
        ]
      },
      {
        "name": "Liver Failure",
        "levels": [
          "None",
          "Previous episode, fully recovered",
          "Chronic hepatic dysfunction",
          "Acute liver failure or severe decompensation"
        ]
      },
      {
        "name": "Autoimmune Liver Disease",
        "levels": [
          "None",
          "Stable on treatment",
          "Active disease or significant fibrosis",
          "Severe acute flare or liver failure"
        ]
      },
      {
        "name": "Drug-Induced Liver Injury",
        "levels": [
          "None",
          "Resolved, normal liver function",
          "Persistent biochemical or functional impairment",
          "Severe acute liver injury or hepatic failure"
        ]
      }
    ]
  },
  {
    "category": "Hematological",
    "label": "أمراض الدم",
    "diseases": [
      {
        "name": "Iron Deficiency Anemia",
        "levels": [
          "None",
          "Mild anemia, asymptomatic",
          "Moderate/severe anemia or symptomatic",
          "Severe symptomatic anemia or cardiovascular compromise"
        ]
      },
      {
        "name": "Megaloblastic Anemia",
        "levels": [
          "None",
          "Mild, responding to treatment",
          "Persistent or symptomatic anemia",
          "Severe anemia with neurological or cardiovascular complications"
        ]
      },
      {
        "name": "Hemolytic Anemia",
        "levels": [
          "None",
          "Stable, compensated",
          "Recurrent hemolysis or significant anemia",
          "Acute hemolytic crisis"
        ]
      },
      {
        "name": "Sickle Cell Disease",
        "levels": [
          "None",
          "Stable, no recent significant crisis",
          "Recurrent vaso-occlusive crises or organ complications",
          "Acute sickle crisis, acute chest syndrome, or stroke"
        ]
      },
      {
        "name": "Thalassemia",
        "levels": [
          "None",
          "Thalassemia trait or stable mild disease",
          "Transfusion-dependent disease or significant complications",
          "Severe anemia or acute cardiac/hepatic complication"
        ]
      },
      {
        "name": "Aplastic Anemia",
        "levels": [
          "None",
          "Remission with satisfactory counts",
          "Persistent cytopenia or recurrent infections/bleeding",
          "Severe pancytopenia with life-threatening complications"
        ]
      },
      {
        "name": "Thrombocytopenia",
        "levels": [
          "None",
          "Mild, stable, no bleeding",
          "Moderate/severe thrombocytopenia or bleeding tendency",
          "Severe thrombocytopenia with active major bleeding"
        ]
      },
      {
        "name": "Coagulation Disorders",
        "levels": [
          "None",
          "Mild, controlled",
          "Significant bleeding risk or recurrent bleeding",
          "Active major bleeding or severe coagulopathy"
        ]
      },
      {
        "name": "Deep Vein Thrombosis / Pulmonary Embolism",
        "levels": [
          "None",
          "Remote event, stable on treatment",
          "Recent event or ongoing treatment with relevant restrictions",
          "Acute DVT or pulmonary embolism; hemodynamic instability"
        ]
      },
      {
        "name": "Polycythemia / Myeloproliferative Disorders",
        "levels": [
          "None",
          "Stable, controlled",
          "Persistent abnormal counts or thrombotic complications",
          "Acute thrombosis, hyperviscosity crisis, or major bleeding"
        ]
      },
      {
        "name": "Leukemia / Lymphoma",
        "levels": [
          "None",
          "Remission, stable",
          "Active disease or treatment-related impairment",
          "Acute severe complications, sepsis, or major cytopenia"
        ]
      }
    ]
  },
  {
    "category": "Psychiatric",
    "label": "الاضطرابات النفسية",
    "diseases": [
      {
        "name": "Major Depressive Disorder",
        "levels": [
          "None",
          "Mild, stable, adequately treated",
          "Moderate/severe symptoms",
          "Severe episode with suicidal intent or, psychosis"
        ]
      },
      {
        "name": "Generalized Anxiety Disorder",
        "levels": [
          "None",
          "Mild, controlled symptoms",
          "Persistent anxiety affecting performance",
          "Severe acute anxiety/panic with inability to function safely"
        ]
      },
      {
        "name": "Panic Disorder",
        "levels": [
          "None",
          "Rare, controlled attacks",
          "Recurrent attacks affecting work performance",
          "Frequent unpredictable attacks creating immediate safety concerns"
        ]
      },
      {
        "name": "Bipolar Disorder",
        "levels": [
          "None",
          "Stable euthymic state on treatment",
          "Emerging mood instability or significant functional impairment",
          "Acute mania, severe depression, or psychosis"
        ]
      },
      {
        "name": "Schizophrenia / Psychotic Disorders",
        "levels": [
          "None",
          "Stable remission, adequate functioning",
          "Residual symptoms or functional impairment",
          "Acute psychosis, severe disorganization, or immediate safety risk"
        ]
      },
      {
        "name": "Post-Traumatic Stress Disorder (PTSD)",
        "levels": [
          "None",
          "Mild, stable symptoms",
          "Significant symptoms affecting sleep, concentration, or functioning",
          "Severe acute destabilization, dissociation, or immediate safety risk"
        ]
      },
      {
        "name": "Obsessive-Compulsive Disorder",
        "levels": [
          "None",
          "Mild, controlled",
          "Compulsions or obsessions significantly affecting functioning",
          "Severe incapacitating symptoms or acute safety concerns"
        ]
      },
      {
        "name": "Adjustment Disorder",
        "levels": [
          "None",
          "Mild, resolving",
          "Persistent symptoms affecting performance",
          "Severe acute psychological destabilization"
        ]
      },
      {
        "name": "Substance Use Disorders",
        "levels": [
          "None",
          "Sustained remission",
          "Active use or relapse without immediate medical instability",
          "Acute intoxication, withdrawal, overdose, or severe behavioral disturbance"
        ]
      },
      {
        "name": "Suicidal Behavior / Self-Harm",
        "levels": [
          "None",
          "Remote history, clinically stable",
          "Current suicidal thoughts requiring urgent assessment",
          "Current intent, plan, recent attempt, or immediate danger"
        ]
      },
      {
        "name": "Cognitive Disorders",
        "levels": [
          "None",
          "Mild, stable deficits",
          "Significant impairment affecting judgment or memory",
          "Severe confusion, delirium, or inability to maintain safety"
        ]
      }
    ]
  },
  {
    "category": "Ophthalmological",
    "label": "أمراض العيون",
    "diseases": [
      {
        "name": "Refractive Errors",
        "levels": [
          "None",
          "Correctable with glasses/contact lenses",
          "Inadequately corrected visual impairment",
          "Severe uncorrectable impairment affecting essential visual tasks"
        ]
      },
      {
        "name": "Cataract",
        "levels": [
          "None",
          "Early, minimal visual impact",
          "Significant visual impairment affecting work",
          "Acute complication or severe bilateral visual impairment"
        ]
      },
      {
        "name": "Glaucoma",
        "levels": [
          "None",
          "Controlled, stable visual fields",
          "Progressive visual field loss",
          "Acute angle-closure glaucoma or sudden major vision loss"
        ]
      },
      {
        "name": "Diabetic Retinopathy",
        "levels": [
          "None",
          "Mild, stable",
          "Advanced retinopathy or significant visual impairment",
          "Acute vitreous hemorrhage or retinal detachment"
        ]
      },
      {
        "name": "Retinal Detachment",
        "levels": [
          "None",
          "Previous repair, stable vision",
          "Persistent visual deficit after treatment",
          "Acute retinal detachment"
        ]
      },
      {
        "name": "Macular Degeneration",
        "levels": [
          "None",
          "Early, stable",
          "Progressive central visual impairment",
          "Severe bilateral central visual loss"
        ]
      },
      {
        "name": "Optic Neuropathy",
        "levels": [
          "None",
          "Stable, minimal deficit",
          "Significant visual field or acuity impairment",
          "Acute optic neuropathy or sudden vision loss"
        ]
      },
      {
        "name": "Diplopia",
        "levels": [
          "None",
          "Corrected or intermittent, non-disabling",
          "Persistent diplopia affecting tasks",
          "Acute unexplained diplopia or associated neurological emergency"
        ]
      },
      {
        "name": "Corneal Diseases",
        "levels": [
          "None",
          "Mild, stable",
          "Significant opacity or recurrent inflammation",
          "Acute severe keratitis, ulceration, or vision-threatening condition"
        ]
      },
      {
        "name": "Uveitis",
        "levels": [
          "None",
          "Inactive, stable",
          "Recurrent or active inflammation",
          "Severe acute inflammation with major visual threat"
        ]
      },
      {
        "name": "Color Vision Deficiency",
        "levels": [
          "None",
          "Normal",
          "Mild/moderate deficiency affecting selected tasks",
          "Severe deficiency incompatible with a specific essential visual task"
        ]
      }
    ]
  },
  {
    "category": "ENT",
    "label": "أمراض الأنف والأذن والحنجرة والسمع والاتزان",
    "diseases": [
      {
        "name": "Sensorineural Hearing Loss",
        "levels": [
          "None",
          "Mild, stable hearing loss",
          "Moderate/severe hearing loss affecting communication or alarms",
          "Profound loss incompatible with essential safety communication, without effective accommodation"
        ]
      },
      {
        "name": "Conductive Hearing Loss",
        "levels": [
          "None",
          "Mild, treatable",
          "Persistent moderate/severe hearing impairment",
          "Severe acute loss or major functional impairment"
        ]
      },
      {
        "name": "Noise-Induced Hearing Loss",
        "levels": [
          "None",
          "Early, stable threshold shift",
          "Significant bilateral hearing loss",
          "Severe hearing impairment affecting critical warning-signal detection"
        ]
      },
      {
        "name": "Tinnitus",
        "levels": [
          "None",
          "Mild, intermittent",
          "Persistent, distressing tinnitus affecting concentration or sleep",
          "Severe incapacitating tinnitus or associated acute neurological/otological condition"
        ]
      },
      {
        "name": "Chronic Otitis Media",
        "levels": [
          "None",
          "Inactive, stable",
          "Recurrent infection or persistent discharge",
          "Acute severe infection or intracranial complication"
        ]
      },
      {
        "name": "Otitis Externa",
        "levels": [
          "None",
          "Mild, controlled",
          "Recurrent or persistent infection",
          "Severe infection with spreading inflammation or systemic complications"
        ]
      },
      {
        "name": "Chronic Rhinosinusitis",
        "levels": [
          "None",
          "Mild, controlled",
          "Persistent symptoms affecting sleep or function",
          "Severe acute infection with orbital or intracranial complications"
        ]
      },
      {
        "name": "Obstructive Nasal Disorders",
        "levels": [
          "None",
          "Mild, controlled",
          "Significant obstruction or impaired sleep",
          "Severe acute airway compromise"
        ]
      },
      {
        "name": "Ménière's Disease",
        "levels": [
          "None",
          "Stable, rare episodes",
          "Recurrent vertigo or hearing fluctuation",
          "Severe unpredictable vertigo or acute disabling episode"
        ]
      },
      {
        "name": "Benign Paroxysmal Positional Vertigo (BPPV)",
        "levels": [
          "None",
          "Treated, rare residual symptoms",
          "Recurrent episodes affecting balance",
          "Active severe vertigo with unsafe mobility"
        ]
      },
      {
        "name": "Vestibular Neuritis / Labyrinthitis",
        "levels": [
          "None",
          "Fully recovered or mild residual symptoms",
          "Persistent imbalance or recurrent symptoms",
          "Acute severe vertigo, inability to walk safely, or neurological red flags"
        ]
      },
      {
        "name": "Balance Disorders",
        "levels": [
          "None",
          "Mild, compensated",
          "Significant gait or balance impairment",
          "Severe instability or recurrent falls"
        ]
      }
    ]
  },
  {
    "category": "Musculoskeletal",
    "label": "أمراض الجهاز العضلي الهيكلي والعظام",
    "diseases": [
      {
        "name": "Chronic Low Back Pain",
        "levels": [
          "None",
          "Mild, controlled, no functional limitation",
          "Persistent pain with restricted mobility or work capacity",
          "Acute severe pain with neurological deficit or cauda equina red flags"
        ]
      },
      {
        "name": "Lumbar Disc Herniation",
        "levels": [
          "None",
          "Stable, mild symptoms",
          "Radiculopathy or functional limitation",
          "Progressive motor deficit or cauda equina syndrome"
        ]
      },
      {
        "name": "Cervical Spondylosis",
        "levels": [
          "None",
          "Mild, stable",
          "Persistent pain, restricted neck movement, or radiculopathy",
          "Cervical myelopathy or acute neurological deficit"
        ]
      },
      {
        "name": "Osteoarthritis",
        "levels": [
          "None",
          "Mild, controlled",
          "Significant pain or restricted joint movement",
          "Severe functional impairment or acute joint complication"
        ]
      },
      {
        "name": "Rheumatoid Arthritis",
        "levels": [
          "None",
          "Controlled, low disease activity",
          "Active disease, joint deformity, or functional limitation",
          "Severe flare or systemic complications"
        ]
      },
      {
        "name": "Ankylosing Spondylitis",
        "levels": [
          "None",
          "Stable, mild restriction",
          "Significant spinal stiffness or mobility impairment",
          "Acute severe flare or major spinal/neurological complication"
        ]
      },
      {
        "name": "Shoulder Disorders / Rotator Cuff Disease",
        "levels": [
          "None",
          "Mild, full functional capacity",
          "Restricted movement or reduced lifting capacity",
          "Acute major tendon rupture or severe functional loss"
        ]
      },
      {
        "name": "Knee Disorders / Meniscal Injury",
        "levels": [
          "None",
          "Mild, stable",
          "Pain, instability, or restricted mobility",
          "Acute locked knee or severe instability affecting safe movement"
        ]
      },
      {
        "name": "Fractures",
        "levels": [
          "None",
          "Fully healed",
          "Incomplete healing or residual functional limitation",
          "Acute fracture or unstable injury"
        ]
      },
      {
        "name": "Osteoporosis",
        "levels": [
          "None",
          "Stable, no significant fractures",
          "Severe osteoporosis or fragility fracture history affecting function",
          "Acute vertebral/hip fracture or major complications"
        ]
      },
      {
        "name": "Tendinopathy / Bursitis",
        "levels": [
          "None",
          "Mild, controlled",
          "Persistent pain limiting repetitive or forceful tasks",
          "Acute severe impairment or rupture"
        ]
      },
      {
        "name": "Amputation / Limb Loss",
        "levels": [
          "None",
          "Fully rehabilitated, adequate prosthetic function",
          "Functional limitation affecting specific job tasks",
          "Acute complication or inability to perform essential safety tasks"
        ]
      },
      {
        "name": "Chronic Musculoskeletal Disability",
        "levels": [
          "None",
          "Minimal functional limitation",
          "Significant restriction in strength, mobility, or endurance",
          "Severe inability to mobilize or perform essential tasks safely"
        ]
      }
    ]
  },
  {
    "category": "Infectious",
    "label": "الأمراض المعدية",
    "diseases": [
      {
        "name": "Tuberculosis (TB)",
        "levels": [
          "None",
          "Latent TB infection, no active disease",
          "Active TB under treatment, clinically stable but requiring infection-control assessment",
          "Severe active TB or associated respiratory/systemic instability"
        ]
      },
      {
        "name": "Hepatitis A",
        "levels": [
          "None",
          "Fully recovered",
          "Ongoing symptomatic infection",
          "Severe acute hepatitis or hepatic failure"
        ]
      },
      {
        "name": "Hepatitis B",
        "levels": [
          "None",
          "Inactive chronic infection",
          "Active infection with significant hepatic disease",
          "Severe acute exacerbation or hepatic failure"
        ]
      },
      {
        "name": "Hepatitis C",
        "levels": [
          "None",
          "Successfully treated",
          "Active infection with significant liver impairment",
          "Severe hepatic complications"
        ]
      },
      {
        "name": "HIV Infection",
        "levels": [
          "None",
          "Stable on ART, good immune status",
          "Advanced disease or opportunistic infection",
          "AIDS-related acute severe illness or life-threatening opportunistic infection"
        ]
      },
      {
        "name": "Influenza",
        "levels": [
          "None",
          "Fully recovered",
          "Active symptomatic infection affecting work capacity",
          "Severe influenza with respiratory failure or systemic complications"
        ]
      },
      {
        "name": "COVID-19",
        "levels": [
          "None",
          "Fully recovered",
          "Active symptomatic infection or persistent functional impairment",
          "Severe acute infection with hypoxia or respiratory failure"
        ]
      },
      {
        "name": "Brucellosis",
        "levels": [
          "None",
          "Fully recovered",
          "Persistent or recurrent symptomatic infection",
          "Severe systemic disease, endocarditis, or neurological involvement"
        ]
      },
      {
        "name": "Malaria",
        "levels": [
          "None",
          "Fully recovered",
          "Active uncomplicated malaria under treatment",
          "Severe malaria, cerebral involvement, or organ failure"
        ]
      },
      {
        "name": "Dengue Fever",
        "levels": [
          "None",
          "Fully recovered",
          "Active uncomplicated disease requiring medical follow-up",
          "Severe dengue, shock, or major bleeding"
        ]
      },
      {
        "name": "Sepsis",
        "levels": [
          "None",
          "Fully recovered",
          "Recent sepsis with residual organ impairment",
          "Active sepsis or septic shock"
        ]
      },
      {
        "name": "Skin and Soft Tissue Infections",
        "levels": [
          "None",
          "Mild, localized, treated",
          "Extensive infection or recurrent disease",
          "Necrotizing infection or systemic toxicity"
        ]
      },
      {
        "name": "Gastrointestinal Infections",
        "levels": [
          "None",
          "Fully recovered",
          "Active diarrhea/vomiting or dehydration",
          "Severe dehydration, shock, or systemic infection"
        ]
      },
      {
        "name": "Meningitis / Encephalitis",
        "levels": [
          "None",
          "Fully recovered without significant deficit",
          "Residual neurological impairment",
          "Acute meningitis or encephalitis"
        ]
      },
      {
        "name": "Scabies / Contagious Skin Diseases",
        "levels": [
          "None",
          "Successfully treated",
          "Active infection requiring isolation or treatment measures",
          "Severe disseminated infection or associated systemic complications"
        ]
      }
    ]
  },
  {
    "category": "Cancer",
    "label": "الأورام السرطانية",
    "diseases": [
      {
        "name": "Breast Cancer",
        "levels": [
          "None",
          "Remission, stable follow-up",
          "Active treatment or residual functional impairment",
          "Progressive disease with severe complications"
        ]
      },
      {
        "name": "Lung Cancer",
        "levels": [
          "None",
          "Remission, stable respiratory function",
          "Active disease or treatment-related impairment",
          "Advanced symptomatic disease, respiratory compromise, or acute complications"
        ]
      },
      {
        "name": "Colorectal Cancer",
        "levels": [
          "None",
          "Remission, stable function",
          "Active treatment, stoma-related limitations, or residual impairment",
          "Obstruction, perforation, severe bleeding, or systemic complications"
        ]
      },
      {
        "name": "Prostate Cancer",
        "levels": [
          "None",
          "Stable localized disease under surveillance or controlled treatment",
          "Active treatment or significant urinary complications",
          "Advanced disease with severe complications or spinal cord compression"
        ]
      },
      {
        "name": "Hematological Malignancies",
        "levels": [
          "None",
          "Complete remission, stable counts",
          "Active disease or treatment-related cytopenias",
          "Acute leukemia complications, severe cytopenia, or sepsis"
        ]
      },
      {
        "name": "Brain / CNS Tumors",
        "levels": [
          "None",
          "Stable after treatment, no significant deficit",
          "Residual neurological impairment or active treatment",
          "Raised intracranial pressure, seizures, or acute neurological deterioration"
        ]
      },
      {
        "name": "Liver Cancer",
        "levels": [
          "None",
          "Stable after treatment, preserved liver function",
          "Active disease or treatment-related impairment",
          "Advanced disease with liver failure or severe complications"
        ]
      },
      {
        "name": "Kidney Cancer",
        "levels": [
          "None",
          "Treated, stable renal function",
          "Active disease or postoperative functional impairment",
          "Advanced disease with severe systemic complications"
        ]
      },
      {
        "name": "Skin Cancer / Melanoma",
        "levels": [
          "None",
          "Successfully treated, no evidence of disease",
          "Active disease requiring treatment",
          "Advanced metastatic disease with severe complications"
        ]
      },
      {
        "name": "Thyroid Cancer",
        "levels": [
          "None",
          "Successfully treated, stable",
          "Active disease or significant treatment complications",
          "Severe systemic or compressive complications"
        ]
      },
      {
        "name": "Bone / Soft Tissue Sarcoma",
        "levels": [
          "None",
          "Remission, adequate mobility",
          "Active treatment or mobility impairment",
          "Severe progressive disease, pathological fracture, or major complications"
        ]
      },
      {
        "name": "Metastatic Cancer",
        "levels": [
          "None",
          "No evidence of active metastatic disease",
          "Stable metastatic disease under treatment",
          "Progressive metastatic disease with severe symptoms or organ compromise"
        ]
      },
      {
        "name": "Cancer Treatment-Related Complications",
        "levels": [
          "None",
          "Minimal residual effects",
          "Significant fatigue, neuropathy, cytopenia, or immunosuppression",
          "Severe treatment toxicity, febrile neutropenia, or acute organ injury"
        ]
      }
    ]
  },
  {
    "category": "Sleep",
    "label": "اضطرابات النوم",
    "diseases": [
      {
        "name": "Obstructive Sleep Apnea (OSA)",
        "levels": [
          "None",
          "Mild or adequately treated OSA with good control",
          "Moderate/severe OSA with inadequate treatment or significant daytime symptoms",
          "Severe uncontrolled OSA with dangerous sleepiness or recurrent safety-critical events"
        ]
      },
      {
        "name": "Insomnia Disorder",
        "levels": [
          "None",
          "Mild, controlled symptoms",
          "Persistent insomnia with significant daytime impairment",
          "Severe sleep deprivation causing inability to maintain safe performance"
        ]
      },
      {
        "name": "Narcolepsy",
        "levels": [
          "None",
          "Stable, adequately treated with no safety-critical symptoms",
          "Persistent excessive daytime sleepiness or breakthrough symptoms",
          "Uncontrolled sleep attacks or cataplexy creating immediate safety risk"
        ]
      },
      {
        "name": "Shift Work Sleep Disorder",
        "levels": [
          "None",
          "Adapted, minimal symptoms",
          "Persistent fatigue, insomnia, or excessive sleepiness",
          "Severe sleepiness with episodes of involuntary sleep during safety-critical activities"
        ]
      },
      {
        "name": "Restless Legs Syndrome",
        "levels": [
          "None",
          "Mild, controlled",
          "Significant sleep disruption and daytime fatigue",
          "Severe symptoms with major functional impairment"
        ]
      },
      {
        "name": "Periodic Limb Movement Disorder",
        "levels": [
          "None",
          "Mild, stable",
          "Significant sleep fragmentation and daytime impairment",
          "Severe sleep disruption with inability to function safely"
        ]
      },
      {
        "name": "Central Sleep Apnea",
        "levels": [
          "None",
          "Stable, adequately treated",
          "Persistent disease or inadequate treatment",
          "Severe respiratory instability or significant nocturnal hypoxemia"
        ]
      },
      {
        "name": "Hypersomnia / Idiopathic Hypersomnia",
        "levels": [
          "None",
          "Controlled, minimal symptoms",
          "Persistent excessive sleepiness",
          "Severe uncontrollable sleep episodes affecting safety"
        ]
      },
      {
        "name": "Parasomnias",
        "levels": [
          "None",
          "Rare, benign episodes",
          "Recurrent episodes causing injury risk or significant sleep disruption",
          "Violent or dangerous episodes posing immediate risk to self or others"
        ]
      },
      {
        "name": "Chronic Sleep Deprivation",
        "levels": [
          "None",
          "Adequate sleep, no significant fatigue",
          "Persistent sleep restriction with impaired alertness",
          "Severe sleep deprivation with microsleeps or impaired judgment"
        ]
      }
    ]
  }
];
