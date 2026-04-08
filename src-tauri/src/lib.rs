pub mod cache;
pub mod parser;

use parser::{Conversation, ProjectInfo, SessionMeta};
use std::path::PathBuf;

#[tauri::command]
fn list_projects() -> Result<Vec<ProjectInfo>, String> {
    let base_dir = parser::get_projects_dir().ok_or("Cannot find Claude projects directory")?;

    if !base_dir.exists() {
        return Ok(Vec::new());
    }

    Ok(parser::scan_projects(&base_dir))
}

#[tauri::command]
fn list_sessions(project_encoded_path: &str) -> Result<Vec<SessionMeta>, String> {
    let base_dir = parser::get_projects_dir().ok_or("Cannot find Claude projects directory")?;
    let project_dir = base_dir.join(project_encoded_path);

    if !project_dir.exists() {
        return Err(format!("Project directory not found: {}", project_encoded_path));
    }

    Ok(parser::scan_sessions(&project_dir))
}

#[tauri::command]
fn get_conversation(session_path: &str) -> Result<Conversation, String> {
    let path = PathBuf::from(session_path);

    if !path.exists() {
        return Err(format!("Session file not found: {}", session_path));
    }

    Ok(parser::parse_conversation(&path))
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_projects,
            list_sessions,
            get_conversation,
            get_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
