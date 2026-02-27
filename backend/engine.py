import asyncio
from typing import List, Dict
from netmiko import ConnectHandler, NetmikoTimeoutException, NetmikoAuthenticationException
from backend.security import decrypt_password

async def execute_config_on_device(device_info: Dict, commands: List[str]) -> Dict:
    """
    Executes a list of configuration commands on a single device using Netmiko.
    Runs in a thread pool to avoid blocking the event loop.
    """
    loop = asyncio.get_event_loop()
    
    # Decrypt password before connecting
    try:
        decrypted_pwd = decrypt_password(device_info["encrypted_password"])
    except Exception as e:
        return {"status": "Error", "output": f"Decryption failed: {str(e)}"}

    netmiko_params = {
        "device_type": device_info["device_type"],
        "host": device_info["ip"],
        "username": device_info["username"],
        "password": decrypted_pwd,
        "secret": decrypted_pwd, # Often same for enable
        "timeout": 30, # Increased timeout for slow devices
        "global_delay_factor": 1.5, # Slightly longer wait times between commands
        # "fast_cli": True # Optional: can speed up execution on some devices
    }

    def _execute():
        output = ""
        try:
            with ConnectHandler(**netmiko_params) as net_connect:
                try:
                    net_connect.enable()
                except Exception as eval_err:
                     output += f"[UYARI] Enable moduna geçilemedi veya gerek yok: {str(eval_err)}\n"
                
                output += net_connect.send_config_set(commands)
                # Save config attempt (optional, some devices it's "write mem")
                # output += net_connect.save_config() 
                return {"status": "Success", "output": output}
        except NetmikoTimeoutException:
            return {"status": "Error", "output": f"Zaman aşımı! Cihaza ulaşılamıyor (Timeout). IP: {device_info['ip']}"}
        except NetmikoAuthenticationException:
             return {"status": "Error", "output": f"Kimlik doğrulama hatası! Kullanıcı adı veya parola yanlış. IP: {device_info['ip']}"}
        except Exception as e:
            return {"status": "Error", "output": f"Beklenmeyen bir hata oluştu: {str(e)}"}

    return await loop.run_in_executor(None, _execute)

async def run_batch_config(devices: List[Dict], commands: List[str]):
    """Runs commands on multiple devices in parallel."""
    tasks = [execute_config_on_device(dev, commands) for dev in devices]
    return await asyncio.gather(*tasks)
