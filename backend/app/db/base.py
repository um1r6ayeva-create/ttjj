# app/db/base.py
# Import all models here so that Base.metadata has them registered
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa
from app.models.role import Role  # noqa
from app.models.duty import Duty  # noqa
from app.models.duty_report import DutyReport  # noqa
from app.models.report_photo import ReportPhoto  # noqa
from app.models.global_duty import GlobalDuty  # noqa
from app.models.global_duty_report import GlobalDutyReport, GlobalReportPhoto  # noqa
from app.models.application import Application  # noqa
from app.models.news import News  # noqa
