from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.session import Base

class Site(Base):
    __tablename__ = "sites"

    site_id = Column(String, primary_key=True, index=True)
    site_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    principal_investigator = Column(String, nullable=False)
    total_patients = Column(Integer, default=0)
    total_visits = Column(Integer, default=0)
    total_deviations = Column(Integer, default=0)
    major_deviations = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Low") # Low, Medium, High, Critical
    risk_factors = Column(Text, default="[]") # JSON string
    trend = Column(String, default="Stable") # Increasing, Decreasing, Stable

    patients = relationship("Patient", back_populates="site", cascade="all, delete-orphan")
    visits = relationship("Visit", back_populates="site", cascade="all, delete-orphan")
    deviations = relationship("Deviation", back_populates="site", cascade="all, delete-orphan")
    capa_reports = relationship("CAPAReport", back_populates="site", cascade="all, delete-orphan")


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(String, primary_key=True, index=True)
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    patient_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    enrolled_date = Column(String, nullable=False)
    status = Column(String, default="Active")

    site = relationship("Site", back_populates="patients")
    visits = relationship("Visit", back_populates="patient", cascade="all, delete-orphan")
    deviations = relationship("Deviation", back_populates="patient", cascade="all, delete-orphan")


class Visit(Base):
    __tablename__ = "visits"

    visit_id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    visit_name = Column(String, nullable=False)
    expected_visit_date = Column(String, nullable=False)
    actual_visit_date = Column(String, nullable=True)
    dose_expected = Column(String, nullable=True)
    dose_actual = Column(String, nullable=True)
    medication = Column(String, nullable=True)
    prohibited_medication = Column(String, nullable=True)
    lab_required = Column(Boolean, default=False)
    lab_completed = Column(Boolean, default=False)
    lab_results = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="Completed") # Completed, Missed, Pending

    site = relationship("Site", back_populates="visits")
    patient = relationship("Patient", back_populates="visits")
    deviations = relationship("Deviation", back_populates="visit", cascade="all, delete-orphan")


class Deviation(Base):
    __tablename__ = "deviations"

    deviation_id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False)
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    visit_id = Column(String, ForeignKey("visits.visit_id"), nullable=False)
    deviation_type = Column(String, nullable=False) # Missed Visit, Late Visit, Incorrect Dose, Prohibited Medication, Missing Required Lab, Other Rule Violation
    expected_value = Column(String, nullable=False)
    actual_value = Column(String, nullable=False)
    severity = Column(String, nullable=False) # Major, Minor, Administrative
    date = Column(String, nullable=False)
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    status = Column(String, default="Open") # Open, Under Review, CAPA Generated, Closed

    site = relationship("Site", back_populates="deviations")
    patient = relationship("Patient", back_populates="deviations")
    visit = relationship("Visit", back_populates="deviations")


class CAPAReport(Base):
    __tablename__ = "capa_reports"

    report_id = Column(String, primary_key=True, index=True)
    site_id = Column(String, ForeignKey("sites.site_id"), nullable=False)
    deviation_id = Column(String, ForeignKey("deviations.deviation_id"), nullable=True)
    issue_summary = Column(Text, nullable=False)
    observations = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=False)
    corrective_action = Column(Text, nullable=False)
    preventive_action = Column(Text, nullable=False)
    priority = Column(String, nullable=False) # Critical, High, Medium, Low
    responsible_role = Column(String, nullable=False)
    followup_recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="capa_reports")
