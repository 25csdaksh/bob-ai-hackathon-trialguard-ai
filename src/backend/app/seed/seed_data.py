import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.domain import Site, Patient, Visit, Deviation, CAPAReport
from ..database.session import Base, engine, SessionLocal

SITES_DATA = [
    {
        "site_id": "SITE-001",
        "site_name": "Apex Medical Center",
        "location": "Boston, MA",
        "principal_investigator": "Dr. Sarah Jenkins",
    },
    {
        "site_id": "SITE-002",
        "site_name": "Beacon Health Institute",
        "location": "Chicago, IL",
        "principal_investigator": "Dr. Marcus Vance",
    },
    {
        "site_id": "SITE-003",
        "site_name": "Crestview Research Hospital",
        "location": "Houston, TX",
        "principal_investigator": "Dr. Robert Sterling",
    },
    {
        "site_id": "SITE-004",
        "site_name": "Delta Clinical Center",
        "location": "San Francisco, CA",
        "principal_investigator": "Dr. Elena Rostova",
    },
    {
        "site_id": "SITE-005",
        "site_name": "Evergreen Health System",
        "location": "Seattle, WA",
        "principal_investigator": "Dr. David Kim",
    },
]

PROHIBITED_MEDS = ["Aspirin (>325mg)", "Ketoconazole", "Warfarin", "Rifampin", "St. John's Wort"]
STANDARD_MEDS = ["TrialDrug-A 50mg", "TrialDrug-A 100mg", "Placebo", "Standard Care Vector"]

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Site).first():
        print("Database already seeded.")
        return

    Base.metadata.create_all(bind=engine)

    start_date = datetime.now() - timedelta(days=120)

    all_sites = []
    all_patients = []
    all_visits = []
    all_deviations = []

    for s_idx, site_info in enumerate(SITES_DATA):
        site_id = site_info["site_id"]
        site = Site(
            site_id=site_id,
            site_name=site_info["site_name"],
            location=site_info["location"],
            principal_investigator=site_info["principal_investigator"],
            total_patients=10,
            total_visits=50,
            total_deviations=0,
            major_deviations=0,
            risk_score=0.0,
            risk_level="Low",
            risk_factors=json.dumps([]),
            trend="Stable"
        )
        db.add(site)
        all_sites.append(site)

        # Create 10 patients per site
        for p_idx in range(1, 11):
            patient_id = f"PAT-{site_id.split('-')[1]}-{p_idx:03d}"
            patient_name = f"Subject {site_id.split('-')[1]}-{p_idx:02d}"
            age = random.randint(28, 72)
            gender = "Female" if p_idx % 2 == 0 else "Male"
            enrolled = (start_date + timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d")

            patient = Patient(
                patient_id=patient_id,
                site_id=site_id,
                patient_name=patient_name,
                age=age,
                gender=gender,
                enrolled_date=enrolled,
                status="Active"
            )
            db.add(patient)
            all_patients.append(patient)

            # Create 5 visits per patient (Screening, Visit 1, Visit 2, Visit 3, Follow-up)
            visit_names = ["Screening (Day -7)", "Visit 1 (Day 1)", "Visit 2 (Day 14)", "Visit 3 (Day 28)", "Follow-up (Day 60)"]
            day_offsets = [-7, 1, 14, 28, 60]

            for v_idx, v_name in enumerate(visit_names):
                v_id = f"VIS-{patient_id}-{v_idx+1}"
                base_dt = datetime.strptime(enrolled, "%Y-%m-%d") + timedelta(days=day_offsets[v_idx])
                exp_date = base_dt.strftime("%Y-%m-%d")

                # Default compliant parameters
                act_date = exp_date
                dose_exp = "100 mg"
                dose_act = "100 mg"
                med = "TrialDrug-A 100mg"
                prohibited = None
                lab_req = True
                lab_comp = True
                lab_res = "Normal Range (ALT: 22 U/L, AST: 19 U/L)"
                v_status = "Completed"
                notes = "Routine visit completed according to clinical protocol guidelines."

                # Introduce intentional deviations based on site risk profiles
                # Site C (SITE-003) is HIGH RISK (many major/minor deviations)
                # Site B & E have moderate deviations
                # Site A & D have minimal/no deviations

                has_dev = False
                dev_type = None
                dev_sev = None
                dev_exp = ""
                dev_act = ""
                dev_expl = ""
                dev_rec = ""

                if site_id == "SITE-003":  # High risk site
                    rand_val = random.random()
                    if v_idx == 4 and rand_val < 0.6:  # Missed visit
                        v_status = "Missed"
                        act_date = None
                        lab_comp = False
                        has_dev = True
                        dev_type = "Missed Visit"
                        dev_sev = "Major"
                        dev_exp = f"Visit scheduled on {exp_date}"
                        dev_act = "Patient did not show up; no actual visit date recorded"
                        dev_expl = "Patient missed required Day 60 safety follow-up visit without prior notification."
                        dev_rec = "Contact patient immediately to reschedule safety assessment and issue protocol compliance reminder."
                    elif v_idx == 2 and rand_val < 0.5:  # Incorrect dose
                        dose_act = "200 mg"
                        has_dev = True
                        dev_type = "Incorrect Dose"
                        dev_sev = "Major"
                        dev_exp = "100 mg orally once daily"
                        dev_act = "200 mg administered due to pharmacy dispensing error"
                        dev_expl = "Patient administered double the protocol-specified dosage of investigational drug."
                        dev_rec = "Perform immediate liver function tests (LFT) and monitor patient for adverse events; notify IRB."
                    elif v_idx == 3 and rand_val < 0.5:  # Prohibited medication
                        prohibited = "Warfarin 5mg"
                        has_dev = True
                        dev_type = "Prohibited Medication"
                        dev_sev = "Major"
                        dev_exp = "No concomitant anticoagulant therapy"
                        dev_act = "Patient initiated Warfarin 5mg daily prescribed by primary physician"
                        dev_expl = "Patient concomitantly took Warfarin, which is explicitly prohibited in Section 5.3 of Protocol."
                        dev_rec = "Review drug-drug interaction risk, consult Principal Investigator regarding patient retention eligibility."
                    elif v_idx == 1 and rand_val < 0.7:  # Late visit
                        late_dt = base_dt + timedelta(days=12)  # 12 days late (> window)
                        act_date = late_dt.strftime("%Y-%m-%d")
                        has_dev = True
                        dev_type = "Late Visit"
                        dev_sev = "Minor"
                        dev_exp = f"Visit window: {exp_date} ± 3 days"
                        dev_act = f"Visit conducted on {act_date} (9 days past window)"
                        dev_expl = "Visit completed outside allowed protocol window due to site scheduling conflicts."
                        dev_rec = "Implement automated patient visit reminder system at site level."
                    elif lab_req and rand_val < 0.4:  # Missing lab
                        lab_comp = False
                        lab_res = "Blood chemistry panel not performed"
                        has_dev = True
                        dev_type = "Missing Required Lab"
                        dev_sev = "Minor"
                        dev_exp = "Mandatory Day 14 safety blood panel"
                        dev_act = "Laboratory sample collection omitted by clinical staff"
                        dev_expl = "Required protocol safety laboratory blood draw was omitted during visit procedure."
                        dev_rec = "Re-train site clinical trial coordinators on mandatory visit checklist items."

                elif site_id in ["SITE-002", "SITE-005"]:  # Medium risk sites
                    rand_val = random.random()
                    if v_idx == 3 and rand_val < 0.35:
                        late_dt = base_dt + timedelta(days=6)
                        act_date = late_dt.strftime("%Y-%m-%d")
                        has_dev = True
                        dev_type = "Late Visit"
                        dev_sev = "Minor"
                        dev_exp = f"Expected on {exp_date} ± 2 days"
                        dev_act = f"Completed on {act_date}"
                        dev_expl = "Patient visit delayed by 4 days due to personal travel."
                        dev_rec = "Re-assess visit scheduling flexibility with patient."
                    elif v_idx == 2 and rand_val < 0.25:
                        lab_comp = False
                        has_dev = True
                        dev_type = "Missing Required Lab"
                        dev_sev = "Administrative"
                        dev_exp = "Urinanalysis completion"
                        dev_act = "Sample corrupted in transport"
                        dev_expl = "Urinanalysis specimen corrupted prior to laboratory analysis."
                        dev_rec = "Request repeat specimen collection at next scheduled contact."

                elif site_id == "SITE-001" and p_idx == 1 and v_idx == 3:  # Isolated minor deviation
                    late_dt = base_dt + timedelta(days=5)
                    act_date = late_dt.strftime("%Y-%m-%d")
                    has_dev = True
                    dev_type = "Late Visit"
                    dev_sev = "Administrative"
                    dev_exp = f"Expected on {exp_date}"
                    dev_act = f"Completed on {act_date}"
                    dev_expl = "Minor visit delay due to weather disruption."
                    dev_rec = "Document weather event in trial master file."

                visit = Visit(
                    visit_id=v_id,
                    patient_id=patient_id,
                    site_id=site_id,
                    visit_name=v_name,
                    expected_visit_date=exp_date,
                    actual_visit_date=act_date,
                    dose_expected=dose_exp,
                    dose_actual=dose_act,
                    medication=med,
                    prohibited_medication=prohibited,
                    lab_required=lab_req,
                    lab_completed=lab_comp,
                    lab_results=lab_res,
                    notes=notes,
                    status=v_status
                )
                db.add(visit)
                all_visits.append(visit)

                if has_dev:
                    dev_id = f"DEV-{site_id.split('-')[1]}-{len(all_deviations)+1:03d}"
                    dev_date = act_date if act_date else exp_date

                    deviation = Deviation(
                        deviation_id=dev_id,
                        patient_id=patient_id,
                        site_id=site_id,
                        visit_id=v_id,
                        deviation_type=dev_type,
                        expected_value=dev_exp,
                        actual_value=dev_act,
                        severity=dev_sev,
                        date=dev_date,
                        explanation=dev_expl,
                        recommended_action=dev_rec,
                        status="Open"
                    )
                    db.add(deviation)
                    all_deviations.append(deviation)

    db.commit()
    print(f"Seed data created successfully! Sites: {len(all_sites)}, Patients: {len(all_patients)}, Visits: {len(all_visits)}, Deviations: {len(all_deviations)}")
