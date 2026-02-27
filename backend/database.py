from typing import Optional, List
from sqlmodel import Field, SQLModel, create_engine, Session, select
from datetime import datetime

class Device(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    ip: str = Field(unique=True)
    username: str
    encrypted_password: str
    device_type: str = Field(default="cisco_ios") # Default for Netmiko
    group: Optional[str] = Field(default="Default")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Template(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    commands: str # Multiline string of config commands
    created_at: datetime = Field(default_factory=datetime.utcnow)

class LogEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    device_id: int
    device_name: str
    command_set: str
    output: str
    status: str # "Success" or "Error"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

sqlite_file_name = "netgravity.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

if __name__ == "__main__":
    create_db_and_tables()
    print("Database and tables created.")
