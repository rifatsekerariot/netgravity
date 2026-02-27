from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from backend.database import Device, Template, LogEntry, engine, create_db_and_tables, get_session
from backend.security import encrypt_password
from backend.engine import execute_config_on_device
import uvicorn

app = FastAPI(title="NetGravity API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- Device Routes ---

@app.post("/devices/", response_model=Device)
def create_device(device: Device, session: Session = Depends(get_session)):
    # Encrypt password before saving
    device.encrypted_password = encrypt_password(device.encrypted_password)
    session.add(device)
    session.commit()
    session.refresh(device)
    return device

@app.get("/devices/", response_model=List[Device])
def read_devices(session: Session = Depends(get_session)):
    devices = session.exec(select(Device)).all()
    return devices

@app.put("/devices/{device_id}", response_model=Device)
def update_device(device_id: int, updated_device: Device, session: Session = Depends(get_session)):
    db_device = session.get(Device, device_id)
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device_data = updated_device.dict(exclude_unset=True)
    for key, value in device_data.items():
        if key == "encrypted_password" and value and value != db_device.encrypted_password:
             setattr(db_device, key, encrypt_password(value))
        elif key != "id":
             setattr(db_device, key, value)
            
    session.add(db_device)
    session.commit()
    session.refresh(db_device)
    return db_device


# --- Template Routes ---

@app.post("/templates/", response_model=Template)
def create_template(template: Template, session: Session = Depends(get_session)):
    session.add(template)
    session.commit()
    session.refresh(template)
    return template

@app.get("/templates/", response_model=List[Template])
def read_templates(session: Session = Depends(get_session)):
    return session.exec(select(Template)).all()

# --- Execution Route ---

@app.post("/execute/{device_id}/{template_id}")
async def execute_config(device_id: int, template_id: int, session: Session = Depends(get_session)):
    device = session.get(Device, device_id)
    template = session.get(Template, template_id)
    
    if not device or not template:
        raise HTTPException(status_code=404, detail="Device or Template not found")

    commands = template.commands.splitlines()
    result = await execute_config_on_device(device.dict(), commands)
    
    # Log the result
    log = LogEntry(
        device_id=device.id,
        device_name=device.name,
        command_set=template.name,
        output=result["output"],
        status=result["status"]
    )
    session.add(log)
    session.commit()
    
    return result

@app.get("/logs/", response_model=List[LogEntry])
def read_logs(session: Session = Depends(get_session)):
    # Order by timestamp descending
    logs = session.exec(select(LogEntry).order_by(LogEntry.timestamp.desc())).all()
    return logs

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
