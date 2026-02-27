import React, { useState, useEffect } from 'react';
import { Settings, Shield, Plus, Server, FileText, Play, Terminal, Database, Edit, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

const App = () => {
    const [view, setView] = useState('devices');
    const [devices, setDevices] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchDevices();
        fetchTemplates();
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`${API_BASE}/logs/`);
            setLogs(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchDevices = async () => {
        try {
            const res = await axios.get(`${API_BASE}/devices/`);
            setDevices(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/templates/`);
            setTemplates(res.data);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex h-screen text-slate-200">
            {/* Sidebar */}
            <div className="w-64 glass flex flex-col p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-8">
                    <Shield className="w-8 h-8 text-purple-500" />
                    <span className="text-xl font-bold tracking-tight">NetGravity</span>
                </div>

                <button onClick={() => setView('devices')} className={`flex items-center space-x-3 p-3 rounded-lg transition ${view === 'devices' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-white/5'}`}>
                    <Server className="w-5 h-5" />
                    <span>Switches</span>
                </button>
                <button onClick={() => setView('templates')} className={`flex items-center space-x-3 p-3 rounded-lg transition ${view === 'templates' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-white/5'}`}>
                    <FileText className="w-5 h-5" />
                    <span>Şablonlar</span>
                </button>
                <button onClick={() => setView('logs')} className={`flex items-center space-x-3 p-3 rounded-lg transition ${view === 'logs' ? 'bg-purple-600/20 text-purple-400' : 'hover:bg-white/5'}`}>
                    <Terminal className="w-5 h-5" />
                    <span>Log Kayıtları</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8 bg-black/40">
                {view === 'devices' && <DeviceView devices={devices} onRefresh={fetchDevices} templates={templates} onLogRefresh={fetchLogs} />}
                {view === 'templates' && <TemplateView templates={templates} onRefresh={fetchTemplates} />}
                {view === 'logs' && <LogView logs={logs} onRefresh={fetchLogs} />}
            </div>
        </div>
    );
};

const DeviceView = ({ devices, onRefresh, templates, onLogRefresh }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [newDevice, setNewDevice] = useState({ name: '', ip: '', username: '', encrypted_password: '', device_type: 'cisco_ios' });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editMode && editId) {
                await axios.put(`${API_BASE}/devices/${editId}`, newDevice);
            } else {
                await axios.post(`${API_BASE}/devices/`, newDevice);
            }
            setShowAdd(false);
            setEditMode(false);
            setEditId(null);
            setNewDevice({ name: '', ip: '', username: '', encrypted_password: '', device_type: 'cisco_ios' });
            onRefresh();
        } catch (err) { alert("Hata: " + err.message); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Switch Yönetimi</h1>
                <button onClick={() => {
                    setNewDevice({ name: '', ip: '', username: '', encrypted_password: '', device_type: 'cisco_ios' });
                    setEditMode(false);
                    setEditId(null);
                    setShowAdd(!showAdd);
                }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition">
                    {showAdd ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{showAdd ? 'Kapat' : 'Switch Ekle'}</span>
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleSave} className="glass p-6 rounded-xl grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
                    <input placeholder="Cihaz Adı" value={newDevice.name} className="bg-black/50 border border-white/10 p-2 rounded" onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} required />
                    <input placeholder="IP Adresi" value={newDevice.ip} className="bg-black/50 border border-white/10 p-2 rounded" onChange={e => setNewDevice({ ...newDevice, ip: e.target.value })} required />
                    <input placeholder="Kullanıcı Adı" value={newDevice.username} className="bg-black/50 border border-white/10 p-2 rounded" onChange={e => setNewDevice({ ...newDevice, username: e.target.value })} required />
                    <input type="password" placeholder={editMode ? "Yeni Parola (boş bırakılırsa değişmez)" : "Parola"} className="bg-black/50 border border-white/10 p-2 rounded" onChange={e => setNewDevice({ ...newDevice, encrypted_password: e.target.value })} required={!editMode} />
                    <select value={newDevice.device_type} className="bg-black/50 border border-white/10 p-2 rounded" onChange={e => setNewDevice({ ...newDevice, device_type: e.target.value })}>
                        <option value="cisco_ios">Cisco IOS</option>
                        <option value="hp_procurve">HP ProCurve</option>
                        <option value="huawei">Huawei</option>
                    </select>
                    <div className="col-span-2 flex justify-end">
                        <button type="submit" className="bg-green-600 px-6 py-2 rounded">{editMode ? 'Güncelle' : 'Kaydet'}</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map(dev => (
                    <div key={dev.id} className="glass p-5 rounded-2xl hover:border-purple-500/50 transition cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{dev.name}</h3>
                                <p className="text-slate-400 text-sm">{dev.ip}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => {
                                    setEditMode(true);
                                    setEditId(dev.id);
                                    setNewDevice({
                                        name: dev.name,
                                        ip: dev.ip,
                                        username: dev.username,
                                        encrypted_password: '',
                                        device_type: dev.device_type
                                    });
                                    setShowAdd(true);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} className="p-1 hover:bg-white/10 rounded transition text-blue-400">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <Server className="w-6 h-6 text-slate-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <select id={`tpl-${dev.id}`} className="flex-1 bg-white/5 border border-white/10 text-xs rounded p-1">
                                <option value="">Şablon Seç...</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button
                                onClick={async () => {
                                    const tplId = (document.getElementById(`tpl-${dev.id}`) as HTMLSelectElement).value;
                                    if (!tplId) return alert("Şablon seçin");
                                    try {
                                        const res = await axios.post(`${API_BASE}/execute/${dev.id}/${tplId}`);
                                        alert(res.data.status + ":\n" + res.data.output);
                                        onLogRefresh(); // Refresh logs after execution
                                    } catch (e) { alert("Hata: " + e.message); }
                                }}
                                className="bg-purple-600/30 hover:bg-purple-600 text-white p-2 rounded transition">
                                <Play className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TemplateView = ({ templates, onRefresh }) => {
    const [newTemplate, setNewTemplate] = useState({ name: '', commands: '' });

    const handleSave = async () => {
        try {
            await axios.post(`${API_BASE}/templates/`, newTemplate);
            onRefresh();
            setNewTemplate({ name: '', commands: '' });
        } catch (e) { alert(e.message); }
    };

    return (
        <div className="space-y-6 text-slate-200">
            <h1 className="text-3xl font-bold">Konfigürasyon Şablonları</h1>
            <div className="glass p-6 rounded-xl space-y-4">
                <input placeholder="Şablon Adı (Örn: VLAN 10 Oluştur)" className="w-full bg-black/50 border border-white/10 p-2 rounded"
                    value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} />
                <textarea placeholder="Komutları buraya yazın (her satıra bir komut)" className="w-full h-48 bg-black/50 border border-white/10 p-2 rounded font-mono text-sm"
                    value={newTemplate.commands} onChange={e => setNewTemplate({ ...newTemplate, commands: e.target.value })} />
                <button onClick={handleSave} className="bg-purple-600 px-6 py-2 rounded">Şablonu Kaydet</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {templates.map(t => (
                    <div key={t.id} className="glass p-4 rounded-lg">
                        <h4 className="font-bold border-b border-white/10 pb-2 mb-2">{t.name}</h4>
                        <pre className="text-xs text-slate-400 overflow-hidden">{t.commands.substring(0, 100)}...</pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LogView = ({ logs, onRefresh }) => (
    <div className="space-y-6 text-slate-200">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">İşlem Günlükleri</h1>
            <button onClick={onRefresh} className="bg-purple-600/30 hover:bg-purple-600 px-4 py-2 rounded-lg transition">Yenile</button>
        </div>
        <p className="text-slate-400">Anahtarlara (switch) gönderilen komutların geçmişi ve sonuçları.</p>

        <div className="space-y-4">
            {logs.length === 0 ? (
                <div className="glass p-8 text-center text-slate-500 rounded-xl">Henüz log kaydı bulunmuyor.</div>
            ) : (
                logs.map(log => (
                    <div key={log.id} className={`glass p-5 rounded-xl border-l-4 ${log.status === 'Success' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg">{log.device_name} <span className="text-xs text-slate-400 bg-black/50 px-2 py-1 rounded ml-2">{log.command_set}</span></h3>
                                <p className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'Success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {log.status}
                            </span>
                        </div>
                        <div className="mt-3 bg-black/60 p-3 rounded font-mono text-xs overflow-auto max-h-48 text-slate-300">
                            <pre className="whitespace-pre-wrap">{log.output}</pre>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

export default App;
