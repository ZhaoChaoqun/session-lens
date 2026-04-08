use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::{self, File};
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::time::SystemTime;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,
    pub encoded_path: String,
    pub session_count: usize,
    pub last_active: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionMeta {
    pub id: String,
    pub project: String,
    pub project_path: String,
    pub timestamp: i64,
    pub summary: String,
    pub message_count: usize,
    pub branch: String,
    pub cwd: String,
    pub file_size: u64,
    pub input_tokens: u64,
    pub output_tokens: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversationMessage {
    pub role: String,
    pub content: Value,
    pub timestamp: Option<String>,
    pub model: Option<String>,
    pub uuid: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Conversation {
    pub id: String,
    pub messages: Vec<ConversationMessage>,
}

/// Extract human-readable project name from encoded directory name.
pub fn extract_project_name(encoded: &str) -> String {
    // Remove --crew-roles-* suffix
    let cleaned = regex::Regex::new(r"--crew-roles-.*$")
        .unwrap()
        .replace(encoded, "")
        .to_string();

    let parts: Vec<&str> = cleaned.split('-').filter(|s| !s.is_empty()).collect();

    if parts.is_empty() {
        return "unknown".to_string();
    }

    // Find the last meaningful segment after known prefixes
    let known_prefixes = ["Users", "Documents", "Github", "home"];
    let mut last_prefix_idx = 0;
    for (i, part) in parts.iter().enumerate() {
        if known_prefixes.contains(part) {
            last_prefix_idx = i + 1;
        }
    }

    if last_prefix_idx >= parts.len() {
        return "~ (home)".to_string();
    }

    parts[last_prefix_idx..].join("-")
}

/// Decode the encoded project path back to a filesystem path.
pub fn decode_project_path(encoded: &str) -> String {
    let cleaned = regex::Regex::new(r"--crew-roles-.*$")
        .unwrap()
        .replace(encoded, "")
        .to_string();

    if cleaned.is_empty() || cleaned == "-" {
        return "/".to_string();
    }

    let path = cleaned.replacen('-', "/", cleaned.len());

    if path.starts_with('/') {
        path
    } else {
        format!("/{}", path)
    }
}

/// Scan ~/.claude/projects/ and return project list.
pub fn scan_projects(base_dir: &Path) -> Vec<ProjectInfo> {
    let mut projects: Vec<ProjectInfo> = Vec::new();

    let entries = match fs::read_dir(base_dir) {
        Ok(e) => e,
        Err(_) => return projects,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let dir_name = match path.file_name().and_then(|n| n.to_str()) {
            Some(n) => n.to_string(),
            None => continue,
        };

        // Count .jsonl files (excluding subagents)
        let mut session_count = 0_usize;
        let mut last_active: i64 = 0;

        if let Ok(files) = fs::read_dir(&path) {
            for file in files.flatten() {
                let fpath = file.path();
                if fpath.extension().and_then(|e| e.to_str()) == Some("jsonl") {
                    session_count += 1;
                    if let Ok(meta) = fs::metadata(&fpath) {
                        if let Ok(mtime) = meta.modified() {
                            let ts = mtime
                                .duration_since(SystemTime::UNIX_EPOCH)
                                .unwrap_or_default()
                                .as_millis() as i64;
                            if ts > last_active {
                                last_active = ts;
                            }
                        }
                    }
                }
            }
        }

        if session_count == 0 {
            continue;
        }

        let name = extract_project_name(&dir_name);
        let decoded_path = decode_project_path(&dir_name);

        projects.push(ProjectInfo {
            name,
            path: decoded_path,
            encoded_path: dir_name,
            session_count,
            last_active,
        });
    }

    projects.sort_by(|a, b| b.last_active.cmp(&a.last_active));
    projects
}

/// Scan .jsonl files in a project directory and extract session metadata.
pub fn scan_sessions(project_dir: &Path) -> Vec<SessionMeta> {
    let mut sessions: Vec<SessionMeta> = Vec::new();

    let entries = match fs::read_dir(project_dir) {
        Ok(e) => e,
        Err(_) => return sessions,
    };

    let project_name = project_dir
        .file_name()
        .and_then(|n| n.to_str())
        .map(|n| extract_project_name(n))
        .unwrap_or_else(|| "unknown".to_string());

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("jsonl") {
            continue;
        }

        let id = path
            .file_stem()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let file_size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
        let timestamp = fs::metadata(&path)
            .and_then(|m| m.modified())
            .map(|t| {
                t.duration_since(SystemTime::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as i64
            })
            .unwrap_or(0);

        let meta = extract_session_meta(&path);

        sessions.push(SessionMeta {
            id,
            project: project_name.clone(),
            project_path: project_dir.to_string_lossy().to_string(),
            timestamp,
            summary: meta.summary,
            message_count: meta.message_count,
            branch: meta.branch,
            cwd: meta.cwd,
            file_size,
            input_tokens: meta.input_tokens,
            output_tokens: meta.output_tokens,
        });
    }

    sessions.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    sessions
}

struct ExtractedMeta {
    summary: String,
    message_count: usize,
    branch: String,
    cwd: String,
    input_tokens: u64,
    output_tokens: u64,
}

/// Extract metadata from a JSONL file by reading up to N lines.
fn extract_session_meta(path: &Path) -> ExtractedMeta {
    let mut meta = ExtractedMeta {
        summary: String::new(),
        message_count: 0,
        branch: String::new(),
        cwd: String::new(),
        input_tokens: 0,
        output_tokens: 0,
    };

    let file = match File::open(path) {
        Ok(f) => f,
        Err(_) => return meta,
    };

    let reader = BufReader::new(file);
    let mut found_summary = false;
    let max_lines = 150;

    for (i, line) in reader.lines().enumerate() {
        if i >= max_lines && found_summary {
            break;
        }

        let line = match line {
            Ok(l) => l,
            Err(_) => continue,
        };

        if line.trim().is_empty() {
            continue;
        }

        let entry: Value = match serde_json::from_str(&line) {
            Ok(v) => v,
            Err(_) => continue,
        };

        let entry_type = entry.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match entry_type {
            "user" => {
                meta.message_count += 1;

                if meta.branch.is_empty() {
                    if let Some(branch) = entry.get("gitBranch").and_then(|b| b.as_str()) {
                        meta.branch = branch.to_string();
                    }
                }
                if meta.cwd.is_empty() {
                    if let Some(cwd) = entry.get("cwd").and_then(|c| c.as_str()) {
                        meta.cwd = cwd.to_string();
                    }
                }

                if !found_summary {
                    if let Some(summary) = extract_user_summary(&entry) {
                        if !summary.is_empty() {
                            meta.summary = summary;
                            found_summary = true;
                        }
                    }
                }
            }
            "assistant" => {
                meta.message_count += 1;

                if let Some(usage) = entry.get("message").and_then(|m| m.get("usage")) {
                    if let Some(input) = usage.get("input_tokens").and_then(|t| t.as_u64()) {
                        meta.input_tokens += input;
                    }
                    if let Some(output) = usage.get("output_tokens").and_then(|t| t.as_u64()) {
                        meta.output_tokens += output;
                    }
                }
            }
            _ => {}
        }
    }

    if meta.summary.is_empty() {
        meta.summary = "(empty session)".to_string();
    }

    meta
}

/// Extract a clean summary from a user message entry.
fn extract_user_summary(entry: &Value) -> Option<String> {
    let content = entry.get("message")?.get("content")?;

    let text = if let Some(s) = content.as_str() {
        s.to_string()
    } else if let Some(arr) = content.as_array() {
        arr.iter().find_map(|block| {
            if block.get("type")?.as_str()? == "text" {
                block.get("text")?.as_str().map(|s| s.to_string())
            } else {
                None
            }
        })?
    } else {
        return None;
    };

    let trimmed = text.trim();

    // Skip slash commands
    if trimmed.starts_with('/') && !trimmed.contains('\n') {
        return None;
    }

    let cleaned = strip_xml_tags(trimmed);
    let cleaned = cleaned.trim();

    if cleaned.is_empty() {
        return None;
    }

    let summary = if cleaned.len() > 200 {
        format!("{}...", &cleaned[..200])
    } else {
        cleaned.to_string()
    };

    Some(summary)
}

/// Strip XML-like tags from text.
fn strip_xml_tags(text: &str) -> String {
    regex::Regex::new(r"<[^>]+>")
        .unwrap()
        .replace_all(text, "")
        .to_string()
}

/// Parse a full JSONL session file into conversation messages.
pub fn parse_conversation(session_path: &Path) -> Conversation {
    let id = session_path
        .file_stem()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let file = match File::open(session_path) {
        Ok(f) => f,
        Err(_) => {
            return Conversation {
                id,
                messages: Vec::new(),
            };
        }
    };

    let reader = BufReader::new(file);
    let mut messages: Vec<ConversationMessage> = Vec::new();

    for line in reader.lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => continue,
        };

        if line.trim().is_empty() {
            continue;
        }

        let entry: Value = match serde_json::from_str(&line) {
            Ok(v) => v,
            Err(_) => continue,
        };

        let entry_type = entry.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match entry_type {
            "user" => {
                let msg = match entry.get("message") {
                    Some(m) => m,
                    None => continue,
                };
                let content = msg.get("content").cloned().unwrap_or(Value::Null);

                // Skip pure tool_result messages
                if is_tool_result_only(&content) {
                    continue;
                }

                messages.push(ConversationMessage {
                    role: "user".to_string(),
                    content,
                    timestamp: entry.get("timestamp").and_then(|t| t.as_str()).map(String::from),
                    model: None,
                    uuid: entry.get("uuid").and_then(|u| u.as_str()).map(String::from),
                });
            }
            "assistant" => {
                let msg = match entry.get("message") {
                    Some(m) => m,
                    None => continue,
                };
                let content = msg.get("content").cloned().unwrap_or(Value::Null);
                let model = msg.get("model").and_then(|m| m.as_str()).map(String::from);
                let uuid = entry.get("uuid").and_then(|u| u.as_str()).map(String::from);
                let parent_uuid = entry.get("parentUuid").and_then(|u| u.as_str()).map(String::from);

                // Deduplicate streaming: if last msg is assistant with matching parentUuid, replace
                if let Some(last) = messages.last() {
                    if last.role == "assistant" {
                        if let (Some(ref last_uuid), Some(ref parent)) = (&last.uuid, &parent_uuid)
                        {
                            if last_uuid == parent {
                                messages.pop();
                            }
                        }
                    }
                }

                messages.push(ConversationMessage {
                    role: "assistant".to_string(),
                    content,
                    timestamp: entry.get("timestamp").and_then(|t| t.as_str()).map(String::from),
                    model,
                    uuid,
                });
            }
            _ => {}
        }
    }

    Conversation { id, messages }
}

/// Check if content is only tool_result blocks.
fn is_tool_result_only(content: &Value) -> bool {
    if let Some(arr) = content.as_array() {
        !arr.is_empty()
            && arr
                .iter()
                .all(|block| block.get("type").and_then(|t| t.as_str()) == Some("tool_result"))
    } else {
        false
    }
}

/// Get the Claude projects base directory.
pub fn get_projects_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(".claude").join("projects"))
}
