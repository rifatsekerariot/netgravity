# NetGravity

NetGravity, ağ anahtarlarına (switch) kolayca bağlanıp otomatize edilmiş komut şablonları gönderebilmenizi sağlayan, tek bir taşınabilir `.exe` dosyası olarak çalışan modern bir ağ yönetim aracıdır.

## Özellikler

* **Tek Tıkla Komut Gönderimi**: İstediğiniz switchleri ve komut şablonlarını sisteme ekleyin, saniyeler içinde binlerce satır konfigürasyonu cihaza basın.
* **Güvenli Şifreleme**: Cihaz parolalarınız ve özel bilgileriniz yerel SQLite veritabanında AES-256 ile şifrelenerek saklanır.
* **Ayrıntılı İşlem Kayıtları**: Gerçekleşen (Başarılı / Başarısız) komut gönderimlerini ve konsol çıktılarını "Log Kayıtları" ekranından inceleyin.
* **Kurulum Gerektirmez**: Önceden derlenmiş **`dist/main.exe`** dosyasını çalıştırarak hiçbir bağımlılık kurmadan, anında kullanmaya başlayabilirsiniz.
* **Geniş Destek Yelpazesi**: Arka planda SSH için **Netmiko** kütüphanesini kullanır (Cisco, HP, Huawei ve düzinelerce diğer markayı destekler).

## Kullanım

Eğer doğrudan kullanmak istiyorsanız:

1. `dist` klasörü içerisindeki **`main.exe`** dosyasını çalıştırın.
2. Açılan pencerede yeni bir switch ekleyin ve IP, Kullanıcı Adı ve Şifre bilgilerinizi girin.
3. Sol menüden bir şablon oluşturun (örn: "Yedek Al" veya "Vlan Ekle").
4. Switches menüsüne geri dönüp şablonunuzu seçerek **Play** tuşuna basın. Çıktıları Log Kayıtlarından takip edin.

### Geliştiriciler İçin

Kodu kendiniz derlemek veya değiştirmek isterseniz:

1. Python bağımlılıklarını kurun: `pip install fastapi uvicorn netmiko sqlmodel cryptography pywebview`
2. Frontend klasöründeki React bağımlılıklarını yükleyin: `cd frontend && npm install && npm run build`
3. Projeyi lokal başlatın: `python main.py`
4. Tekrar EXE haline getirmek için: `pyinstaller --noconfirm --onefile --windowed --add-data "frontend/dist;dist" main.py`

***

**Teknolojiler:** React, Vite, Tailwind CSS, FastAPI, SQLModel, Netmiko, PyInstaller.
