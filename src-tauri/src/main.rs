mod models;

use models::PortInfo;

#[tauri::command]
fn get_ports() -> Vec<PortInfo> {
    vec![
        PortInfo {
            port: 8080,
            protocol: "TCP".to_string(),
            pid: 1234,
            process_name: "node.exe".to_string(),
            local_address: "127.0.0.1".to_string(),
            state: "LISTENING".to_string(),
        },
        PortInfo {
            port: 443,
            protocol: "TCP".to_string(),
            pid: 5678,
            process_name: "chrome.exe".to_string(),
            local_address: "0.0.0.0".to_string(),
            state: "ESTABLISHED".to_string(),
        }
    ]
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_ports])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
