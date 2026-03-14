# Port Inspector

Port Inspector is a cross-platform desktop application that shows which processes are using network ports on your computer. It provides a simple graphical interface so you can inspect port usage without the command line.

---

## Functional Requirements

The application must provide the following features:

- **Port listing:** show active TCP and UDP ports with port number, protocol, PID, process name, local address, and connection state when available.
- **Refresh:** re-scan the system and update results on demand without blocking the UI.
- **Search & filter:** filter by port number, process name, or protocol.
- **Process details:** display process name, PID, executable path (if available), and ports used by the process.
- **Terminate process:** allow terminating a selected process only after explicit user confirmation.
- **Multi-port handling:** correctly show one process using multiple ports and multiple processes using different ports.

---

## Non-Functional Requirements

- **Platforms:** Windows, macOS, and Linux with consistent behavior across them.
- **Performance:** list and display port information within ~1 second under normal conditions; refresh should not noticeably block the UI.
- **Usability:** clean, minimal UI; core actions (refresh, search, terminate) must be easy to find.
- **Reliability:** surface clear, actionable error messages for permission issues, inaccessible system data, or termination failures.
- **Security & privacy:** all operations run locally; the app must not transmit system information over the internet; destructive actions require confirmation.
- **Packaging:** deliver standalone executables for each platform so users don't need to install extra dependencies.
- **Resource use:** low idle CPU; target memory under ~200 MB during normal operation.
- **Maintainability:** modular codebase with platform-specific logic separated from core logic.

---

## Platform & Distribution

Port Inspector runs entirely on the user's machine and will be distributed as standalone executables for Windows, macOS, and Linux.

---

## High-Level Design

Port Inspector is implemented using the **Tauri architecture**, combining a **Rust backend** with a **web-based user interface**. This keeps the application lightweight while providing a modern GUI. The app is distributed as a native desktop executable for Windows, macOS, and Linux.

### Architecture Overview

The system is divided into a few main components:

1. **User Interface (Frontend)** — built with web technologies (HTML/CSS/JS). Shows port lists, filters, and controls for refresh and termination.
2. **Application Controller** — coordinates UI actions and backend commands.
3. **Port Scanner Service (Rust backend)** — retrieves open ports, protocols, and associated processes from the OS.
4. **Platform Adapters** — OS-specific adapters normalize raw system data into a common structure.

Adapters:

- **Windows Adapter**
- **Linux Adapter**
- **macOS Adapter**

### Data Flow

1. User triggers an action in the UI (e.g., Refresh).
2. Frontend sends a command to the Rust backend via Tauri commands.
3. Backend calls the Port Scanner Service.
4. The appropriate platform adapter reads OS networking/process data.
5. Data is normalized and returned to the frontend.
6. UI updates the displayed port list.

### Folder Structure (High-Level)

```
port-inspector/
│
├── src/                # Frontend (UI)
│   ├── components/
│   ├── pages/
│   └── main.ts
│
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── scanner/    # Port scanning logic
│   │   ├── adapters/   # OS-specific adapters
│   │   └── commands/   # Tauri commands exposed to the UI
│
│   └── main.rs
│
└── README.md
```

This layout separates the frontend UI, core scanning logic, and platform-specific system code to improve maintainability.

---

## Low-Level Design

This section describes the internal implementation of the application.

### Backend (Rust)

The Rust backend retrieves port information from the operating system and exposes it to the frontend through Tauri commands.

#### Port Scanner

The scanner collects active port data by executing operating system commands.

Commands used:

- **Windows:** `netstat -ano`
- **Linux:** `ss -tulnp`
- **macOS:** `lsof -i -P -n`

These commands are executed using Rust's `std::process::Command`. The scanner runs every **1 second** to keep the UI updated.

#### Platform Adapters

Each operating system returns port data in a different format. Platform adapters parse the command output and convert it into a common structure.

Adapters:

- WindowsAdapter
- LinuxAdapter
- MacAdapter

Each adapter extracts:

- Port number
- Protocol
- PID
- Local address
- Connection state

#### Process Service

Handles process-related actions such as retrieving process information and terminating processes.

Termination commands:

- **Windows:** `taskkill /PID <pid> /F`
- **Linux/macOS:** `kill <pid>`

The UI must confirm before a process is terminated.

#### Data Model

All results are normalized into a shared structure before being sent to the frontend.

```rust id="q1pkdi"
pub struct PortInfo {
	pub port: u16,
	pub protocol: String,
	pub pid: u32,
	pub process_name: String,
	pub local_address: String,
	pub state: String
}
```

The model is designed to allow future metrics such as CPU usage, memory usage, or network statistics.

#### Tauri Commands

The backend exposes functionality through Tauri commands.

Examples:

- `get_ports()` – returns listening ports
- `kill_process(pid)` – terminates a process
- `get_process_details(pid)` – returns process information

### Frontend (Angular)

The frontend is an Angular application running inside the Tauri WebView.

Responsibilities:

- Display the port list
- Filter and search ports
- Show process details
- Trigger refresh and process termination

The frontend polls the backend every **1 second** to update port information.

### Folder Structure

```text id="7rr33d"
port-inspector/
│
├── frontend/            # Angular UI
│   └── src/app/
│       ├── components/
│       ├── services/
│       └── models/
│
├── src-tauri/           # Rust backend
│   └── src/
│       ├── scanner/
│       ├── adapters/
│       ├── process/
│       ├── commands/
│       └── models/
│
└── README.md
```
