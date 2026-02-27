import os
from cryptography.fernet import Fernet
from typing import Optional

# Path to the key file
KEY_FILE = "secret.key"

def load_or_generate_key() -> bytes:
    """Loads the existing key or generates and saves a new one."""
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as key_file:
            return key_file.read()
    else:
        key = Fernet.generate_key()
        with open(KEY_FILE, "wb") as key_file:
            key_file.write(key)
        return key

def encrypt_password(password: str) -> str:
    """Encrypts a string password using AES-256 (Fernet)."""
    key = load_or_generate_key()
    f = Fernet(key)
    encrypted_pwd = f.encrypt(password.encode())
    return encrypted_pwd.decode()

def decrypt_password(encrypted_pwd: str) -> str:
    """Decrypts a Fernet encrypted password string."""
    key = load_or_generate_key()
    f = Fernet(key)
    decrypted_pwd = f.decrypt(encrypted_pwd.encode())
    return decrypted_pwd.decode()

if __name__ == "__main__":
    # Quick test
    test_pwd = "my_secret_switch_pwd_123"
    encrypted = encrypt_password(test_pwd)
    decrypted = decrypt_password(encrypted)
    print(f"Original: {test_pwd}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
    assert test_pwd == decrypted
