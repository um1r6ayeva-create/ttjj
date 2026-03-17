import os
import uuid
from fastapi import UploadFile
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOADS_ROOT = os.path.join(BASE_DIR, "uploads")
APPLICATIONS_DIR = os.path.join(UPLOADS_ROOT, "applications")


def save_uploaded_file(file: UploadFile) -> tuple[str, str]:
    """
    Сохраняет файл в:
    uploads/applications/YYYY/MM/uuid.ext

    Возвращает:
    (
      "applications/YYYY/MM/uuid.ext",  # relative_path для БД
      original_filename
    )
    """
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"

    now = datetime.now()
    relative_dir = os.path.join(
        "applications",
        str(now.year),
        f"{now.month:02d}"
    )

    abs_dir = os.path.join(UPLOADS_ROOT, relative_dir)
    os.makedirs(abs_dir, exist_ok=True)

    abs_path = os.path.join(abs_dir, filename)

    with open(abs_path, "wb") as buffer:
        buffer.write(file.file.read())

    relative_path = os.path.join(relative_dir, filename).replace("\\", "/")

    return relative_path, file.filename


def delete_file(relative_path: str) -> bool:
    """
    Удаляет файл по относительному пути из БД
    """
    try:
        abs_path = os.path.join(UPLOADS_ROOT, relative_path)
        if os.path.exists(abs_path):
            os.remove(abs_path)
            return True
    except Exception:
        pass
    return False
